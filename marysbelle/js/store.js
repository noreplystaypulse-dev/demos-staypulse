/* Mary's Belle · dados do site (modo demonstração StayPulse)
   Nesta demo os dados ficam salvos no aparelho (localStorage).
   Na versão oficial passam para a nuvem e aparecem para todas as clientes. */
(function () {
  const KEY = 'marysbelle-demo-v1';

  const CONFIG = {
    whatsapp: '',                        // WhatsApp do studio: 5511932339811 (vazio = StayPulse, demo)
    whatsappDemo: '5511975387719',
    telefone: '(11) 93233-9811',
    instagram: 'marysbelle.estetica',
    endereco: 'Rua Euclides Pacheco, 376',
    bairro: 'Tatuapé · São Paulo - SP',
    horario: 'Atendimento com hora marcada',
    email: ''
  };

  const CATS = ['Estética facial', 'Lábios', 'Estética corporal', 'Cabelo', 'Unhas', 'Cílios e sobrancelhas', 'Depilação'];
  const FOTO_CATS = ['Estética', 'Lábios', 'Corporal', 'Cabelo', 'Unhas', 'Cílios', 'Studio'];

  const S = (id, cat, nome, preco, desc, extra) => Object.assign({ id, cat, nome, preco, de: 0, apartir: false, desc, ativo: true }, extra || {});
  const f = n => 'img/f/' + n + '.jpg';

  const SEED = {
    servicos: [
      S('s1', 'Estética facial', 'Limpeza de pele', 69.90, 'Remove impurezas, renova a pele e devolve o seu brilho natural.', { de: 89.90 }),
      S('s2', 'Estética facial', 'Limpeza de pele com Spa dos Lábios', 130, 'Limpeza profunda, poros desobstruídos e lábios hidratados com spa especializado.'),
      S('s3', 'Lábios', 'Hidra Gloss', 89.90, 'Hidrata, revitaliza e deixa seus lábios ainda mais bonitos.', { de: 110 }),
      S('s4', 'Lábios', 'Micro labial', 199.90, 'Realça a cor, define o contorno e valoriza a sua beleza natural.', { de: 250 }),
      S('s5', 'Estética corporal', 'Drenagem linfática · 4 sessões', 299.90, 'Reduz inchaço, melhora a circulação e modela o corpo.', { de: 399.90 }),
      S('s6', 'Estética corporal', 'Tratamento de estrias', 0, 'Avaliação personalizada para escolher o melhor protocolo.'),
      S('s7', 'Cabelo', 'Combo escova + hidratação', 170, 'Fios alinhados, sem frizz, nutridos e com muito brilho.'),
      S('s8', 'Cabelo', 'Escova', 0, 'Fios alinhados e com movimento.'),
      S('s9', 'Cabelo', 'Hidratação', 0, 'Nutre, fortalece e devolve a maciez aos fios.'),
      S('s10', 'Unhas', 'Unhas em gel', 0, 'Lindas por mais tempo, com acabamento natural.'),
      S('s11', 'Unhas', 'Manutenção em gel', 0, ''),
      S('s12', 'Cílios e sobrancelhas', 'Extensão de cílios', 0, 'Olhar marcante e natural.'),
      S('s13', 'Cílios e sobrancelhas', 'Design de sobrancelhas', 0, ''),
      S('s14', 'Depilação', 'Depilação', 0, 'Consulte as áreas e valores.', { apartir: true })
    ],
    promos: [
      { id: 'p1', titulo: 'Promoções de estética', img: f('art-promos'), texto: 'Limpeza de pele, Hidra Gloss, Drenagem linfática e Micro labial com valores especiais.', de: 0, por: 69.90, apartir: true, ativa: true },
      { id: 'p2', titulo: 'Combo Cuidado e Beleza', img: f('art-cabelo'), texto: 'Escova + hidratação: fios alinhados, nutridos e com muito brilho.', de: 0, por: 170, apartir: false, ativa: true },
      { id: 'p3', titulo: 'Limpeza de Pele com Spa dos Lábios', img: f('art-limpeza'), texto: 'Remove impurezas, desobstrui os poros e renova os lábios.', de: 0, por: 130, apartir: false, ativa: true }
    ],
    fotos: [
      { id: 'g1', src: f('rosto-limpeza'), cat: 'Estética', legenda: 'Limpeza de pele' },
      { id: 'g2', src: f('labios'), cat: 'Lábios', legenda: 'Spa dos lábios' },
      { id: 'g3', src: f('cabelo'), cat: 'Cabelo', legenda: 'Escova + hidratação' },
      { id: 'g4', src: f('unhas'), cat: 'Unhas', legenda: 'Unhas em gel' },
      { id: 'g5', src: f('rosto-pincel'), cat: 'Estética', legenda: 'Máscara facial' },
      { id: 'g6', src: f('microlabial'), cat: 'Lábios', legenda: 'Micro labial' },
      { id: 'g7', src: f('drenagem'), cat: 'Corporal', legenda: 'Drenagem linfática' },
      { id: 'g8', src: f('hidragloss'), cat: 'Lábios', legenda: 'Hidra Gloss' }
    ],
    config: {}
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.servicos) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const preco = s => !s.preco ? 'Sob consulta' : (s.apartir ? 'a partir de ' : '') + brl(s.preco);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cfg = d => Object.assign({}, CONFIG, (d && d.config) || {});

  window.MarysStore = { KEY, CONFIG, CATS, FOTO_CATS, load, save, reset, brl, preco, uid, cfg };
})();
