/* Studio Thata Souza · dados do site (modo demonstração)
   Os dados ficam salvos no navegador (localStorage): o que for publicado
   no painel /admin aparece no site do mesmo aparelho. Na versão oficial,
   isso passa para a nuvem e aparece para todo mundo. */
(function () {
  const KEY = 'thata-demo-v1';

  const CONFIG = {
    whatsapp: '',                       // ← WhatsApp do studio (5511992015562). Vazio = StayPulse (demo)
    whatsappDemo: '5511975387719',
    instagram: 'https://www.instagram.com/studiothatasouza/',
    endereco: 'Rua Imbaçal, 567 - Parada XV de Novembro, São Paulo - SP',
    profissional: 'Thata',
    // dia da semana (0 = domingo) → [abre, fecha]. Confirmar com a Thata.
    horarios: { 0: [], 1: [], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 16] }
  };

  const SEED = {
    servicos: [
      { id: 'design', cat: 'Sobrancelhas e lábios', nome: 'Design de sobrancelhas', preco: 35, min: 30, ativo: true },
      { id: 'micro-fio', cat: 'Sobrancelhas e lábios', nome: 'Micropigmentação fio a fio e shadow', preco: 250, min: 150, ativo: true },
      { id: 'micro-labial', cat: 'Sobrancelhas e lábios', nome: 'Micro labial', preco: 199, min: 120, ativo: true },
      { id: 'vol-brasileiro', cat: 'Cílios', nome: 'Volume brasileiro', preco: 120, min: 120, ativo: true },
      { id: 'vol-egipcio', cat: 'Cílios', nome: 'Volume egípcio', preco: 140, min: 120, ativo: true },
      { id: 'fox-eyes', cat: 'Cílios', nome: 'Fox eyes', preco: 150, min: 150, ativo: true },
      { id: 'buco', cat: 'Depilação', nome: 'Buço', preco: 15, min: 30, ativo: true },
      { id: 'axilas', cat: 'Depilação', nome: 'Axilas', preco: 25, min: 30, ativo: true },
      { id: 'meia-perna', cat: 'Depilação', nome: 'Meia perna', preco: 40, min: 30, ativo: true },
      { id: 'perna-inteira', cat: 'Depilação', nome: 'Perna inteira', preco: 55, min: 60, ativo: true },
      { id: 'barriga', cat: 'Depilação', nome: 'Barriga', preco: 35, min: 30, ativo: true },
      { id: 'costa', cat: 'Depilação', nome: 'Costa', preco: 60, min: 60, ativo: true }
    ],
    fotos: [
      { id: 'f1', src: 'img/fotos/cilios-1.jpg', cat: 'Cílios', legenda: 'Volume brasileiro + design com henna' },
      { id: 'f2', src: 'img/fotos/cilios-2.jpg', cat: 'Cílios', legenda: 'Volume brasileiro' },
      { id: 'f3', src: 'img/fotos/depois-1.jpg', cat: 'Cílios', legenda: 'Olhar marcante' },
      { id: 'f4', src: 'img/fotos/depois-2.jpg', cat: 'Sobrancelhas', legenda: 'Design com henna' }
    ],
    antesDepois: [
      { id: 'a1', titulo: 'Volume brasileiro + design com henna', antes: 'img/fotos/antes-1.jpg', depois: 'img/fotos/depois-1.jpg' },
      { id: 'a2', titulo: 'Volume brasileiro + design com henna', antes: 'img/fotos/antes-2.jpg', depois: 'img/fotos/depois-2.jpg' }
    ]
  };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.servicos) return s; } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const CATS = ['Sobrancelhas e lábios', 'Cílios', 'Depilação'];
  const FOTO_CATS = ['Cílios', 'Sobrancelhas', 'Micropigmentação', 'Lábios', 'Studio'];

  window.ThataStore = { CONFIG, CATS, FOTO_CATS, load, save, reset, brl, uid };
})();
