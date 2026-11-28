/* POST /coralli/api/pagar · cria o pagamento (Checkout Pro) do pedido do carrinho
   Recebe { pedido, itens:[{id,nome,cor,tam,qtd,preco}], cupom:{codigo,pct}, cliente:{nome,tel,cpf,email}, voltar }
   Devolve { url, ref, total } para levar a cliente ao Mercado Pago (Pix, cartão ou saldo). */
import { CATALOGO, CUPONS, PARCELAS } from './_catalogo.js';
import { json, mp, temBanco, banco, LOJA } from './_mp.js';

const VOLTAR_OK = [/^https:\/\/(www\.)?staypulse\.com\.br\//, /^https:\/\/([a-z0-9-]+\.)?demos-staypulse\.pages\.dev\//, /^https:\/\/(www\.)?usecoralli\.com\.br\//, /^http:\/\/localhost(:\d+)?\//];
const RESERVA_MIN = 30; // tempo para pagar; depois o link expira e as peças voltam

export async function onRequestPost({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) return json({ erro: 'O pagamento online ainda não foi ativado. Envie o pedido pelo WhatsApp.' }, 503);
  const producao = env.MODO === 'producao';
  let b; try { b = await request.json(); } catch (e) { return json({ erro: 'Pedido inválido' }, 400); }

  /* ===== com banco: o pedido já foi criado (e conferido) pelo banco; usamos só os dados dele ===== */
  if (temBanco(env) && b.pedido_id) return pagarPedidoDoBanco(env, request, b);
  if (temBanco(env) && producao) return json({ erro: 'Pedido inválido' }, 400);

  const itens = Array.isArray(b.itens) ? b.itens.slice(0, 200) : [];
  if (!itens.length) return json({ erro: 'O carrinho está vazio' }, 400);
  const pedido = String(b.pedido || '').replace(/\D/g, '').slice(0, 10) || String(Date.now()).slice(-6);

  /* preço SEMPRE do catálogo do servidor. Na demo, peças criadas só no painel (que ficam no celular)
     usam o preço enviado, com limite; na produção isso vem do banco de dados. */
  const linhas = [];
  for (const i of itens) {
    const qtd = Math.floor(Number(i.qtd));
    if (!(qtd >= 1 && qtd <= 999)) return json({ erro: 'Quantidade inválida' }, 400);
    const cat = CATALOGO[i.id];
    let preco = cat ? cat.preco : (producao ? NaN : Number(i.preco));
    if (!(preco > 0 && preco <= 5000)) return json({ erro: 'Peça indisponível: ' + String(i.nome || i.id).slice(0, 60) }, 400);
    const nome = (cat ? cat.nome : String(i.nome || 'Peça')).slice(0, 80);
    const extra = [i.cor, i.tam ? 'Tam. ' + i.tam : ''].filter(Boolean).map(x => String(x).slice(0, 30)).join(' · ');
    linhas.push({ id: String(i.id).slice(0, 40), nome: extra ? `${nome} · ${extra}` : nome, qtd, preco });
  }

  /* cupom: lista do servidor; na demo também aceita os cupons criados no painel (até 50%) */
  let pct = 0, cupom = '';
  if (b.cupom && b.cupom.codigo) {
    const c = CUPONS.find(x => x.codigo === String(b.cupom.codigo).toUpperCase());
    if (c) { pct = c.pct; cupom = c.codigo; }
    else if (!producao && Number(b.cupom.pct) > 0 && Number(b.cupom.pct) <= 50) { pct = Number(b.cupom.pct); cupom = String(b.cupom.codigo).toUpperCase().slice(0, 20); }
  }
  const fator = 1 - pct / 100;
  const items = linhas.map(l => ({ id: l.id, title: l.nome, quantity: l.qtd, unit_price: Math.round(l.preco * fator * 100) / 100, currency_id: 'BRL', category_id: 'fashion' }));
  const total = Math.round(items.reduce((a, i) => a + i.unit_price * i.quantity, 0) * 100) / 100;

  const voltar = String(b.voltar || '');
  if (!VOLTAR_OK.some(r => r.test(voltar))) return json({ erro: 'Endereço de retorno inválido' }, 400);
  const base = new URL(request.url); const api = base.origin + base.pathname.replace(/\/pagar$/, '');
  const ref = `${pedido}-${crypto.randomUUID().slice(0, 8)}`;
  const cli = b.cliente || {}, tel = String(cli.tel || '').replace(/\D/g, '').replace(/^55/, '');
  const cpf = String(cli.cpf || '').replace(/\D/g, '');
  const agora = new Date(), fim = new Date(agora.getTime() + RESERVA_MIN * 60000);
  const sep = voltar.includes('?') ? '&' : '?';

  const pref = {
    items,
    payer: Object.assign({ name: String(cli.nome || '').slice(0, 60) },
      tel.length >= 10 ? { phone: { area_code: tel.slice(0, 2), number: tel.slice(2) } } : {},
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cli.email || '') ? { email: cli.email } : {},
      cpf.length === 11 ? { identification: { type: 'CPF', number: cpf } } : cpf.length === 14 ? { identification: { type: 'CNPJ', number: cpf } } : {}),
    external_reference: ref,
    metadata: { pedido, loja: 'coralli', cupom },
    back_urls: { success: `${voltar}${sep}pagamento=ok`, pending: `${voltar}${sep}pagamento=pendente`, failure: `${voltar}${sep}pagamento=erro` },
    auto_return: 'approved',
    notification_url: `${api}/webhook`,
    statement_descriptor: 'CORALLI',
    payment_methods: { installments: PARCELAS, excluded_payment_types: [{ id: 'ticket' }] },
    expires: true, expiration_date_from: agora.toISOString(), expiration_date_to: fim.toISOString()
  };
  const r = await mp(env, '/checkout/preferences', { method: 'POST', body: JSON.stringify(pref), headers: { 'X-Idempotency-Key': ref } });
  if (!r.ok || !r.body || !r.body.init_point) {
    console.log('MP preference error', r.status, JSON.stringify(r.body));
    return json({ erro: 'Não foi possível abrir o pagamento agora. Tente de novo ou envie pelo WhatsApp.' }, 502);
  }
  return json({ url: r.body.init_point, ref, total, pct, expira: fim.toISOString() });
}

