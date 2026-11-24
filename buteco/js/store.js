/* Buteco da Vila · dados do site e do cardápio (demonstração StayPulse)
   Nesta demo tudo fica salvo no aparelho (localStorage).
   Na versão oficial vai para a nuvem: o que o bar mudar aparece no site e na TV na hora. */
(function () {
  const KEY = 'buteco-demo-v1';

  const CONFIG = {
    whatsapp: '',                          // WhatsApp de reservas do bar (vazio = StayPulse, demo)
    whatsappDemo: '5511975387719',
    telefone: '',
    instagram: 'butecodavila.oficial',
    endereco: 'Rua Curuçá, 852',
    bairro: 'Vila Maria · São Paulo - SP · 02120-005',
    horarios: 'Seg a Qui · 11h às 23h\nSex e Sáb · 11h às 0h\nDom · 11h às 18h',   // ⚠ confirmar com o bar
    trabalhe: 'https://docs.google.com/forms/d/e/1FAIpQLSdlJRK7ZGx-lnuqrVAzpRM2J_-wQSyJQfyICsvfjfh3ag7yjQ/viewform',
    ifood: '',
    pdf: 'cardapio.pdf'
  };

  const CATS = ['Pratos do dia', 'Executivos', 'Premium', 'Entradas', 'Porções', 'Chapas e petiscos', 'Pratos a compartilhar', 'Saladas e lanches', 'Sobremesas', 'Bebidas', 'Cervejas e chopp', 'Drinks'];
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const ACOMP_CHAPA = 'Acompanha cesta de pães, vinagrete e farofa.';
  const ACOMP_COMP = 'Acompanha arroz à escolha (branco, brócolis, carreteiro ou biro biro), fritas, vinagrete, farofa e cesta de pães.';

  let n = 0;
  const I = (cat, nome, preco, foto, desc, extra) => Object.assign({ id: 'i' + (++n), cat, nome, preco, foto: foto ? 'img/p/' + foto + '.jpg' : '', desc: desc || '', opcoes: '', dias: [], destaque: false, ativo: true }, extra || {});

  const SEED = {
    itens: [
      I('Pratos do dia', 'Virada à paulista', 34.90, 'virada-paulista', 'Acompanha salada.', { dias: [1] }),
      I('Pratos do dia', 'Carne com legumes', 33.90, 'carne-legumes', 'Acompanha feijão e salada.', { dias: [2] }),
      I('Pratos do dia', 'Feijoada completa', 44.90, 'feijoada', 'Acompanha couve, farofa, torresmo, banana, bisteca e molho de pimenta.', { dias: [3, 6], opcoes: 'Pequena R$ 44,90 · Grande R$ 89,90', destaque: true }),
      I('Pratos do dia', 'Espaguete com filé de coxa', 31.90, 'espaguete-coxa', 'Acompanha feijão e salada.', { dias: [4] }),
      I('Pratos do dia', 'Filé de peixe', 34.90, 'file-peixe', 'Acompanha feijão e salada.', { dias: [5] }),

      I('Executivos', 'Contra filé acebolado', 44.90, 'contra-file-acebolado', 'Acompanha feijão e salada.'),
      I('Executivos', 'Strogonoff de frango', 34.90, 'strogonoff', 'Acompanha salada.'),
      I('Executivos', 'Parmegiana de frango', 44.90, 'parmegiana-frango', 'Acompanha feijão e salada.'),
      I('Executivos', 'Filé de frango', 34.90, 'file-frango', 'Acompanha feijão e salada.'),
      I('Executivos', 'Tilápia', 39.90, 'tilapia', 'Acompanha feijão e salada.'),

      I('Premium', 'Picanha grelhada', 69.90, 'picanha-grelhada', 'Acompanha feijão e salada.', { destaque: true }),
      I('Premium', 'Mignon à parmegiana', 52.90, 'mignon-parmegiana', 'Acompanha feijão e salada.'),
      I('Premium', 'Mignon à cubana', 49.90, 'mignon-cubana', 'Acompanha feijão e salada.'),

      I('Entradas', 'Bolinho de cupim com mandioquinha', 26.90, 'bolinho-cupim'),
      I('Entradas', 'Coxinha da Vila', 26.90, 'coxinha'),
      I('Entradas', 'Croquete de abóbora com carne seca', 27.90, 'croquete'),
      I('Entradas', 'Dadinho de tapioca', 24.90, 'dadinho'),
      I('Entradas', 'Pastel', 28.90, 'pastel', '', { opcoes: 'Queijo R$ 32,90 · Carne R$ 28,90 · Misto R$ 28,90' }),
      I('Entradas', 'Torresmo da Vila', 37.90, 'torresmo', '', { destaque: true }),
      I('Entradas', 'Mussarela palito', 28.90, 'mussarela-palito'),
      I('Entradas', 'Combinado da Vila', 32.90, 'combinado', 'Escolha 3 itens (2 unidades de cada).'),

      I('Porções', 'Choripan', 29.90, 'choripan'),
      I('Porções', 'Batata frita', 26.90, 'batata-frita'),
      I('Porções', 'Batata cheddar e bacon', 39.90, 'batata-cheddar'),
      I('Porções', 'Polenta frita', 26.90, 'polenta'),
      I('Porções', 'Isca de frango', 34.90, 'isca-frango'),
      I('Porções', 'Carne seca com mandioca', 89.90, 'carne-seca'),
      I('Porções', 'Frango a passarinho', 49.90, 'frango-passarinho'),
      I('Porções', 'Isca de peixe', 44.90, 'isca-peixe'),
      I('Porções', 'Camarão com catupiry', 89.90, 'camarao-catupiry'),
      I('Porções', 'Prato de frios', 59.90, 'prato-frios'),

      I('Chapas e petiscos', 'Mignon da Vila', 129.90, 'mignon-da-vila', 'Filé mignon empanado, cortado aperitivo, ao molho branco com catupiry e mussarela gratinada. ' + ACOMP_CHAPA, { destaque: true }),
      I('Chapas e petiscos', 'Contra com catupiry', 129.90, 'contra-catupiry', ACOMP_CHAPA),
      I('Chapas e petiscos', 'Parmegiana aperitivo', 79.90, 'parmegiana-aperitivo', ACOMP_CHAPA),
      I('Chapas e petiscos', 'Picanha da Vila', 139.90, 'picanha-da-vila', ACOMP_CHAPA),
      I('Chapas e petiscos', 'Calabresa acebolada', 51.90, 'calabresa', ACOMP_CHAPA),
      I('Chapas e petiscos', 'Chapa mista', 129.90, 'chapa-mista', ACOMP_CHAPA),

      I('Pratos a compartilhar', 'Picanha com aligot', 189.90, 'picanha-aligot', ACOMP_COMP, { destaque: true }),
      I('Pratos a compartilhar', 'Beef ancho', 129.90, 'beef-ancho', ACOMP_COMP),
      I('Pratos a compartilhar', 'Maminha na manteiga', 139.90, 'maminha', ACOMP_COMP),
      I('Pratos a compartilhar', 'Parmegiana grande', 119.90, 'parmegiana-grande', ACOMP_COMP, { opcoes: 'Frango R$ 119,90 · Mignon R$ 139,90' }),
      I('Pratos a compartilhar', 'Cupim casqueirado', 129.90, 'cupim', ACOMP_COMP),

      I('Saladas e lanches', 'Salada mista', 29.90, 'salada', '', { opcoes: 'Pequena R$ 29,90 · Grande R$ 49,90' }),
      I('Saladas e lanches', 'Cheddar bacon', 39.90, 'cheddar-bacon', 'Hambúrguer com cheddar e bacon, acompanha fritas.'),
      I('Saladas e lanches', 'Baconese', 39.90, 'baconese', 'Hambúrguer com bacon e maionese da casa, acompanha fritas.'),

      I('Sobremesas', 'Petit gâteau', 29.90, 'petit-gateau'),
      I('Sobremesas', 'Brownie da Vila', 34.90, 'brownie', 'Brownie coberto com chocolate branco gratinado, sorvete de creme e chantilly.'),
      I('Sobremesas', 'Pudim de leite', 19.90, 'pudim'),
      I('Sobremesas', 'Taça premium Kinder Bueno', 58.90, 'taca-kinder'),
      I('Sobremesas', 'Creme de papaya', 29.90, 'creme-papaya'),

      I('Bebidas', 'Sucos', 14.90, 'sucos', 'Laranja, limão, melancia, maracujá, acerola, abacaxi ou manga.'),
      I('Bebidas', 'Sucos mistos', 19.90, ''),
      I('Bebidas', 'Limonada suíça', 19.90, ''),
      I('Bebidas', 'Água com ou sem gás', 7.90, ''),
      I('Bebidas', 'Refrigerante lata', 10.90, ''),
      I('Bebidas', 'H2O normal ou limoneto', 13.90, ''),

      I('Cervejas e chopp', 'Chopp Brahma', 14.90, 'chopp', '', { destaque: true }),
      I('Cervejas e chopp', 'Long neck', 17.90, 'long-neck', '', { opcoes: 'Heineken R$ 18,90 · Corona R$ 17,90' }),
      I('Cervejas e chopp', 'Cerveja 600 ml', 19.90, '', '', { opcoes: 'Heineken, Original, Spaten e Corona R$ 23,90 · Skol R$ 19,90 · Amstel e Stella R$ 21,90 · Serra Malte e Brahma Duplo Malte R$ 22,90 · Baden Baden R$ 28,90' }),
      I('Cervejas e chopp', 'Balde', 0, 'balde', '4 cervejas com 20% OFF. Válido para Original, Brahma, Skol, Stella e Amstel, todas da mesma e indo todas de uma vez!'),

      I('Drinks', 'Caipirinha', 24.90, 'caipirinha', 'Limão, maracujá, kiwi, caju ou morango.', { opcoes: 'Cachaça R$ 24,90 · Vodka R$ 27,90 · Saquê R$ 27,90 · Absolut R$ 38,90' }),
      I('Drinks', 'Caipirinha da Vila', 39.90, 'caipirinha-da-vila', '', { destaque: true }),
      I('Drinks', 'Caipirinha Ballena', 39.90, 'caipirinha-ballena'),
      I('Drinks', 'Aperol', 34.90, 'aperol'),
      I('Drinks', 'Mojito', 34.90, 'mojito'),
      I('Drinks', 'Cuba libre', 28.90, 'cuba-libre'),
      I('Drinks', 'Piña colada', 34.90, 'pina-colada'),
      I('Drinks', 'Espanhola', 34.90, 'espanhola'),
      I('Drinks', 'Lagoa azul', 34.90, 'lagoa-azul'),
      I('Drinks', 'Sex on the beach', 37.90, 'sex-on-the-beach'),
      I('Drinks', 'Margarita', 34.90, 'margarita'),
      I('Drinks', 'Negroni', 28.90, 'negroni'),
      I('Drinks', 'Old fashioned', 28.90, 'old-fashioned'),
      I('Drinks', 'Gin clássico', 38.90, 'gin-classico'),
      I('Drinks', 'Gin tropical', 39.90, 'gin-tropical'),
      I('Drinks', 'Gin maracujá', 39.90, 'gin-maracuja'),
      I('Drinks', 'Gin frutas vermelhas', 40.90, 'gin-frutas-vermelhas'),
      I('Drinks', 'Dry martini', 28.90, 'dry-martini'),
      I('Drinks', 'Manhattan', 28.90, 'manhattan')
    ],
    avisos: [
      { id: 'a1', texto: 'Feijoada completa toda quarta e sábado', ativo: true },
      { id: 'a2', texto: 'Balde com 4 cervejas: 20% OFF', ativo: true }
    ],
    tela: { cats: ['Pratos do dia', 'Entradas', 'Porções', 'Chapas e petiscos', 'Cervejas e chopp', 'Drinks'], seg: 12, fotos: true },
    config: {}
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.itens) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const preco = i => !i.preco ? (i.opcoes ? '' : 'Consulte') : (i.opcoes ? 'a partir de ' : '') + brl(i.preco);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cfg = d => Object.assign({}, CONFIG, (d && d.config) || {});
  const hoje = () => { try { return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay(); } catch (e) { return new Date().getDay(); } };

  window.ButecoStore = { KEY, CONFIG, CATS, DIAS, load, save, reset, brl, preco, uid, cfg, hoje };
})();
