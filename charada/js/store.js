/* Charada Burguer · dados do site (modo demonstração)
   Os dados ficam salvos no navegador (localStorage): o que for publicado
   no painel /admin aparece no site do mesmo aparelho. Na versão oficial,
   isso vai para a nuvem e aparece para todo mundo na hora. */
(function () {
  const KEY = 'charada-demo-v1';

  const CONFIG = {
    whatsapp: '',                    // ← WhatsApp da casa (5511939347431). Vazio = StayPulse (demo)
    whatsappDemo: '5511975387719',
    instagram: 'https://www.instagram.com/charadaburguer/',
    ifood: '',                       // ← link da loja no iFood (vazio = esconde o botão)
    food99: 'https://99app.com/99food/sao-paulo/charada-burguer/5764608494632960428/',
    horario: { abre: 12, fecha: 23 },  // todos os dias, 12h às 23h
    unidades: [
      { id: 'vila-maria', nome: 'Vila Maria', end: 'Praça Santo Eduardo, 67 - Vila Maria, São Paulo - SP', foto: 'img/fachada.jpg' },
      { id: 'vila-formosa', nome: 'Vila Formosa', end: 'Vila Formosa, São Paulo - SP', foto: 'img/fachada2.jpg' }
    ],
    destaques: ['Vila Maria', 'Espaço kids', 'Vila Formosa', 'Delivery', 'Aniversários', 'Clientes']
  };

  const CATEGORIAS = ['Burgers', 'Combos', 'Pizzas', 'Porções', 'Milkshakes', 'Bebidas'];

  const P = (id, nome, cat, preco, desc, foto, extra) => Object.assign({ id, nome, cat, preco, desc, foto, status: 'publicado', destaque: false, criado: Date.now() }, extra || {});
  const SEED = {
    produtos: [
      P('p1', 'Charada Burguer', 'Burgers', 23.90, 'Pão brioche, hambúrguer, queijo prato, ketchup e maionese.', 'img/p/classico.jpg'),
      P('p2', 'Charada Cheddar & Bacon', 'Burgers', 25.49, 'Pão australiano, hambúrguer, cheddar, bacon em fatia, molho especial e alface.', 'img/p/cheddar-bacon.jpg', { destaque: true }),
      P('p3', 'Charada Bacon', 'Burgers', 29.90, 'Pão com gergelim, hambúrguer, molho especial, queijo prato, alface, tomate e bacon.', 'img/p/charada-bacon.jpg', { destaque: true }),
      P('p4', 'Charada Monster', 'Burgers', 47.90, 'Três hambúrgueres, muito queijo e bacon. Só para quem zera o jogo.', 'img/p/monster.jpg', { destaque: true }),
      P('p5', 'Charada Egg Especial', 'Burgers', 32.90, 'Hambúrguer, ovo, cheddar, bacon e molho da casa.', 'img/p/egg.jpg'),
      P('p6', 'Charada Crispy', 'Burgers', 28.90, 'Frango empanado crocante, queijo e molho especial.', 'img/p/crispy.jpg'),
      P('p7', 'Combo Charada', 'Combos', 34.77, 'Charada Burguer + porção de batata + Coca-Cola lata + molho da casa.', 'img/p/combo.jpg', { destaque: true }),
      P('p8', 'Combo Player 2', 'Combos', 89.90, '2 burgers + batata + molhos + 2 refrigerantes. Para jogar em dupla.', 'img/p/fritas-burger.jpg'),
      P('p9', 'Pizza Charada', 'Pizzas', 59.90, 'Pizza grande com borda recheada. Pergunte os sabores do dia.', 'img/p/pizza.jpg'),
      P('p10', 'Pizza Calabresa', 'Pizzas', 54.90, 'Calabresa, cebola, mussarela e orégano.', 'img/p/pizza2.jpg'),
      P('p11', 'Batata Charada', 'Porções', 24.90, 'Batata frita crocante com molho da casa.', 'img/p/batata.jpg'),
      P('p12', 'Shake Chocolate Supreme', 'Milkshakes', 32.90, 'Milkshake de chocolate com borda de granulado e chantilly.', 'img/p/shake-choco.jpg', { destaque: true }),
      P('p13', 'Torre de Chocolate', 'Milkshakes', 39.90, 'O shake gigante que viraliza no Instagram.', 'img/p/shake-torre.jpg'),
      P('p14', 'Shake de Morango', 'Milkshakes', 29.90, 'Morango, sorvete e calda.', 'img/p/shake-morango.jpg'),
      P('p15', 'Sundae Charada', 'Milkshakes', 25.90, 'Sorvete, chantilly, calda e wafer.', 'img/p/sundae.jpg'),
      P('p16', 'Chopp', 'Bebidas', 14.90, 'Chopp gelado (300 ml).', 'img/p/chopp.jpg'),
      P('p17', 'Soda italiana', 'Bebidas', 16.90, 'Sabores variados, com gelo.', 'img/p/soda.jpg')
    ],
    promos: [
      { id: 'r1', titulo: 'Almoço à vontade', texto: 'De segunda a sexta, a partir de R$ 34,90.', img: 'img/promo/almoco.jpg', ativa: true },
      { id: 'r2', titulo: 'Chopp em dobro', texto: 'Peça um chopp e ganhe outro. Consulte os dias.', img: 'img/promo/chopp-dobro.jpg', ativa: true },
      { id: 'r3', titulo: 'Marmitex a partir de R$ 22,90', texto: 'Almoço para levar, de segunda a sábado.', img: 'img/promo/almoco-2790.jpg', ativa: true },
      { id: 'r4', titulo: 'Game over para a fome', texto: 'Combos especiais para jogar e comer.', img: 'img/promo/game-over.jpg', ativa: true }
    ],
    videos: [
      { id: 'v1', titulo: 'Uma mesa, uma TV, dois controles', cat: 'Clientes', capa: 'img/v/v1.jpg', url: '', status: 'publicado' },
      { id: 'v2', titulo: 'Charada de 2004 a 2026', cat: 'Vila Maria', capa: 'img/v/v2.jpg', url: '', status: 'publicado' },
      { id: 'v3', titulo: 'Clássicos em todas as mesas', cat: 'Clientes', capa: 'img/v/v3.jpg', url: '', status: 'publicado' },
      { id: 'v4', titulo: 'Tour gastronômico em São Paulo', cat: 'Vila Formosa', capa: 'img/v/v4.jpg', url: '', status: 'publicado' },
      { id: 'v5', titulo: 'A primeira mordida', cat: 'Clientes', capa: 'img/v/v5.jpg', url: '', status: 'publicado' },
      { id: 'v6', titulo: 'Os heróis também comem', cat: 'Espaço kids', capa: 'img/v/v6.jpg', url: '', status: 'publicado' },
      { id: 'v7', titulo: 'Aniversário no Charada', cat: 'Aniversários', capa: 'img/v/v7.jpg', url: '', status: 'publicado' },
      { id: 'v8', titulo: 'Jogando enquanto o lanche chega', cat: 'Vila Formosa', capa: 'img/v/v8.jpg', url: '', status: 'publicado' },
      { id: 'v9', titulo: 'Das 12h às 23h', cat: 'Vila Maria', capa: 'img/v/v9.jpg', url: '', status: 'publicado' },
      { id: 'v10', titulo: 'Bolo de aniversário', cat: 'Aniversários', capa: 'img/v/v10.jpg', url: '', status: 'publicado' },
      { id: 'v11', titulo: 'Pizza e games', cat: 'Delivery', capa: 'img/v/v11.jpg', url: '', status: 'publicado' },
      { id: 'v12', titulo: 'Recebendo vocês', cat: 'Espaço kids', capa: 'img/v/v12.jpg', url: '', status: 'publicado' }
    ]
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.produtos) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.CharadaStore = { KEY, CONFIG, CATEGORIAS, load, save, reset, brl, uid };
})();
