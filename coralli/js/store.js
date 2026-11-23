/* Coralli · dados da loja (modo demonstração)
   Nesta versão os dados ficam salvos no navegador (localStorage).
   O painel /admin e o site leem o mesmo lugar, então o que for
   publicado no painel aparece no site do mesmo celular/computador. */
(function () {
  const KEY = 'coralli-demo-v1';

  const CONFIG = {
    whatsapp: '',               // ← WhatsApp da loja (ex.: 5511915159311). Vazio = número da StayPulse (demo)
    whatsappDemo: '5511975387719',
    instagram: 'https://www.instagram.com/use.coralli/',
    pedidoMinimoPecas: 0,       // ← pedido mínimo em peças (0 = sem mínimo)
    pedidoMinimoValor: 0,       // ← pedido mínimo em R$ (0 = sem mínimo)
    endereco: 'Feira da Madrugada · Térreo · Setor Roxo · C30 · Box 00237',
    destaques: ['Clientes', 'Pedidos', 'Entregas', 'Feedbacks', 'Coralli']
  };

  const CATEGORIAS = ['Conjuntos', 'Calças', 'Blusas', 'Croppeds', 'Moletons', 'Vestidos'];

  const P = (id, nome, categoria, preco, extra) => Object.assign({
    id, nome, categoria, preco, precoAntigo: null, tamanhos: ['P', 'M', 'G'], cores: [],
    descricao: '', fotos: [], status: 'publicado', promo: false, destaque: false,
    estoque: null, criado: Date.now() - Math.floor(Math.random() * 1e8)
  }, extra || {});

  const SEED = {
    aviso: 'SÓ ATACADO · Promoções do dia toda manhã · Box 00237 · Setor Roxo',
    produtos: [
      P('p1', 'Conjunto Canelado Gringa', 'Conjuntos', 69.9, { precoAntigo: 79.9, promo: true, destaque: true, cores: ['Rosa', 'Lilás', 'Preto'], descricao: 'Conjunto canelado com top e calça wide leg. Tecido encorpado e confortável.', estoque: 12 }),
      P('p2', 'Calça Jogger Moletinho', 'Calças', 42.9, { promo: true, cores: ['Preto', 'Cinza', 'Off-white'], descricao: 'Jogger em moletinho com punho e cordão.' }),
      P('p3', 'Cropped Manga Longa Básico', 'Croppeds', 24.9, { precoAntigo: 29.9, promo: true, cores: ['Preto', 'Branco', 'Rosa'], tamanhos: ['Único'], descricao: 'Cropped canelado manga longa, veste do P ao G.' }),
      P('p4', 'Moletom Oversized Gringo', 'Moletons', 89.9, { destaque: true, cores: ['Rosa bebê', 'Lavanda', 'Cinza'], tamanhos: ['M', 'G', 'GG'], descricao: 'Moletom oversized flanelado por dentro. Sucesso da temporada.' }),
      P('p5', 'Blusa Regata Alfaiataria', 'Blusas', 29.9, { cores: ['Preto', 'Off-white'], descricao: 'Regata com caimento de alfaiataria.' }),
      P('p6', 'Vestido Midi Canelado', 'Vestidos', 54.9, { destaque: true, cores: ['Preto', 'Marrom', 'Verde'], descricao: 'Vestido midi canelado com fenda lateral.', estoque: 5 }),
      P('p7', 'Calça Wide Leg Cós Alto', 'Calças', 59.9, { cores: ['Preto', 'Bege'], tamanhos: ['36', '38', '40', '42'], descricao: 'Wide leg com cós alto e bolsos laterais.' }),
      P('p8', 'Conjunto Moletom Jogger', 'Conjuntos', 119.9, { precoAntigo: 139.9, promo: true, cores: ['Cinza', 'Preto'], descricao: 'Moletom + jogger, flanelado.' }),
      P('p9', 'Cropped Ombro Só', 'Croppeds', 27.9, { status: 'rascunho', cores: ['Preto', 'Branco'], tamanhos: ['Único'], descricao: 'Cropped um ombro só.' }),
      P('p10', 'Blusa Segunda Pele', 'Blusas', 22.9, { status: 'esgotado', cores: ['Preto', 'Nude'], tamanhos: ['Único'] })
    ],
    videos: [
      { id: 'v1', titulo: 'Nunca pare de divulgar seu trabalho', categoria: 'Coralli', capa: 'img/videos/v1.jpg', url: '', views: '', status: 'publicado' },
      { id: 'v2', titulo: 'Fica postando igual blogueira...', categoria: 'Coralli', capa: 'img/videos/v2.jpg', url: '', views: '2,8 mil', status: 'publicado' },
      { id: 'v3', titulo: 'Embalando pedidos', categoria: 'Pedidos', capa: 'img/videos/v3.jpg', url: '', views: '', status: 'publicado' },
      { id: 'v4', titulo: 'Deus abençoando cada detalhe', categoria: 'Entregas', capa: 'img/videos/v4.jpg', url: '', views: '', status: 'publicado' },
      { id: 'v5', titulo: 'Tudo o que você fizer dará certo', categoria: 'Clientes', capa: 'img/videos/v5.jpg', url: '', views: '', status: 'publicado' },
      { id: 'v6', titulo: 'Separando as peças do dia', categoria: 'Pedidos', capa: 'img/videos/v6.jpg', url: '', views: '', status: 'publicado' },
      { id: 'v7', titulo: 'O mesmo Deus que te deu a ideia', categoria: 'Feedbacks', capa: 'img/videos/v7.jpg', url: '', views: '', status: 'publicado' }
    ]
  };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.produtos) return s; } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }   // memória cheia (fotos demais)
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* Ilustração de peça quando o produto ainda não tem foto */
  const CORES = { 'Rosa': '#F6B7C9', 'Rosa bebê': '#F9CFDB', 'Lilás': '#CDB7E9', 'Lavanda': '#D9CCF2', 'Preto': '#2B2B2E', 'Cinza': '#B9BCC2', 'Off-white': '#F1ECE2', 'Branco': '#F7F7F5', 'Bege': '#E4D3B9', 'Marrom': '#8A5A44', 'Verde': '#7FA68E', 'Nude': '#E8C4AE' };
  const SHAPES = {
    Conjuntos: '<path d="M70 40 90 30h20l20 10 18 30-16 8-10-14v34H78V64L68 78l-16-8z"/><path d="M78 112h44l4 76h-20l-4-56-4 56H74z" opacity=".85"/>',
    Calças: '<path d="M70 34h60l6 150h-26l-10-110-10 110H64z"/>',
    Blusas: '<path d="M64 46 86 36c4 8 24 8 28 0l22 10 16 34-20 8-8-14v92H76V74l-8 14-20-8z"/>',
    Croppeds: '<path d="M62 60 86 50c4 8 24 8 28 0l24 10 22 50-18 8-14-30v42H78V88l-14 30-18-8z"/>',
    Moletons: '<path d="M60 52 84 40c4 9 28 9 32 0l24 12 22 92-18 5-14-56v95H68V93l-14 56-18-5z"/><path d="M84 40c-2 16 34 16 32 0" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="4"/><path d="M68 176h64" stroke="rgba(0,0,0,.15)" stroke-width="6"/>',
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
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.CoralliStore = { KEY, CONFIG, CATEGORIAS, load, save, reset, fotosDe, ilustracao, brl, uid };
})();
