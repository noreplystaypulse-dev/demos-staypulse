/* Coralli · dados da loja (modo demonstração)
   Nesta versão os dados ficam salvos no navegador (localStorage).
   O painel /admin e o site leem o mesmo lugar, então o que for
   publicado no painel aparece no site do mesmo celular/computador. */
(function () {
  const KEY = 'coralli-demo-v2';

  const CONFIG = {
    whatsapp: '',               // ← WhatsApp da loja (ex.: 5511915159311). Vazio = número da StayPulse (demo)
    whatsappDemo: '5511975387719',
    instagram: 'https://www.instagram.com/use.corallii/',
    pedidoMinimoPecas: 0,       // ← pedido mínimo em peças (0 = sem mínimo)
    pedidoMinimoValor: 0,       // ← pedido mínimo em R$ (0 = sem mínimo)
    endereco: 'Feira da Madrugada · Térreo · Setor Roxo · C30 · Box 00237',
    /* NAP: deve ser IGUAL ao do Google Meu Negócio (nome, endereço, telefone) */
    nap: { nome: 'Coralli', rua: 'Feira da Madrugada, Térreo, Setor Roxo, C30, Box 00237', bairro: 'Brás', cidade: 'São Paulo', uf: 'SP', cep: '', telefone: '+55 11 91515-9311', email: 'coralstoreat@gmail.com' },
    destaques: ['Clientes', 'Pedidos', 'Entregas', 'Feedbacks', 'Coralli'],
    parcelas: 3,                // ← "ou 3x de R$ ..." no cartão (0 = não mostra)
    beneficios: [['card', 'Pague parcelado', 'no cartão de crédito'], ['pix', 'Pix na hora', 'aprovação imediata'], ['truck', 'Enviamos', 'para todo o Brasil'], ['box', 'Atacado', 'direto do nosso box']],
    sobre: 'Seu estilo, suas regras e aquele look que faz você se sentir INCRÍVEL! 💚✨ Na Coralli, você encontra peças lindas, estilosas e versáteis para montar produções que têm tudo a ver com você e com a sua loja. Chega mais, explore nossas novidades e encontre aquela peça que vai virar sua nova favorita! 🛍️'
  };

  const CATEGORIAS = ['Vestidos', 'Conjuntos', 'Saias', 'Corseletes e bodies', 'Macacões', 'Moda praia'];

  const P = (id, nome, categoria, preco, extra) => Object.assign({
    id, nome, categoria, preco, precoAntigo: null, tamanhos: ['P', 'M', 'G'], cores: [],
    descricao: '', fotos: [], status: 'publicado', promo: false, destaque: false,
    estoque: null, criado: Date.now() - Math.floor(Math.random() * 1e8)
  }, extra || {});
  const F = n => ['img/p/' + n + '.webp'];

  const SEED = {
    aviso: 'SÓ ATACADO · Peças novas toda semana · Box 00237 · Setor Roxo',
    produtos: [
      P('p1', 'Vestido Jully', 'Vestidos', 50, { fotos: F('vestido-jully'), destaque: true, descricao: 'Vestido midi ombro só, justinho ao corpo. Caimento perfeito e tecido com elastano.' }),
      P('p2', 'Saia Drapeada Isis', 'Saias', 40, { fotos: F('saia-isis'), promo: true, descricao: 'Saia curta drapeada com amarração lateral. Combina com corselete e cropped.' }),
      P('p3', 'Vestido Bia', 'Vestidos', 45, { fotos: F('vestido-bia'), descricao: 'Vestido curto frente única, com decote e costas abertas.' }),
      P('p4', 'Macacão Cereja', 'Macacões', 40, { fotos: F('macacao-cereja'), promo: true, descricao: 'Macaquinho estampado de cerejas, alcinha e amarração no busto.' }),
      P('p5', 'Corselete Renata', 'Corseletes e bodies', 45, { fotos: F('corselete-renata'), destaque: true, cores: ['Marrom', 'Preto', 'Azul', 'Verde', 'Rosa'], tamanhos: ['P', 'M', 'G'], descricao: 'Corselete tomara que caia com bojo e barbatanas. Várias cores.' }),
      P('p6', 'Vestido Mariel', 'Vestidos', 55, { fotos: F('vestido-mariel'), descricao: 'Vestido longo frente única com fenda. Valoriza a silhueta.' }),
      P('p7', 'Saia Marie', 'Saias', 45, { fotos: F('saia-marie'), cores: ['Preto', 'Branco', 'Vermelho', 'Amarelo', 'Azul'], descricao: 'Saia curta com babado, disponível em várias cores.' }),
      P('p8', 'Saída de praia', 'Moda praia', 35, { fotos: F('saida-praia'), promo: true, tamanhos: ['Único'], descricao: 'Calça saída de praia em tricô vazado, cós com amarração.' }),
      P('p9', 'Conjunto Mari', 'Conjuntos', 55, { fotos: F('conjunto-mari'), descricao: 'Cropped de manguinha + saia longa canelada.' }),
      P('p10', 'Conjunto Bicolor', 'Conjuntos', 50, { fotos: F('conjunto-bicolor'), tamanhos: ['U (34 ao 42)'], descricao: 'Top + calça flare estampados. Tamanho único, veste do 34 ao 42.' }),
      P('p11', 'Vestido Natasha', 'Vestidos', 50, { fotos: F('vestido-natasha'), destaque: true, descricao: 'Vestido curto frente única com saia rodada.' }),
      P('p12', 'Biquínis', 'Moda praia', 25, { fotos: F('biquinis'), promo: true, tamanhos: ['P', 'M', 'G'], cores: ['Sortido'], descricao: 'Biquínis em várias estampas e cores. Ótimos para revenda.' }),
      P('p13', 'Conjunto Agustina', 'Conjuntos', 55, { fotos: F('conjunto-agustina'), destaque: true, descricao: 'Blusa com babados e amarração + short. Leve e romântico.' }),
      P('p14', 'Conjunto Paty', 'Conjuntos', 45, { fotos: F('conjunto-paty'), descricao: 'Top faixa + saia curta. Peça curinga para a noite.' }),
      P('p15', 'Conjunto Duda', 'Conjuntos', 55, { fotos: F('conjunto-duda'), descricao: 'Cropped + calça wide leg em malha.' }),
      P('p16', 'Body Renda', 'Corseletes e bodies', 45, { fotos: F('body-renda'), cores: ['Preto', 'Branco', 'Marrom', 'Azul'], descricao: 'Body manga longa em renda, com gola alta.' }),
      P('p17', 'Conjunto Eloísa', 'Conjuntos', 45, { fotos: F('conjunto-eloisa'), descricao: 'Cropped de alça + short saia em tricô.' }),
      P('p18', 'Saia longa com fenda', 'Saias', 35, { fotos: F('saia-longa'), promo: true, descricao: 'Saia longa justa com fenda, em malha canelada.' }),
      P('p19', 'Conjunto Farm', 'Conjuntos', 65, { fotos: F('conjunto-farm'), destaque: true, descricao: 'Blusa e short estampados, inspirados na estética Farm.' }),
      P('p20', 'Vestido Gringa', 'Vestidos', 45, { fotos: F('vestido-gringa'), descricao: 'Vestido curto decote V, em malha encorpada.' }),
      P('p21', 'Corselete Tami', 'Corseletes e bodies', 45, { fotos: F('corselete-tami'), descricao: 'Corselete em tule com bojo e barbatanas.' }),
      P('p22', 'Vestido Danne', 'Vestidos', 55, { fotos: F('vestido-danne'), descricao: 'Vestido curto ombro a ombro com franzido.' }),
      P('p23', 'Corselete Tainá', 'Corseletes e bodies', 45, { fotos: F('corselete-taina'), cores: ['Vermelho', 'Azul'], descricao: 'Corselete com renda e bojo, acabamento delicado.' }),
      P('p24', 'Conjunto Mirella', 'Conjuntos', 50, { fotos: F('conjunto-mirella'), descricao: 'Cropped manga longa + calça jogger. Conforto com estilo.' }),
      P('p25', 'Conjunto Isa', 'Conjuntos', 55, { fotos: F('conjunto-isa'), descricao: 'Cropped de alça + calça pantalona.' })
    ],
    pedidos: [
      { id: 'o1', num: 1001, data: Date.now() - 864e5, entrega: '', nome: 'Naabamba Modas', cpf: '123.456.789-00', tel: '(11) 98888-7777', cep: '01001-000', end: 'Rua das Flores', numero: '120', bairro: 'Centro', cidade: 'São Paulo - SP', forma: 'Transportadora', obs: 'Separar por tamanho, por favor 💗',
        itens: [{ nome: 'Corselete Renata', cor: 'Rosa', tam: 'M', qtd: 8, preco: 45 }, { nome: 'Conjunto Agustina', cor: '', tam: 'P', qtd: 6, preco: 55 }, { nome: 'Body Renda', cor: 'Preto', tam: 'M', qtd: 7, preco: 45 }, { nome: 'Saia Marie', cor: 'Vermelho', tam: 'G', qtd: 5, preco: 45 }, { nome: 'Biquínis', cor: 'Sortido', tam: 'M', qtd: 10, preco: 25 }], status: 'novo' }
    ],
    seq: 1001,
    /* banners do topo (carrossel). Com "pronta: true" a imagem já é o banner completo (arte do designer) */
    banners: [
      { id: 'b1', ativo: true, pronta: false, img: 'img/p/vestido-jully.webp', l1: 'Seu estilo em', l2: 'evidência', sub: '20% OFF na primeira compra', cupom: 'PRIMEIRA20', botao: 'Aproveitar agora', cat: 'Lançamentos', fundo: 'tif' },
      { id: 'b2', ativo: true, pronta: false, img: 'img/p/conjunto-farm.webp', l1: 'Looks que', l2: 'valorizam', sub: 'V O C Ê', cupom: '', botao: 'Compre agora', cat: 'Conjuntos', fundo: 'pink' },
      { id: 'b3', ativo: true, pronta: false, img: 'img/p/biquinis.webp', l1: 'Vista-se de', l2: 'Corais e Mar', sub: 'Roupas femininas com a leveza do oceano', cupom: '', botao: 'Ver moda praia', cat: 'Moda praia', fundo: 'mar' }
    ],
    /* faixas de categoria (embaixo do carrossel) */
    faixas: [
      { id: 'f1', ativo: true, img: 'img/p/vestido-mariel.webp', l1: 'Moda que', l2: 'realça', sub: 'a sua beleza', cat: 'Vestidos', fundo: 'pink' },
      { id: 'f2', ativo: true, img: 'img/p/saida-praia.webp', l1: 'Look', l2: 'Praia', sub: 'Estilo que te acompanha em todos os momentos', cat: 'Moda praia', fundo: 'mar' },
      { id: 'f3', ativo: true, img: 'img/p/conjunto-mirella.webp', l1: 'Conjunto', l2: 'Casual', sub: 'Conforto e estilo para o dia a dia', cat: 'Conjuntos', fundo: 'tif' }
    ],
    cupons: [{ codigo: 'PRIMEIRA20', pct: 20, ativo: true }],
    videos: [
      { id: 'v1', titulo: 'Nunca pare de divulgar seu trabalho', categoria: 'Coralli', capa: 'img/videos/v1.webp', url: '', views: '', status: 'publicado' },
      { id: 'v2', titulo: 'Fica postando igual blogueira...', categoria: 'Coralli', capa: 'img/videos/v2.webp', url: '', views: '2,8 mil', status: 'publicado' },
      { id: 'v3', titulo: 'Embalando pedidos', categoria: 'Pedidos', capa: 'img/videos/v3.webp', url: '', views: '', status: 'publicado' },
      { id: 'v4', titulo: 'Deus abençoando cada detalhe', categoria: 'Entregas', capa: 'img/videos/v4.webp', url: '', views: '', status: 'publicado' },
      { id: 'v5', titulo: 'Tudo o que você fizer dará certo', categoria: 'Clientes', capa: 'img/videos/v5.webp', url: '', views: '', status: 'publicado' },
      { id: 'v6', titulo: 'Separando as peças do dia', categoria: 'Pedidos', capa: 'img/videos/v6.webp', url: '', views: '', status: 'publicado' },
      { id: 'v7', titulo: 'O mesmo Deus que te deu a ideia', categoria: 'Feedbacks', capa: 'img/videos/v7.webp', url: '', views: '', status: 'publicado' }
    ]
  };

  function load() {
    try { let s = JSON.parse(localStorage.getItem(KEY)); if (s && s.produtos) { s = JSON.parse(JSON.stringify(s).replace(/(img\/(?:p|videos)\/[a-z0-9-]+)\.jpg/g, '$1.webp')); s.pedidos = s.pedidos || []; s.seq = s.seq || 1000; ['banners', 'faixas', 'cupons'].forEach(k => { if (!s[k]) s[k] = JSON.parse(JSON.stringify(SEED[k])); }); return s; } } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }   // memória cheia (fotos demais)
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* Ilustração de peça quando o produto ainda não tem foto */
  const CORES = { 'Rosa': '#F6B7C9', 'Rosa bebê': '#F9CFDB', 'Lilás': '#CDB7E9', 'Lavanda': '#D9CCF2', 'Preto': '#2B2B2E', 'Cinza': '#B9BCC2', 'Off-white': '#F1ECE2', 'Branco': '#F7F7F5', 'Bege': '#E4D3B9', 'Marrom': '#8A5A44', 'Verde': '#7FA68E', 'Nude': '#E8C4AE', 'Vermelho': '#D7263D', 'Amarelo': '#F2C94C', 'Azul': '#4A7FD6', 'Sortido': '#F48FB1' };
  const SHAPES = {
    Conjuntos: '<path d="M70 40 90 30h20l20 10 18 30-16 8-10-14v34H78V64L68 78l-16-8z"/><path d="M78 112h44l4 76h-20l-4-56-4 56H74z" opacity=".85"/>',
    Calças: '<path d="M70 34h60l6 150h-26l-10-110-10 110H64z"/>',
    Blusas: '<path d="M64 46 86 36c4 8 24 8 28 0l22 10 16 34-20 8-8-14v92H76V74l-8 14-20-8z"/>',
    Croppeds: '<path d="M62 60 86 50c4 8 24 8 28 0l24 10 22 50-18 8-14-30v42H78V88l-14 30-18-8z"/>',
    Moletons: '<path d="M60 52 84 40c4 9 28 9 32 0l24 12 22 92-18 5-14-56v95H68V93l-14 56-18-5z"/><path d="M84 40c-2 16 34 16 32 0" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="4"/><path d="M68 176h64" stroke="rgba(0,0,0,.15)" stroke-width="6"/>',
    'Saias': '<path d="M74 40h52l18 140H56z"/>',
    'Corseletes e bodies': '<path d="M66 60h68l-6 120H72z"/>',
    'Macacões': '<path d="M74 34h52v60l8 96h-26l-8-70-8 70H66l8-96z"/>',
    'Moda praia': '<path d="M66 60c20 14 48 14 68 0l-8 30H74zM70 120h60l-14 30H84z"/>',
    Vestidos: '<path d="M82 34h36l-4 30 26 128H60L86 64z"/>'
  };
  function ilustracao(produto, i) {
    const cor = CORES[(produto.cores || [])[i || 0]] || '#9ED6D1';
    const shape = SHAPES[produto.categoria] || SHAPES.Blusas;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><rect width="200" height="240" fill="#F6F5F3"/><ellipse cx="100" cy="214" rx="56" ry="6" fill="rgba(0,0,0,.06)"/><g fill="${cor}" stroke="rgba(0,0,0,.08)" stroke-width="1.5">${shape}</g></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function fotosDe(p) { return (p.fotos && p.fotos.length) ? p.fotos : (p.cores && p.cores.length ? p.cores.slice(0, 3) : [null]).map((_, i) => ilustracao(p, i)); }

  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const totalPed = p => { const v = (p.itens || []).reduce((a, i) => a + i.qtd * i.preco, 0); return Math.max(0, v - (p.desconto || 0)); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.CoralliStore = { KEY, CONFIG, CATEGORIAS, load, save, reset, fotosDe, ilustracao, brl, uid, totalPed };
})();
