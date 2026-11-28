/* Coralli · utilidades do Mercado Pago (Cloudflare Pages Functions)
   O Access Token NUNCA fica no código: vai como secret MP_ACCESS_TOKEN no Cloudflare
   (Pages > demos-staypulse > Settings > Variables and Secrets). */
export const MP = 'https://api.mercadopago.com';

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export async function mp(env, path, init = {}) {
  const r = await fetch(MP + path, Object.assign({}, init, {
    headers: Object.assign({ authorization: 'Bearer ' + env.MP_ACCESS_TOKEN, 'content-type': 'application/json' }, init.headers || {})
  }));
  let body = null; try { body = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, body };
}

/* resumo de um pagamento, sem dados sensíveis */
export const resumo = p => ({
  pedido_id: (p.metadata && p.metadata.pedido_id) || null,
  id: p.id, status: p.status, detalhe: p.status_detail, metodo: p.payment_type_id, meio: p.payment_method_id,
  valor: p.transaction_amount, parcelas: p.installments, ref: p.external_reference,
  pedido: (p.metadata && p.metadata.pedido) || String(p.external_reference || '').split('-')[0], data: p.date_approved || p.date_created
});

/* ---------- banco (Supabase) com a chave secreta: SUPABASE_URL + SUPABASE_SECRET_KEY ---------- */
export const LOJA = 'coralli';
export const temBanco = env => !!(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY);
export async function banco(env, caminho, init = {}) {
  const key = env.SUPABASE_SECRET_KEY;
  const headers = Object.assign({ apikey: key, 'content-type': 'application/json' }, /^sb_/.test(key) ? {} : { authorization: 'Bearer ' + key }, init.headers || {});
  const r = await fetch(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + caminho, Object.assign({}, init, { headers }));
  let body = null; try { body = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, body };
}
export const pedidoLeve = r => r && Object.assign({}, r.cliente || {}, {
  id: r.id, num: r.num, data: Date.parse(r.criado || '') || Date.now(), cupom: r.cupom || '', desconto: +r.desconto || 0,
  itens: (r.itens || []).map(i => Object.assign({}, i, { id: i.produto_id, preco: +i.preco }))
});
/* grava o resultado do pagamento no pedido (idempotente) */
export async function registrarPagamento(env, pg) {
  if (!temBanco(env) || !/^[0-9a-f-]{36}$/.test(pg.pedido_id || '')) return null;
  const upd = { pagamento: Object.assign({}, pg, { manual: false }), pago_em: pg.status === 'approved' ? (pg.data || new Date().toISOString()) : null };
  const r = await banco(env, `pedidos?id=eq.${pg.pedido_id}&loja_id=eq.${LOJA}`, { method: 'PATCH', body: JSON.stringify(upd), headers: { prefer: 'return=representation' } });
  if (!r.ok) console.log('Supabase PATCH erro', r.status, JSON.stringify(r.body));
  return r.ok && Array.isArray(r.body) ? r.body[0] : null;
}
