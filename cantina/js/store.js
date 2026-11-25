/* Cantina da Vila · modelo de restaurante (StayPulse)
   Nesta demo tudo fica salvo no aparelho (localStorage).
   Na versão oficial vai para a nuvem e aparece na hora para todos os clientes. */
(function () {
  const KEY = 'cantina-demo-v1';
  const U = id => 'https://images.unsplash.com/photo-' + id + '?q=75&w=900&auto=format&fit=crop';

  const CONFIG = {
    whatsapp: '',                        // WhatsApp do restaurante (vazio = StayPulse, demo)
    whatsappDemo: '5511975387719',
    ifood: '',
    instagram: 'staypulse.oficial',
    endereco: 'Rua da Vila, 120',
    bairro: 'Vila Mariana · São Paulo - SP',
    taxa: 8,                             // taxa de entrega (R$)
    minimo: 40,                          // pedido mínimo para delivery (R$)
    // horários: domingo (0) a sábado (6). Vazio = fechado. Vários turnos separados por espaço.
    horarios: ['11:30-17:00', '', '11:30-15:00 18:30-23:00', '11:30-15:00 18:30-23:00', '11:30-15:00 18:30-23:00', '11:30-15:00 18:30-00:00', '11:30-00:00'],
    logo: '',                            // vazio = img/logo.svg (pode trocar pelo painel)
    pdf: '',                             // cardápio em PDF (subido pelo painel)
    pdfNome: ''
  };

  const CATS = ['Antipasti', 'Massas', 'Pizzas', 'Carnes', 'Sobremesas', 'Bebidas'];

  let n = 0;
  const I = (cat, nome, preco, foto, desc, extra) => Object.assign({ id: 'c' + (++n), cat, nome, preco, foto: foto ? U(foto) : '', desc: desc || '', badge: '', destaque: false, ativo: true }, extra || {});

  const SEED = {
    itens: [
      I('Antipasti', 'Bruschetta da Nonna', 32, '1572695157366-5e585ab2b69f', 'Pão italiano tostado, tomate, manjericão fresco, alho e azeite extravirgem. 4 unidades.'),
      I('Antipasti', 'Burrata com tomate confit', 58, '', 'Burrata cremosa, tomatinhos confitados, pesto de manjericão e torradas.', { badge: 'Novidade' }),
      I('Antipasti', 'Polpettine al sugo', 39, '', 'Almôndegas da casa no molho de tomate italiano, com parmesão e pão.'),
      I('Antipasti', 'Carpaccio clássico', 46, '', 'Lâminas finas de filé, alcaparras, rúcula, parmesão e molho de mostarda.'),
      I('Massas', 'Spaghetti alla Carbonara', 62, '1612874742237-6526221588e3', 'Do jeito romano: guanciale, gema, pecorino e pimenta-do-reino. Sem creme de leite.', { badge: 'Mais pedido', destaque: true }),
      I('Massas', 'Lasanha à bolonhesa', 64, '1574894709920-11b28e7367e3', 'Massa fresca em camadas, ragù de carne cozido por 6 horas, bechamel e muçarela gratinada.', { destaque: true }),
      I('Massas', 'Spaghetti al Pomodoro', 48, '1621996346565-e3dbc646d9a9', 'Molho de tomate italiano, manjericão e azeite. Simples e perfeito.'),
      I('Massas', 'Nhoque da sorte', 52, '', 'Nhoque de batata artesanal ao sugo ou na manteiga com sálvia. Todo dia 29 tem promoção.'),
      I('Massas', 'Ravioli de ricota e espinafre', 58, '', 'Massa recheada na casa, molho de manteiga, sálvia e nozes.'),
      I('Massas', 'Fettuccine Alfredo', 56, '', 'Fettuccine fresco no molho de manteiga e parmesão. Adicione frango por R$ 12.'),
      I('Pizzas', 'Margherita', 59, '1574071318508-1cdbab80d002', 'Molho de tomate, muçarela de búfala, manjericão e azeite. Massa de longa fermentação.', { badge: 'Forno a lenha', destaque: true }),
      I('Pizzas', 'Calabresa da Vila', 62, '1513104890138-7c749659a591', 'Calabresa artesanal fatiada, cebola roxa, muçarela e azeitonas pretas.'),
      I('Pizzas', 'Quatro queijos', 66, '', 'Muçarela, gorgonzola, parmesão e catupiry.'),
      I('Pizzas', 'Parma e rúcula', 74, '1565299624946-b28f40a0ae38', 'Presunto de Parma, rúcula fresca, tomate seco e lascas de parmesão.'),
      I('Carnes', 'Filé à parmegiana', 78, '', 'Filé mignon empanado, molho de tomate e muçarela gratinada. Acompanha spaghetti ao sugo. Serve 2.', { badge: 'Serve 2', destaque: true }),
      I('Carnes', 'Filé ao molho madeira', 72, '1600891964092-4316c288032e', 'Medalhão de filé mignon com molho madeira e cogumelos, arroz e batatas.'),
      I('Carnes', 'Frango à milanesa', 49, '', 'Peito de frango empanado e crocante, com fettuccine na manteiga.'),
      I('Sobremesas', 'Tiramisù', 29, '1571877227200-a0d98ea607e9', 'Biscoito champagne com café, creme de mascarpone e cacau.', { badge: 'Receita da Nonna', destaque: true }),
      I('Sobremesas', 'Panna cotta', 24, '', 'Creme de baunilha com calda de frutas vermelhas.'),
      I('Sobremesas', 'Cannoli siciliano', 22, '', 'Massa crocante recheada com creme de ricota e gotas de chocolate. 2 unidades.'),
      I('Bebidas', 'Vinho tinto da casa (taça)', 26, '1510812431401-41d2bd2722f3', 'Seleção do sommelier. Pergunte pela garrafa.'),
      I('Bebidas', 'Limonada siciliana', 14, '', 'Limão siciliano, hortelã e gelo.'),
      I('Bebidas', 'Refrigerante lata', 7, '', 'Coca-Cola, Coca Zero, Guaraná ou Sprite.'),
      I('Bebidas', 'Água com ou sem gás', 6, '', '500 ml.')
    ],
    config: {}
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.itens) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem('cantina-cart'); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const preco = i => i.preco ? brl(i.preco) : '';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cfg = d => Object.assign({}, CONFIG, (d && d.config) || {});

  /* horários: "aberto agora?" */
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const turnos = s => String(s || '').trim().split(/\s+/).filter(Boolean).map(r => { const [a, b] = r.split('-'); let fa = mins(a), fb = mins(b); if (fb <= fa) fb += 1440; return [fa, fb, a, b]; });
  function status(c, now) {
    now = now || new Date(); const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    for (const [a, b, , fb] of turnos(c.horarios[d])) if (m >= a && m < b) return { aberto: true, txt: 'Aberto agora · fecha às ' + fb.replace(/^00:00$/, '00h') };
    const ontem = turnos(c.horarios[(d + 6) % 7]).find(([, b]) => b > 1440 && m < b - 1440);
    if (ontem) return { aberto: true, txt: 'Aberto agora · fecha às ' + ontem[3] };
    for (let k = 0; k < 7; k++) { const dd = (d + k) % 7; const t = turnos(c.horarios[dd]).find(([a]) => k > 0 || a > m);
      if (t) return { aberto: false, txt: 'Fechado agora · abre ' + (k === 0 ? 'hoje' : k === 1 ? 'amanhã' : DIAS[dd].toLowerCase()) + ' às ' + t[2] }; }
    return { aberto: false, txt: 'Fechado' };
  }
  const fmtH = s => turnos(s).map(t => t[2] + ' às ' + t[3]).join(' · ') || 'Fechado';

  window.CantinaStore = { KEY, CONFIG, CATS, DIAS, load, save, reset, brl, preco, uid, cfg, status, fmtH };
})();
