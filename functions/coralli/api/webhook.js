/* POST /coralli/api/webhook · aviso do Mercado Pago quando um pagamento muda de status.
   Se o secret MP_WEBHOOK_SECRET estiver configurado, a assinatura (x-signature) é conferida.
   Na demo o aviso só é registrado no log; na versão com banco de dados, marca o pedido como pago. */
import { json, mp, resumo, registrarPagamento } from './_mp.js';

async function assinaturaOk(request, env, dataId) {
  if (!env.MP_WEBHOOK_SECRET) return true;
  const sig = request.headers.get('x-signature') || '', reqId = request.headers.get('x-request-id') || '';
  const p = Object.fromEntries(sig.split(',').map(s => s.trim().split('=')));
  if (!p.ts || !p.v1) return false;
  const msg = `id:${dataId};request-id:${reqId};ts:${p.ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.MP_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  const hex = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === p.v1;
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  let b = {}; try { b = await request.json(); } catch (e) {}
  const tipo = b.type || url.searchParams.get('type') || url.searchParams.get('topic');
  const dataId = String((b.data && b.data.id) || url.searchParams.get('data.id') || url.searchParams.get('id') || '');
  if (tipo !== 'payment' || !/^\d+$/.test(dataId)) return json({ ok: true, ignorado: true });
  if (!(await assinaturaOk(request, env, dataId))) return json({ erro: 'assinatura inválida' }, 401);
  if (!env.MP_ACCESS_TOKEN) return json({ ok: true });
  const r = await mp(env, '/v1/payments/' + dataId);
  if (r.ok && r.body) { const pg = resumo(r.body); console.log('Coralli pagamento', JSON.stringify(pg)); await registrarPagamento(env, pg); }
  return json({ ok: true });
}
export const onRequestGet = () => json({ ok: true });
