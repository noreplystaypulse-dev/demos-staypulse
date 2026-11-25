/* Bololô Restaurant & Bar · dados da demonstração (StayPulse)
   Nesta demo tudo fica salvo no aparelho (localStorage).
   Na versão oficial vai para a nuvem e aparece na hora para todos os clientes. */
(function () {
  const KEY = 'bololo-demo-v1';

  const CONFIG = {
    whatsapp: '',                       // WhatsApp de reservas do Bololô (vazio = StayPulse, demo)
    whatsappDemo: '5511975387719',
    reservasLink: 'https://wa.me/message/VJMSS2BZMHU2C1',   // link oficial de reservas (bio.site)
    xmenu: 'https://pedido.xmenu.com.br/?loja=19625#/vitrine',
    ifood: '',
    instagram: 'bololorestaurant',
    tiktok: 'bololorestaurant',
    facebook: 'https://www.facebook.com/profile.php?id=61561835594720',
    youtube: 'Cd83lAzKSvY',
    franquia: 'https://anconaconsultoria.com.br/lp-bololo/',
    endereco: 'Praça Vinte de Janeiro, 57',
    bairro: 'Vila Regente Feijó · São Paulo - SP · 03335-060',
    mapa: 'https://maps.app.goo.gl/Pj8FZwoXEJ5GexPd6',
    horario: 'Aberto todos os dias',
    logo: '',                           // vazio = img/logo.png (pode trocar pelo painel)
    pdf: '',                            // cardápio em PDF (subido pelo painel)
    pdfNome: ''
  };

  const CATS = ['Pratos principais', 'Carnes & grelhados', 'Peixes', 'Petiscos', 'Bar & drinks', 'Sobremesas'];

  let n = 0;
  const I = (cat, nome, foto, desc, extra) => Object.assign({ id: 'b' + (++n), cat, nome, preco: 0, foto: foto ? 'img/p/' + foto + '.jpg' : '', desc: desc || '', badge: '', lua: true, destaque: false, ativo: true }, extra || {});

  const SEED = {
    itens: [
      I('Pratos principais', 'Carbonara com Filé Mignon', 'carbonara-mignon', 'Espaguete à carbonara cremoso, parmesão e medalhão de filé mignon grelhado.', { badge: 'Campeão de vendas', destaque: true }),
      I('Peixes', 'Carbonara com Salmão', 'carbonara-salmao', 'O carbonara da casa com posta de salmão grelhado.'),
      I('Pratos principais', 'Carbonara Família', 'carbonara-familia', 'Carbonara com tiras de filé mignon na frigideira. Serve até 4 pessoas.', { badge: 'Serve até 4', destaque: true }),
      I('Carnes & grelhados', 'Parmegiana de Mignon', 'parmegiana', 'Filé mignon à parmegiana gratinado, com arroz e fritas.', { destaque: true }),
      I('Carnes & grelhados', 'Picanha com Aligot', '', 'Picanha grelhada no ponto com aligot cremoso de queijo.', { badge: 'Novidade' }),
      I('Carnes & grelhados', 'Costela crocante', 'costela', 'Costela assada lentamente, finalizada crocante com sal grosso e alecrim.'),
      I('Pratos principais', 'Baião de dois', 'baiao', 'Arroz, feijão-de-corda, bacon e linguiça com cubos de queijo coalho dourado.'),
      I('Petiscos', 'Coxinhas da casa', 'coxinha', 'Coxinhas crocantes com molho da casa. Perfeitas com uma Heineken gelada.'),
      I('Bar & drinks', 'Bololô Drink', 'bololo-drink', 'O drink autoral da casa.', { badge: 'Autoral', destaque: true }),
      I('Bar & drinks', 'Drink de Pitaya', 'pitaya', 'Pitaya, hortelã, gelo e Red Bull Pitaya Edition.'),
      I('Bar & drinks', 'Gin da casa', 'drinks-casa', 'Maracujá, frutas vermelhas, kiwi ou limão siciliano.'),
      I('Bar & drinks', 'Os melhores drinks', 'drinks-trio', 'Seleção de drinks clássicos e autorais do bar.'),
      I('Sobremesas', 'Sobremesas da casa', 'sobremesas', 'Petit gâteau com sorvete, cocada com sorvete no coco e pavê no copo.')
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

  window.BololoStore = { KEY, CONFIG, CATS, load, save, reset, brl, preco, uid, cfg };
})();
