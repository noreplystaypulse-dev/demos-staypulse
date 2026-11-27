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
  id: p.id, status: p.status, detalhe: p.status_detail, metodo: p.payment_type_id, meio: p.payment_method_id,
  valor: p.transaction_amount, parcelas: p.installments, ref: p.external_reference,
  pedido: (p.metadata && p.metadata.pedido) || String(p.external_reference || '').split('-')[0], data: p.date_approved || p.date_created
});