export const onRequest = () => json({ erro: 'Use POST' }, 405);

async function pagarPedidoDoBanco(env, request, b) {
  const id = String(b.pedido_id);
  if (!/^[0-9a-f-]{36}$/.test(id)) return json({ erro: 'Pedido inválido' }, 400);
  const voltar = String(b.voltar || '');
  if (!VOLTAR_OK.some(r => r.test(voltar))) return json({ erro: 'Endereço de retorno inválido' }, 400);
  const q = await banco(env, `pedidos?id=eq.${id}&loja_id=eq.${LOJA}&select=id,num,cliente,itens,subtotal,desconto,total,cupom,pagamento`);
  const ped = q.ok && Array.isArray(q.body) ? q.body[0] : null;
  if (!ped) return json({ erro: 'Pedido não encontrado' }, 404);
  if (ped.pagamento && ped.pagamento.status === 'approved') return json({ erro: 'Este pedido já está pago' }, 409);
  const sub = +ped.subtotal, total = +ped.total, fator = sub > 0 ? total / sub : 1;
  const items = (ped.itens || []).map(i => ({ id: String(i.produto_id), title: [i.nome, i.cor, i.tam ? 'Tam. ' + i.tam : ''].filter(Boolean).join(' · ').slice(0, 250), quantity: +i.qtd, unit_price: Math.round(+i.preco * fator * 100) / 100, currency_id: 'BRL', category_id: 'fashion' }));
  const cobrado = Math.round(items.reduce((a, i) => a + i.unit_price * i.quantity, 0) * 100) / 100;
  const base = new URL(request.url); const api = base.origin + base.pathname.replace(/\/pagar$/, '');
  const ref = `${ped.num}-${id.slice(0, 8)}`, cli = ped.cliente || {};
  const tel = String(cli.tel || '').replace(/\D/g, '').replace(/^55/, ''), doc = String(cli.cpf || '').replace(/\D/g, '');
  const agora = new Date(), fim = new Date(agora.getTime() + RESERVA_MIN * 60000), sep = voltar.includes('?') ? '&' : '?';
  const pref = {
    items,
    payer: Object.assign({ name: String(cli.nome || '').slice(0, 60) },
      tel.length >= 10 ? { phone: { area_code: tel.slice(0, 2), number: tel.slice(2) } } : {},
      doc.length === 11 ? { identification: { type: 'CPF', number: doc } } : doc.length === 14 ? { identification: { type: 'CNPJ', number: doc } } : {}),
    external_reference: ref,
    metadata: { pedido_id: id, pedido: String(ped.num), loja: LOJA, cupom: ped.cupom || '' },
    back_urls: { success: `${voltar}${sep}pagamento=ok`, pending: `${voltar}${sep}pagamento=pendente`, failure: `${voltar}${sep}pagamento=erro` },
    auto_return: 'approved', notification_url: `${api}/webhook`, statement_descriptor: 'CORALLI',
    payment_methods: { installments: PARCELAS, excluded_payment_types: [{ id: 'ticket' }] },
    expires: true, expiration_date_from: agora.toISOString(), expiration_date_to: fim.toISOString()
  };
  const r = await mp(env, '/checkout/preferences', { method: 'POST', body: JSON.stringify(pref), headers: { 'X-Idempotency-Key': ref + '-' + agora.getTime() } });
  if (!r.ok || !r.body || !r.body.init_point) { console.log('MP preference error', r.status, JSON.stringify(r.body)); return json({ erro: 'Não foi possível abrir o pagamento agora. Tente de novo ou envie pelo WhatsApp.' }, 502); }
  await banco(env, `pedidos?id=eq.${id}&loja_id=eq.${LOJA}`, { method: 'PATCH', body: JSON.stringify({ pagamento: { status: 'iniciado', ref, valor: cobrado, manual: false } }) });
  return json({ url: r.body.init_point, ref, total: cobrado, expira: fim.toISOString() });
}
