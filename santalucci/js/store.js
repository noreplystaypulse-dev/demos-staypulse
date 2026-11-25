/* Santa Lucci Pizza · Vila Ema · dados da demonstração (StayPulse)
   Nesta demo tudo fica salvo no aparelho (localStorage).
   Na versão oficial vai para a nuvem e aparece na hora para todos os clientes. */
(function () {
  const KEY = 'santalucci-demo-v1';

  const CONFIG = {
    ifood: 'https://www.ifood.com.br/delivery/sao-paulo-sp/santa-lucci-pizza---vila-ema-vila-ema/703b794d-0e69-4e9b-ae04-2a94538b4e9d',
    app: '',                             // link do aplicativo próprio (Wabiz). Vazio = botão some
    whatsapp: '',                        // WhatsApp da pizzaria (vazio = StayPulse, demo)
    whatsappDemo: '5511975387719',
    telefone: '',                        // telefone fixo (opcional)
    instagram: 'santaluccivilaema',
    endereco: 'Av. Vila Ema, 2355',
    bairro: 'Vila Ema · São Paulo - SP',
    // domingo (0) a sábado (6). Vazio = fechado. Vários turnos separados por espaço.
    horarios: ['18:00-23:30', '18:00-23:30', '18:00-23:30', '18:00-23:30', '18:00-23:30', '18:00-00:00', '18:00-00:00'],
    avisos: 'Todas as pizzas acompanham molho de tomate e orégano.\nPizzas meio a meio são cobradas pelo maior valor.\nCobramos taxa de entrega.\nLevamos máquina de cartão no local.',
    logo: ''                             // vazio = img/logo.png (pode trocar pelo painel)
  };

  const CATS = ['Pizzas especiais', 'Pizzas tradicionais', 'Pizzas doces', 'Bebidas'];

  let n = 0;
  const I = (cat, nome, preco, foto, desc, extra) => Object.assign({ id: 's' + (++n), cat, nome, preco, foto: foto ? 'img/p/' + foto + '.jpg' : '', desc: desc || '', badge: '', destaque: false, ativo: true }, extra || {});

  const SEED = {
    itens: [
      I('Pizzas especiais', 'Premiada Javali', 62.80, '', 'Mussarela de búfala, linguiça de javali e alho-poró refogado com azeite.', { badge: 'Premiada', destaque: true }),
      I('Pizzas especiais', 'Carpaccio', 58.80, '', 'Mussarela, carpaccio, molho de alcaparras e parmesão ralado.'),
      I('Pizzas especiais', 'Shitake', 58.80, '', 'Mussarela de búfala, shitake fatiado e tomate seco.'),
      I('Pizzas especiais', 'Alcachofra com Catupiry', 56.80, '', 'Alcachofra, alcaparras e cobertura de Catupiry.'),
      I('Pizzas especiais', 'Alcachofra com Mussarela', 56.80, '', 'Alcachofra, alcaparras e cobertura de mussarela.'),
      I('Pizzas especiais', 'Carne Seca com Catupiry', 56.80, 'queijo', 'Carne seca temperada, cebola e cobertura de Catupiry.', { destaque: true }),
      I('Pizzas especiais', 'Carne Seca com Mussarela', 56.80, '', 'Carne seca temperada, cebola e cobertura de mussarela.'),
      I('Pizzas especiais', 'Parma', 56.80, '', 'Mussarela de búfala e presunto Parma.'),
      I('Pizzas especiais', 'Abobrinha', 55.80, '', 'Mussarela de búfala, abobrinha em finas rodelas temperada com azeite e parmesão ralado.'),
      I('Pizzas especiais', 'Carbonara', 48.80, '', 'Calabresa fatiada, ovos picados, parmesão e cebola.'),
      I('Pizzas tradicionais', 'Mussarela', 0, 'borda', 'Mussarela, azeitona e orégano. Borda recheada é só pedir.', { destaque: true }),
      I('Pizzas tradicionais', 'Calabresa', 0, '', 'Calabresa fatiada, cebola e azeitona.'),
      I('Pizzas tradicionais', 'Margherita', 0, '', 'Mussarela, tomate e manjericão fresco.'),
      I('Pizzas tradicionais', 'Portuguesa', 0, '', 'Presunto, ovos, cebola, ervilha, mussarela e azeitona.'),
      I('Pizzas tradicionais', 'Frango com Catupiry', 0, '', 'Frango desfiado temperado com cobertura de Catupiry.'),
      I('Pizzas tradicionais', 'Quatro Queijos', 0, '', 'Mussarela, provolone, parmesão e Catupiry.'),
      I('Pizzas doces', 'Morango com Nutella', 0, 'morango-nutella', 'Nutella generosa e morangos frescos fatiados. A queridinha da casa.', { badge: 'Mais pedida', destaque: true }),
      I('Pizzas doces', 'Brigadeiro', 0, '', 'Chocolate ao leite e granulado.'),
      I('Pizzas doces', 'Banana com canela', 0, '', 'Banana, açúcar, canela e mussarela.'),
      I('Bebidas', 'Refrigerante 2 L', 0, '', 'Coca-Cola, Guaraná Antarctica e outros.'),
      I('Bebidas', 'Refrigerante lata', 0, '', '350 ml.')
    ],
    config: {}
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.itens) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const preco = i => i.preco ? brl(i.preco) : '';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cfg = d => Object.assign({}, CONFIG, (d && d.config) || {});

  /* horários: "aberto agora?" */
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const turnos = s => String(s || '').trim().split(/\s+/).filter(Boolean).map(r => { const [a, b] = r.split('-'); let fa = mins(a), fb = mins(b); if (fb <= fa) fb += 1440; return [fa, fb, a, b]; });
  const hh = t => t === '00:00' ? '00h' : t.replace(/:00$/, 'h').replace(':', 'h');
  function status(c, now) {
    now = now || new Date(); const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    for (const [a, b, , fb] of turnos(c.horarios[d])) if (m >= a && m < b) return { aberto: true, txt: 'Aberto agora · até ' + hh(fb) };
    const ontem = turnos(c.horarios[(d + 6) % 7]).find(([, b]) => b > 1440 && m < b - 1440);
    if (ontem) return { aberto: true, txt: 'Aberto agora · até ' + hh(ontem[3]) };
    for (let k = 0; k < 7; k++) { const dd = (d + k) % 7; const t = turnos(c.horarios[dd]).find(([a]) => k > 0 || a > m);
      if (t) return { aberto: false, txt: 'Fechado agora · abre ' + (k === 0 ? 'hoje' : k === 1 ? 'amanhã' : DIAS[dd].toLowerCase()) + ' às ' + hh(t[2]) }; }
    return { aberto: false, txt: 'Fechado' };
  }
  const fmtH = s => turnos(s).map(t => hh(t[2]) + ' às ' + hh(t[3])).join(' · ') || 'Fechado';
  /* agrupa dias com o mesmo horário: "Domingo a Quinta" */
  function grupos(c) {
    const ord = [0, 1, 2, 3, 4, 5, 6], out = [];
    ord.forEach(d => { const h = fmtH(c.horarios[d]), l = out[out.length - 1]; if (l && l.h === h) l.dias.push(d); else out.push({ h, dias: [d] }); });
    return out.map(g => ({ h: g.h, nome: g.dias.length === 1 ? DIAS[g.dias[0]] : DIAS[g.dias[0]] + ' a ' + DIAS[g.dias[g.dias.length - 1]], dias: g.dias }));
  }

  window.LucciStore = { KEY, CONFIG, CATS, DIAS, load, save, reset, brl, preco, uid, cfg, status, fmtH, grupos };
})();
