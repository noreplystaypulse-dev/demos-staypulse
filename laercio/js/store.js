/* Laercio Eng Civil · dados da demonstração (StayPulse)
   Na versão oficial os dados ficam na nuvem; nesta demo ficam salvos no aparelho. */
(function () {
  const KEY = 'laercio-demo-v1';

  const CONFIG = {
    nome: 'Laercio Eng Civil',
    titulo: 'Engenharia Civil e Segurança do Trabalho',
    whatsapp: '',                       // número do cliente: 5534999936620
    whatsappDemo: '5511975387719',      // StayPulse, enquanto for demonstração
    telefone: '(34) 9 9993-6620',
    email: 'ls_engecivil@yahoo.com.br',
    instagram: 'laercio.eng.civil',
    regiao: 'Minas Gerais',
    crea: ''                            // ex.: 'CREA-MG 000000/D' (aparece no rodapé quando preenchido)
  };

  const CAT_PROJ = ['Execução de obras', 'Projetos estruturais', 'Fundações', 'Instalações elétricas', 'Laudos e fiscalização'];
  const CAT_NEWS = ['Obras', 'Projetos', 'Dicas técnicas', 'Empresa'];
  const ICONES = {
    obra: 'Obra', projeto: 'Projeto', eletrica: 'Elétrica', consultoria: 'Consultoria',
    laudo: 'Laudo', fiscal: 'Fiscalização', seguranca: 'Segurança', orcamento: 'Orçamento'
  };

  const f = n => 'img/f/' + n + '.jpg';
  const Pj = (id, titulo, cat, local, ano, resumo, fotos, extra) => Object.assign({ id, titulo, cat, local, ano, resumo, fotos: fotos.map(f), destaque: false, status: 'publicado', criado: Date.now() }, extra || {});
  const Sv = (id, icone, nome, desc) => ({ id, icone, nome, desc, status: 'publicado' });
  const Nw = (id, titulo, data, cat, foto, texto) => ({ id, titulo, data, cat, foto: f(foto), texto, status: 'publicado' });

  const SEED = {
    projetos: [
      Pj('p1', 'Conjunto habitacional', 'Execução de obras', 'Minas Gerais', '', 'Execução e acompanhamento de conjunto residencial com blocos de apartamentos, da fundação ao acabamento.', ['conjunto'], { destaque: true }),
      Pj('p2', 'Edifício residencial multifamiliar', 'Execução de obras', 'Minas Gerais', '', 'Estrutura em concreto armado, alvenaria e fechamento de edifício residencial de vários pavimentos.', ['predio', 'obra-urbana'], { destaque: true }),
      Pj('p3', 'Projeto estrutural em concreto armado', 'Projetos estruturais', 'Minas Gerais', '', 'Modelagem 3D, cálculo e detalhamento de pilares, vigas e lajes, com quantitativos de material.', ['estrutura-3d-1', 'estrutura-3d-2', 'estrutura-3d-3'], { destaque: true }),
      Pj('p4', 'Lajes e armaduras · Rua Sérgio Lima', 'Execução de obras', 'Itajubá - MG', '2024', 'Escoramento, armação e concretagem de lajes, com conferência de armaduras antes de cada etapa.', ['laje-1', 'laje-2', 'escoramento', 'concretagem-rua'], { destaque: true }),
      Pj('p5', 'Fundações e baldrame', 'Fundações', 'Minas Gerais', '', 'Sapatas, vigas baldrame e impermeabilização, executadas conforme projeto e sondagem.', ['fundacao', 'baldrame', 'muro-armacao']),
      Pj('p6', 'Instalações elétricas e quadros de distribuição', 'Instalações elétricas', 'Minas Gerais', '', 'Projeto e montagem de quadros com DPS e disjuntores identificados por circuito.', ['quadro-eletrico', 'diagrama-quadro', 'caixas-eletricas']),
      Pj('p7', 'Edificação de dois pavimentos', 'Laudos e fiscalização', 'Minas Gerais', '', 'Fiscalização de obra e acompanhamento técnico até a entrega da edificação.', ['edificio-escola', 'edificio-escola-2']),
      Pj('p8', 'Residência unifamiliar', 'Execução de obras', 'Minas Gerais', '', 'Projeto e execução de residência, com acompanhamento em todas as fases da obra.', ['residencia', 'sobrado']),
      Pj('p9', 'Alvenaria e acabamento', 'Execução de obras', 'Minas Gerais', '', 'Levantamento de alvenaria, vergas, contravergas e acabamentos internos.', ['alvenaria', 'acabamento'])
    ],
    servicos: [
      Sv('s1', 'obra', 'Execução de obras', 'Da fundação à entrega das chaves, com responsável técnico acompanhando cada etapa no canteiro.'),
      Sv('s2', 'projeto', 'Projetos estruturais', 'Cálculo e detalhamento em concreto armado, com modelagem 3D e lista de materiais.'),
      Sv('s3', 'eletrica', 'Projetos elétricos', 'Dimensionamento de circuitos, quadros de distribuição e proteção para residências e comércios.'),
      Sv('s4', 'consultoria', 'Consultoria técnica', 'Orientação para quem vai construir, reformar ou regularizar: decisões certas antes de gastar.'),
      Sv('s5', 'laudo', 'Laudos técnicos', 'Vistorias, laudos de inspeção e pareceres com ART para bancos, condomínios e processos.'),
      Sv('s6', 'fiscal', 'Fiscalização de obras', 'Acompanhamento independente de prazos, qualidade e medições para o dono da obra.'),
      Sv('s7', 'seguranca', 'Segurança do trabalho', 'Engenharia de segurança: PGR, treinamentos e adequação do canteiro às normas.'),
      Sv('s8', 'orcamento', 'Orçamentos e quantitativos', 'Planilhas por etapa com materiais, mão de obra e cronograma físico-financeiro.')
    ],
    novidades: [
      Nw('n1', 'Lajes concretadas na Rua Sérgio Lima, em Itajubá', '2026-11-05', 'Obras', 'laje-1', 'Mais uma etapa concluída: escoramento conferido, armaduras revisadas e concretagem feita com acompanhamento técnico do início ao fim.'),
      Nw('n2', 'Planilha própria para dimensionamento de piso industrial', '2026-10-22', 'Dicas técnicas', 'piso-industrial', 'Desenvolvemos uma ferramenta para dimensionar pisos industriais com barras de transferência e telas soldadas, a partir do relatório de cargas.'),
      Nw('n3', 'Orçamento com quantitativos por etapa da obra', '2026-10-08', 'Projetos', 'quantitativos', 'Cada orçamento sai com materiais e custos separados por etapa, para o cliente saber exatamente quanto vai investir em cada fase.'),
      Nw('n4', 'Equipe em campo: segurança em primeiro lugar', '2026-09-18', 'Empresa', 'equipe', 'Capacetes, EPIs e treinamento antes de cada concretagem. Engenharia de segurança faz parte de todas as nossas obras.')
    ],
    config: {}
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.projetos) return s; } catch (e) {} return JSON.parse(JSON.stringify(SEED)); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cfg = d => Object.assign({}, CONFIG, (d && d.config) || {});

  window.EngStore = { KEY, CONFIG, CAT_PROJ, CAT_NEWS, ICONES, load, save, reset, uid, cfg };
})();
