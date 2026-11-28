/* Coralli · etiqueta / ficha do pedido 10x15 cm (800 x 1200 px, 203 dpi)
   Desenha a versão digital do talão "PEDIDO" da Coralli num <canvas>.
   Etiqueta.draw(canvas, pedido, { logo }) · Etiqueta.png(canvas, nome) · Etiqueta.print(canvas) */
(function () {
  const W = 800, H = 1200;
  const SAL = '#E8857A', SAL_D = '#D2675C', PINK = '#F48FB1', HOT = '#EC5C93', TIF = '#7FD8CF', INK = '#3A2A2E', LIGHT = '#F6D3CD';
  const FONT = 'Lexend, "Segoe UI", Arial, sans-serif';
  const FORMAS = [['ENTREGA', /entrega|motoboy/i], ['RETIRADA', /retir/i], ['CORREIOS PAC', /pac/i], ['SEDEX', /sedex/i], ['TRANSPORTADORA', /transport|excurs/i]];

  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function heart(c, x, y, s, fill, stroke) {
    c.save(); c.translate(x, y); c.scale(s / 32, s / 32); c.beginPath();
    c.moveTo(16, 29); c.bezierCurveTo(5, 21, 0, 15, 0, 9); c.bezierCurveTo(0, 4, 4, 0, 9, 0); c.bezierCurveTo(12, 0, 14.5, 1.6, 16, 4);
    c.bezierCurveTo(17.5, 1.6, 20, 0, 23, 0); c.bezierCurveTo(28, 0, 32, 4, 32, 9); c.bezierCurveTo(32, 15, 27, 21, 16, 29); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.lineWidth = 3 * 32 / s; c.strokeStyle = stroke; c.stroke(); } c.restore();
  }
  function fit(c, t, max) { t = String(t || ''); if (c.measureText(t).width <= max) return t; while (t.length && c.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; }
  const brl = v => Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dt = v => { if (!v) return ''; if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10).split('-').reverse().join('/'); return new Date(v).toLocaleDateString('pt-BR'); };

  function draw(cv, p, o) {
    o = o || {}; cv.width = W; cv.height = H; const c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
    // faixa superior rosa + tiffany (como o cartão de entrega)
    let g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, PINK); g.addColorStop(.5, PINK); g.addColorStop(.5, TIF); g.addColorStop(1, TIF);
    c.fillStyle = g; c.fillRect(0, 0, W, 16);
    // logo
    if (o.logo && o.logo.complete && o.logo.naturalWidth) { c.save(); c.beginPath(); c.arc(95, 100, 62, 0, 7); c.clip(); c.drawImage(o.logo, 33, 38, 124, 124); c.restore(); c.lineWidth = 4; c.strokeStyle = TIF; c.beginPath(); c.arc(95, 100, 64, 0, 7); c.stroke(); }
    // título
    c.textAlign = 'center'; c.fillStyle = SAL; c.font = `800 84px ${FONT}`; c.fillText('PEDIDO', 470, 118);
    const tw = c.measureText('PEDIDO').width; heart(c, 470 - tw / 2 - 58, 72, 40, PINK); heart(c, 470 + tw / 2 + 18, 72, 40, PINK);
    c.font = `500 20px ${FONT}`; c.fillStyle = '#9B7C80'; c.fillText((o.loja || 'Coralli') + ' · moda gringa no atacado', 470, 152);
    // caixas nº / datas
    const bx = [['Nº DO PEDIDO', '#' + (p.num || '')], ['DATA DO PEDIDO', dt(p.data)], ['DATA DA ENTREGA', dt(p.entrega) || '—']];
    bx.forEach(([l, v], i) => { const x = 30 + i * 250, w = 240; rr(c, x, 182, w, 78, 16); c.lineWidth = 3; c.strokeStyle = SAL; c.stroke();
      c.textAlign = 'left'; c.font = `700 15px ${FONT}`; c.fillStyle = SAL; c.fillText(l, x + 16, 208); c.font = `700 27px ${FONT}`; c.fillStyle = INK; c.fillText(fit(c, v, w - 30), x + 16, 245); });
    // dados do cliente
    rr(c, 30, 278, 740, 236, 20); c.lineWidth = 3; c.strokeStyle = SAL; c.stroke();
    const field = (lbl, val, x, y, w) => { c.font = `800 19px ${FONT}`; c.fillStyle = SAL; c.fillText(lbl, x, y); const lw = c.measureText(lbl).width + 10;
      c.strokeStyle = LIGHT; c.lineWidth = 2; c.beginPath(); c.moveTo(x + lw, y + 6); c.lineTo(x + w, y + 6); c.stroke();
      c.font = `600 23px ${FONT}`; c.fillStyle = INK; c.fillText(fit(c, val, w - lw - 4), x + lw, y); };
    c.textAlign = 'left';
    field('NOME:', p.nome, 52, 322, 700);
    field('CPF:', p.cpf, 52, 366, 330); field('TEL:', p.tel, 400, 366, 352);
    field('END:', p.end, 52, 410, 560); field('Nº:', p.numero, 630, 410, 122);
    field('BAIRRO:', p.bairro, 52, 454, 330); field('CIDADE:', p.cidade, 400, 454, 352);
    field('CEP:', p.cep, 52, 496, 330); field('TOTAL DE PEÇAS:', String((p.itens || []).reduce((a, l) => a + (+l.qtd || 0), 0)), 400, 496, 352);
    // forma de entrega
    rr(c, 30, 530, 740, 58, 29); c.fillStyle = SAL; c.fill();
    let fx = 46; c.font = `800 14px ${FONT}`;
    FORMAS.forEach(([lbl, re]) => { const on = re.test(p.forma || ''); heart(c, fx, 548, 22, on ? '#fff' : null, '#fff'); c.fillStyle = '#fff'; c.fillText(lbl, fx + 27, 565); fx += 28 + c.measureText(lbl).width + 22; });
    // tabela
    const cols = [30, 112, 528, 640, 770];
    rr(c, 30, 604, 740, 44, 12); c.fillStyle = SAL; c.fill();
    c.fillStyle = '#fff'; c.font = `800 17px ${FONT}`;
    [['QTD', 0], ['DESCRIÇÃO DOS PRODUTOS', 1], ['UNIT.', 2], ['VALOR', 3]].forEach(([t, i]) => { c.textAlign = i === 1 ? 'left' : 'center'; c.fillText(t, i === 1 ? cols[1] + 14 : (cols[i] + cols[i + 1]) / 2, 633); });
    const its = (p.itens || []).slice(), top = 648, bottom = p.desconto ? 994 : 1018;
    let rh = 40; const maxRows = Math.max(1, Math.floor((bottom - top) / 28));
    if (its.length * rh > bottom - top) rh = Math.max(28, Math.floor((bottom - top) / its.length));
    const rows = Math.min(its.length, Math.floor((bottom - top) / rh)), extra = its.length - rows;
    const nRows = Math.max(rows, Math.floor((bottom - top) / rh));
    for (let r = 0; r < nRows; r++) {
      const y = top + r * rh; if (r % 2) { c.fillStyle = '#FFF6F4'; c.fillRect(30, y, 740, rh); }
      c.strokeStyle = LIGHT; c.lineWidth = 1.5; c.beginPath(); c.moveTo(30, y + rh); c.lineTo(770, y + rh); c.stroke();
    }
    c.strokeStyle = LIGHT; c.lineWidth = 1.5; [112, 528, 640].forEach(x => { c.beginPath(); c.moveTo(x, top); c.lineTo(x, top + nRows * rh); c.stroke(); });
    const fs = Math.min(22, rh - 14);
    for (let r = 0; r < rows; r++) {
      const l = its[r], y = top + r * rh + rh / 2 + fs / 2.8, last = extra && r === rows - 1;
      c.fillStyle = INK; c.font = `700 ${fs}px ${FONT}`;
      if (last) { c.textAlign = 'left'; c.fillStyle = HOT; c.fillText(`+ ${extra + 1} itens · veja o pedido completo no WhatsApp`, cols[1] + 14, y); continue; }
      c.textAlign = 'center'; c.fillText(String(l.qtd), (cols[0] + cols[1]) / 2, y);
      c.textAlign = 'left'; c.font = `500 ${fs}px ${FONT}`; c.fillText(fit(c, l.nome + (l.cor ? ' · ' + l.cor : '') + (l.tam ? ' · ' + l.tam : ''), cols[2] - cols[1] - 24), cols[1] + 14, y);
      c.textAlign = 'center'; c.fillText(brl(l.preco), (cols[2] + cols[3]) / 2, y); c.font = `700 ${fs}px ${FONT}`; c.fillText(brl(l.qtd * l.preco), (cols[3] + cols[4]) / 2, y);
    }
    // total
    const tot = Math.max(0, its.reduce((a, l) => a + l.qtd * l.preco, 0) - (p.desconto || 0));
    if (p.desconto) { c.textAlign = 'right'; c.fillStyle = SAL; c.font = `700 16px ${FONT}`; c.fillText(`CUPOM ${p.cupom || ''}: −${brl(p.desconto)}`, 770, 1022); }
    rr(c, 440, 1030, 330, 62, 16); c.fillStyle = '#FDE7EF'; c.fill(); c.lineWidth = 3; c.strokeStyle = HOT; c.stroke();
    c.textAlign = 'left'; c.fillStyle = HOT; c.font = `800 20px ${FONT}`; c.fillText('TOTAL R$', 462, 1069); c.textAlign = 'right'; c.font = `800 34px ${FONT}`; c.fillText(brl(tot), 752, 1073);
    const pago = p.pagamento && p.pagamento.status === 'approved';
    if (pago) { rr(c, 300, 1030, 128, 62, 16); c.fillStyle = '#E3F7EC'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1F9D5B'; c.stroke();
      c.textAlign = 'center'; c.fillStyle = '#137A43'; c.font = `800 24px ${FONT}`; c.fillText('✓ PAGO', 364, 1060);
      c.font = `600 13px ${FONT}`; c.fillText({ bank_transfer: 'PIX', pix: 'PIX', credit_card: 'CARTÃO', debit_card: 'DÉBITO', account_money: 'MERCADO PAGO', dinheiro: 'DINHEIRO' }[p.pagamento.metodo] || 'ONLINE', 364, 1081); }
    if (p.obs) { c.textAlign = 'left'; c.font = `800 15px ${FONT}`; c.fillStyle = SAL; c.fillText('OBS.:', 32, 1052); c.font = `500 17px ${FONT}`; c.fillStyle = INK;
      const words = String(p.obs).split(' '); let line = '', y = 1052, x0 = 84; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > (pago ? 200 : 340) - (y > 1052 ? -52 : 0)) { c.fillText(line, x0, y); line = w; y += 22; x0 = 32; if (y > 1096) break; } else line = t; } if (y <= 1096) c.fillText(line, x0, y); }
    // rodapé
    g = c.createLinearGradient(30, 0, 770, 0); g.addColorStop(0, PINK); g.addColorStop(1, TIF);
    rr(c, 30, 1110, 740, 66, 33); c.fillStyle = g; c.fill();
    c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = `800 30px ${FONT}`; c.fillText('OBRIGADA PELA COMPRA!', 400, 1153);
    const fw = c.measureText('OBRIGADA PELA COMPRA!').width; heart(c, 400 - fw / 2 - 46, 1128, 30, '#fff'); heart(c, 400 + fw / 2 + 16, 1128, 30, '#fff');
    c.font = `600 15px ${FONT}`; c.fillStyle = '#B79499'; c.fillText(o.rodape || '@use.corallii', 400, 1194);
  }

  function png(cv, nome) { cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (nome || 'pedido') + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png'); }
  function print(cv) {
    const w = window.open('', '_blank'); if (!w) return alert('Permita pop-ups para imprimir.');
    w.document.write(`<!doctype html><title>Etiqueta</title><style>@page{size:100mm 150mm;margin:0}html,body{margin:0}img{width:100mm;height:150mm;display:block}</style><img src="${cv.toDataURL('image/png')}" onload="setTimeout(()=>{print()},300)">`);
    w.document.close();
  }
  window.Etiqueta = { draw, png, print, W, H };
})();
