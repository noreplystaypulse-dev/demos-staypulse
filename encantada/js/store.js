/* Confeitaria Encantada · dados do site (modo demonstração)
   Os dados ficam salvos no navegador (localStorage): o que for publicado
   no painel /admin aparece no site do mesmo aparelho. Na versão oficial,
   isso vai para a nuvem e aparece para todo mundo na hora. */
(function () {
  const KEY = 'encantada-demo-v2';

  const CONFIG = {
    whatsapp: '',                    // ← WhatsApp da confeitaria (5511930114974). Vazio = StayPulse (demo)
    whatsappDemo: '5511975387719',
    instagram: 'https://www.instagram.com/confeitariaa_encantada/',
    ifood: '',                       // ← link da loja no iFood (vazio = botão "em breve")
    keeta: '',                       // ← link da loja na Keeta (vazio = botão "em breve")
    instadelivery: 'https://instadelivery.com.br/confeitariaencantada1',
    regiao: 'São Mateus · São Paulo - SP',
    antecedencia: 2,                 // dias mínimos para encomendas
    temporada: 'Natal 2025',         // categoria em destaque no topo (troque por Páscoa, Dia das Mães...)
    destaques: [
      { nome: 'Natal 2025', capa: 'img/b/hl-natal25.jpg', cat: 'Natal 2025' },
      { nome: 'Bolos', capa: 'img/b/hl-bolos.jpg', cat: 'Bolos' },
      { nome: 'Docinhos', capa: 'img/b/hl-docinhos.jpg', cat: 'Docinhos' },
      { nome: 'Presentear', capa: 'img/b/hl-presentear.jpg', cat: 'Para presentear' },
      { nome: 'Delivery', capa: 'img/b/hl-delivery.jpg', ancora: '#delivery' },
      { nome: 'Feedbacks', capa: 'img/b/hl-feedback.jpg', ancora: '#feedbacks' }
    ]
  };

  const CATEGORIAS = ['Natal 2025', 'Novidades', 'Bolos', 'Brownies', 'Docinhos', 'Sobremesas', 'Salgados', 'Empadas', 'Para presentear', 'Bebidas'];

  const P = (id, nome, cat, preco, desc, foto, extra) => Object.assign({ id, nome, cat, preco, desc, foto, status: 'publicado', destaque: false, apartir: false, criado: Date.now() }, extra || {});
  const SEED = {
    produtos: [
      P('n1', 'Mini Panetone Trufado', 'Natal 2025', 29.90, 'Chocotone ou frutas, aprox. 200 g. Doce de leite, Dois Amores, Brigadeiro, Ninho c/ Nutella, Ninho c/ geleia de morango, Kinder Bueno, Ferrero ou Rafaello.', 'img/p/panetone-mini.jpg', { destaque: true, apartir: true }),
      P('n2', 'Panetone Trufado Grande', 'Natal 2025', 89.90, 'Chocotone ou frutas, aprox. 800 g. Mesmos sabores do mini, com muito mais recheio.', 'img/p/panetone-grande.jpg', { destaque: true, apartir: true }),
      P('n3', 'Caixa Natal 6 Doces', 'Natal 2025', 19.90, '6 brigadeiros gourmet, escolha até 2 sabores. Embalagem natalina, laço e tag.', ''),
      P('n4', 'Bombontone', 'Natal 2025', 13.90, 'Árvore de chocolate com massa de chocotone e recheio de doce de leite ou brigadeiro.', ''),
      P('n5', 'Duo Bombomtone', 'Natal 2025', 24.90, 'Caixa dourada com 2 árvores de chocolate recheadas.', ''),
      P('n6', 'Chocotone Bites', 'Natal 2025', 18.90, 'Pedaços de panetone ou chocotone cobertos com chocolate, aprox. 200 g.', ''),
      P('b1', 'Bolo de Chocolate', 'Bolos', 0, 'Massa de chocolate, recheio cremoso e raspas de chocolate. Tamanhos sob encomenda.', 'img/p/bolo-chocolate.jpg', { destaque: true }),
      P('b2', 'Bolo de Morango', 'Bolos', 0, 'Massa branca, recheio com morangos frescos e cobertura rosa.', 'img/p/bolo-morango.jpg'),
      P('b3', 'Bolo Ninho', 'Bolos', 0, 'Massa fofinha com creme de Ninho e cobertura chantininho.', 'img/p/bolo-ninho.jpg', { destaque: true }),
      P('d1', 'Morango Cravejado', 'Docinhos', 0, 'Morango fresco, brigadeiro cremoso e chocolate branco com pedacinhos crocantes.', 'img/p/morango-cravejado.jpg', { destaque: true }),
      P('d2', 'Pudim de Leite', 'Docinhos', 0, 'Pudim cremoso com calda de caramelo.', 'img/p/pudim.jpg', { destaque: true }),
      P('s1', 'Travessa Bombom de Morango', 'Sobremesas', 60, 'Creme de Ninho, morangos e ganache meio amargo. P serve até 6 · G serve de 12 a 15 (R$ 130).', 'img/p/travessa.jpg', { apartir: true }),
      P('s2', 'Travessa Banoffe', 'Sobremesas', 60, 'Farofa crocante, doce de leite, bananas, chantilly e canela. P ou G (R$ 130).', 'img/p/travessa.jpg', { apartir: true }),
      P('s3', 'Mousse de Maracujá Trufado', 'Sobremesas', 60, 'Mousse de maracujá azedinha e ganache de chocolate nobre. P ou G (R$ 130).', 'img/p/travessa.jpg', { apartir: true }),
      P('g1', 'Bolo Salgado', 'Salgados', 135, 'Pão de forma, salpicão de frango cremoso, maionese e batata palha.', 'img/p/bolo-salgado.jpg', { destaque: true }),
      P('g2', 'Empadão', 'Salgados', 145, 'Massa artesanal com frango cremoso e requeijão. Serve de 8 a 12 fatias.', 'img/p/torta-frango.jpg'),
      P('g3', 'Quiche de Brócolis', 'Salgados', 135, 'Massa leve e crocante com brócolis, bacon e queijo. Serve de 8 a 12 fatias.', 'img/p/quiche.jpg'),
      P('v1', 'Bolo Vulcão Ninho', 'Novidades', 15.90, 'Bolo no pote com calda de Ninho escorrendo.', ''),
      P('v2', 'Bolo Vulcão Brigadeiro', 'Novidades', 15.90, 'Bolo de chocolate com calda de brigadeiro cremoso.', ''),
      P('v3', 'Bolo Vulcão Dois Amores', 'Novidades', 15.90, 'Brigadeiro preto e branco no mesmo bolo.', ''),
      P('v4', 'Bolo Nuvem Brigadeiro', 'Novidades', 18.90, 'Bolo fofinho coberto com brigadeiro aerado.', ''),
      P('v5', 'Bolo Nuvem Ninho', 'Novidades', 18.90, 'Bolo fofinho com creme de Ninho.', ''),
      P('v6', 'Bolo Nuvem Ninho com Nutella', 'Novidades', 24.90, 'Creme de Ninho com Nutella.', ''),
      P('v7', 'Bolo Nuvem Ninho com Geleia de Morango', 'Novidades', 24.90, 'Creme de Ninho com geleia artesanal de morango.', ''),
      P('v8', 'Mini Bolo Vulcão Ninho com Nutella', 'Novidades', 20.90, 'Versão mini, com Ninho e Nutella.', ''),
      P('v9', 'Mini Bolo Vulcão Ninho com Geleia de Morango', 'Novidades', 20.90, 'Versão mini, com Ninho e geleia artesanal de morango.', ''),
      P('w1', 'Quadradinho de Brownie Chocolatudo', 'Brownies', 9.00, 'Brownie de chocolate nobre: crocante por fora, macio e molhadinho por dentro.', 'img/p/brownie-choco.jpg'),
      P('w2', 'Brownie Recheado', 'Brownies', 14.90, 'Doce de leite, brigadeiro, prestígio, Ninho com Nutella ou Ferrero.', 'img/p/brownie-recheado.jpg', { destaque: true }),
      P('w3', 'Afogadinho de Brownie', 'Brownies', 16.49, 'Brownie no copo com creme e cobertura de chocolate.', 'img/p/brownie-afogadinho.jpg', { destaque: true }),
      P('w4', 'Quadradinho de Brownie Supreme', 'Brownies', 0, 'Seleção de quadradinhos com coberturas variadas.', 'img/p/brownie-supreme.jpg'),
      P('c1', 'Coxinha de Frango com Catupiry', 'Salgados', 16.90, 'Massa de batata levinha e a crocância da farinha panko.', 'img/p/coxinha-recheio.jpg'),
      P('c2', 'Coxinha de Costela com Catupiry', 'Salgados', 19.90, 'Recheio de costela desfiada com Catupiry, empanada na panko.', ''),
      P('c3', 'Coxinha de Frango com Cream Cheese', 'Salgados', 13.90, 'Massa de batata, frango e cream cheese, crocante na panko.', 'img/p/coxinha-cream.jpg', { destaque: true }),
      P('c4', 'Coxinha de Costela', 'Salgados', 16.90, 'Costela desfiada temperada, empanada na panko.', ''),
      P('e1', 'Empada de Palmito', 'Empadas', 8.00, 'Massa amanteigada com recheio cremoso de palmito.', ''),
      P('e2', 'Empadão de Palmito · Marmitinha 220 g', 'Empadas', 15.99, 'Porção individual de empadão de palmito.', ''),
      P('k1', 'Coca-Cola 200 ml', 'Bebidas', 4.49, '', 'img/p/coca.jpg'),
      P('k2', 'Guaraná 200 ml', 'Bebidas', 4.49, '', 'img/p/guarana.jpg'),
      P('k3', 'Fanta Laranja 200 ml', 'Bebidas', 4.49, '', ''),
      P('k4', 'Sprite 200 ml', 'Bebidas', 4.49, '', 'img/p/sprite.jpg'),
      P('k5', 'Água Mineral 500 ml', 'Bebidas', 3.00, '', 'img/p/agua.jpg'),
      P('r1', 'Caixa Mini Trufas', 'Para presentear', 21.90, 'Caixa com 6 mini trufas, escolha até 2 sabores.', ''),
      P('r3', 'Caixa Gaveta 4 Doces', 'Para presentear', 14.90, '4 brigadeiros gourmet em caixa gaveta.', ''),
    ],
    promos: [
      { id: 'pr1', titulo: 'Menu Natalino', texto: 'Panetones trufados, caixas e mimos para presentear. Estoque limitado.', img: 'img/b/natal.jpg', ativa: true },
      { id: 'pr2', titulo: 'Chegou o morango cravejado', texto: 'Morango, brigadeiro e chocolate branco crocante.', img: 'img/p/morango-cravejado.jpg', ativa: true },
      { id: 'pr3', titulo: 'Cardápio de festas', texto: 'Bolos, docinhos, salgados e kit festa.', img: 'img/b/festas.jpg', ativa: true }
    ],
    videos: []
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.produtos) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const preco = p => !p.preco ? 'Sob consulta' : (p.apartir ? 'a partir de ' : '') + brl(p.preco);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.ShopStore = { KEY, CONFIG, CATEGORIAS, load, save, reset, brl, preco, uid };
})();
