/* GET /coralli/api/status?payment_id=123 · confirma no Mercado Pago se o pagamento foi aprovado
   (o site NÃO confia só nos parâmetros da URL de retorno). */
import { json, mp, resumo, registrarPagamento, pedidoLeve } from './_mp.js';

export async function onRequestGet({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) return json({ erro: 'Pagamento online não configurado' }, 503);
  const id = new URL(request.url).searchParams.get('payment_id') || '';
  if (!/^\d{5,20}$/.test(id)) return json({ erro: 'Pagamento inválido' }, 400);
  const r = await mp(env, '/v1/payments/' + id);
  if (!r.ok || !r.body) return json({ erro: 'Pagamento não encontrado' }, 404);
  if (r.body.metadata && r.body.metadata.loja && r.body.metadata.loja !== 'coralli') return json({ erro: 'Pagamento de outra loja' }, 403);
  const pg = resumo(r.body);
  const row = await registrarPagamento(env, pg);   // grava no pedido (se o banco estiver configurado)
  return json(Object.assign(pg, row ? { pedidoDados: pedidoLeve(row) } : {}));
}
