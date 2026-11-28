/* Coralli · conexão com a nuvem (Supabase · StayPulse Sites)
   Quando este arquivo é carregado, a loja deixa de usar o localStorage e passa a ler e gravar no Supabase.
   A chave abaixo é a "publishable" (pública): a segurança vem das regras RLS do banco. */
(function () {
  const CLOUD = { url: 'https://yytipazokjbyfqtmmpfx.supabase.co', key: 'sb_publishable_1qFNfECHVYCJVXzh1FItPw_NHUfX410', loja: 'coralli', bucket: 'lojas' };
  const S = window.CoralliStore;
  if (!S || !window.supabase) return;
  const L = CLOUD.loja, CACHE = 'coralli-cloud-cache';
  /* o link de convite / troca de senha chega com #...type=invite|recovery: guardamos antes do supabase limpar a URL */
  const hashTipo = (location.hash.match(/type=(invite|recovery|signup|magiclink)/) || [])[1] || '';
  const hashErro = decodeURIComponent((location.hash.match(/error_description=([^&]+)/) || [])[1] || '').replace(/\+/g, ' ');
  const sb = window.supabase.createClient(CLOUD.url, CLOUD.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit', storageKey: 'sp-sites-auth' } });

  /* ---------- conversão banco <-> formato do site ---------- */
  const ms = s => s ? Date.parse(s) : Date.now();
  const iso = v => new Date(v || Date.now()).toISOString();
  const omit = (o, ks) => { const r = Object.assign({}, o); ks.forEach(k => delete r[k]); return r; };
  const rowProd = r => ({ id: r.id, legacy: r.legacy_id || '', nome: r.nome, categoria: r.categoria, preco: +r.preco, precoAntigo: r.preco_antigo == null ? null : +r.preco_antigo, tamanhos: r.tamanhos || [], cores: r.cores || [], descricao: r.descricao || '', fotos: r.fotos || [], promo: !!r.promo, estoque: r.estoque, status: r.status, criado: ms(r.criado) });
  const prodRow = p => ({ id: p.id, loja_id: L, nome: p.nome, categoria: p.categoria, preco: +p.preco || 0, preco_antigo: p.precoAntigo ? +p.precoAntigo : null, tamanhos: p.tamanhos || [], cores: p.cores || [], descricao: p.descricao || '', fotos: (p.fotos || []).filter(Boolean), promo: !!p.promo, estoque: p.estoque === '' || p.estoque == null || isNaN(+p.estoque) ? null : +p.estoque, status: p.status, criado: iso(p.criado) });
  const rowBloco = r => Object.assign({}, r.dados, { id: r.id, ativo: r.ativo });
  const blocoRow = tipo => (b, i) => ({ id: b.id, loja_id: L, tipo, dados: omit(b, ['id', 'ativo']), ativo: b.ativo !== false, ordem: i });
  const rowVid = r => ({ id: r.id, titulo: r.titulo, categoria: r.categoria, capa: r.capa, url: r.url || '', views: r.views || '', status: r.status });
  const vidRow = (v, i) => ({ id: v.id, loja_id: L, titulo: v.titulo, categoria: v.categoria, capa: v.capa, url: v.url || null, views: v.views || null, status: v.status || 'publicado', ordem: i });
  const cupRow = c => ({ loja_id: L, codigo: String(c.codigo).toUpperCase(), pct: +c.pct, ativo: c.ativo !== false });
  const rowPed = r => Object.assign({}, r.cliente || {}, { id: r.id, num: r.num, data: ms(r.criado), itens: (r.itens || []).map(i => Object.assign({}, i, { id: i.produto_id })), status: r.status, cupom: r.cupom || '', desconto: +r.desconto || 0, total: +r.total, pagamento: r.pagamento || null });
  const pedRow = p => ({ id: p.id, status: p.status || 'novo', pagamento: p.pagamento || null, pago_em: p.pagamento && p.pagamento.status === 'approved' ? iso(p.pagamento.data || p.data) : null });

  const chk = ({ data, error }) => { if (error) throw new Error(error.message || 'Erro no banco'); return data; };
  let cfgBase = {};

  async function lerLoja(admin) {
    const [loja, prods, blocos, vids, cups, peds] = await Promise.all([
      sb.from('lojas').select('config').eq('id', L).single().then(chk),
      sb.from('produtos').select('*').eq('loja_id', L).order('ordem').order('criado', { ascending: false }).then(chk),
      sb.from('blocos').select('*').eq('loja_id', L).order('ordem').then(chk),
      sb.from('videos').select('*').eq('loja_id', L).order('ordem').then(chk),
      admin ? sb.from('cupons').select('*').eq('loja_id', L).then(chk) : Promise.resolve([]),
      admin ? sb.from('pedidos').select('*').eq('loja_id', L).order('criado', { ascending: false }).limit(2000).then(chk) : Promise.resolve([])
    ]);
    cfgBase = loja.config || {};
    Object.assign(S.CONFIG, cfgBase);
    return {
      produtos: prods.map(rowProd), banners: blocos.filter(b => b.tipo === 'banner').map(rowBloco), faixas: blocos.filter(b => b.tipo === 'faixa').map(rowBloco),
      videos: vids.map(rowVid), cupons: cups.map(c => ({ codigo: c.codigo, pct: c.pct, ativo: c.ativo })), pedidos: peds.map(rowPed),
      aviso: cfgBase.aviso || '', config: cfgBase, seq: 0
    };
  }

  /* ---------- sincronização do painel (só o que mudou) ---------- */
  let snap = null, fila = Promise.resolve(), timer = null, atual = null;
  const keyed = (arr, fn) => { const m = new Map(); (arr || []).forEach((x, i) => { const r = fn(x, i); m.set(r.id || r.codigo, JSON.stringify(r)); }); return m; };
  function fotografar(D) {
    return {
      produtos: keyed(D.produtos, prodRow), banners: keyed(D.banners, blocoRow('banner')), faixas: keyed(D.faixas, blocoRow('faixa')),
      videos: keyed(D.videos, vidRow), cupons: keyed(D.cupons, cupRow), pedidos: keyed(D.pedidos, pedRow),
      config: JSON.stringify(Object.assign({}, cfgBase, D.config || {}, { aviso: D.aviso || '' }))
    };
  }
  async function enviarFoto(dataUrl, pasta) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const caminho = `${L}/${pasta}/${crypto.randomUUID()}.${ext}`;
    chk(await sb.storage.from(CLOUD.bucket).upload(caminho, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false }));
    return sb.storage.from(CLOUD.bucket).getPublicUrl(caminho).data.publicUrl;
  }
  async function subirFotos(D) {
    const isData = v => typeof v === 'string' && /^data:image\//.test(v);
    for (const p of D.produtos || []) for (let i = 0; i < (p.fotos || []).length; i++) if (isData(p.fotos[i])) p.fotos[i] = await enviarFoto(p.fotos[i], 'pecas');
    for (const b of (D.banners || []).concat(D.faixas || [])) if (isData(b.img)) b.img = await enviarFoto(b.img, 'banners');
    for (const v of D.videos || []) if (isData(v.capa)) v.capa = await enviarFoto(v.capa, 'videos');
  }
  async function sincronizar(D) {
    await subirFotos(D);
    const agora = fotografar(D), ops = [];
    const diff = (nome, tabela, chave) => {
      const a = snap[nome], b = agora[nome], up = [], del = [];
      b.forEach((v, k) => { if (a.get(k) !== v) up.push(JSON.parse(v)); });
      a.forEach((v, k) => { if (!b.has(k)) del.push(k); });
      return { up, del, tabela, chave };
    };
    const dP = diff('produtos', 'produtos', 'id'), dB = diff('banners', 'blocos', 'id'), dF = diff('faixas', 'blocos', 'id'), dV = diff('videos', 'videos', 'id'), dC = diff('cupons', 'cupons', 'codigo'), dO = diff('pedidos', 'pedidos', 'id');
    for (const d of [dP, dB, dF, dV]) {
      if (d.up.length) ops.push(sb.from(d.tabela).upsert(d.up.map(r => d.tabela === 'produtos' ? Object.assign(r, { atualizado: iso() }) : r)).then(chk));
      if (d.del.length) ops.push(sb.from(d.tabela).delete().eq('loja_id', L).in('id', d.del).then(chk));
    }
    if (dC.up.length) ops.push(sb.from('cupons').upsert(dC.up, { onConflict: 'loja_id,codigo' }).then(chk));
    if (dC.del.length) ops.push(sb.from('cupons').delete().eq('loja_id', L).in('codigo', dC.del).then(chk));
    for (const r of dO.up) ops.push(sb.from('pedidos').update({ status: r.status, pagamento: r.pagamento, pago_em: r.pago_em }).eq('id', r.id).eq('loja_id', L).then(chk));
    if (dO.del.length) ops.push(sb.from('pedidos').delete().eq('loja_id', L).in('id', dO.del).then(chk));
    if (agora.config !== snap.config) { const c = JSON.parse(agora.config); ops.push(sb.from('lojas').update({ config: c }).eq('id', L).then(chk)); cfgBase = c; }
    await Promise.all(ops);
    snap = agora;
  }
  function agendar(D) {
    atual = D; clearTimeout(timer);
    timer = setTimeout(() => {
      fila = fila.then(() => sincronizar(atual)).then(() => S.onSync && S.onSync('ok'))
        .catch(e => { console.error(e); S.onSync && S.onSync('erro', e.message); });
    }, 250);
    return true;
  }

  /* ---------- API pública ---------- */
  Object.assign(S, {
    cloud: true, sb,
    uid: () => crypto.randomUUID(),
    reset() { S.onSync && S.onSync('erro', 'Na versão oficial não dá para restaurar a demonstração.'); },
    save: D => snap ? agendar(D) : true,
    salvando: () => fila,
    async boot(modo) {
      const admin = modo === 'admin';
      try {
        const D = await lerLoja(admin);
        if (admin) snap = fotografar(D);
        else try { localStorage.setItem(CACHE, JSON.stringify(D)); } catch (e) {}
        return D;
      } catch (e) {
        console.error('Nuvem indisponível', e);
        if (admin) throw e;
        try { const c = JSON.parse(localStorage.getItem(CACHE)); if (c && c.produtos) { Object.assign(S.CONFIG, c.config || {}); return c; } } catch (er) {}
        return S.load();
      }
    },
    async recarregarPedidos() { const r = chk(await sb.from('pedidos').select('*').eq('loja_id', L).order('criado', { ascending: false }).limit(2000)); const P = r.map(rowPed); if (snap) snap.pedidos = keyed(P, pedRow); return P; },
    async validarCupom(cod) { const r = await sb.rpc('validar_cupom', { p_loja: L, p_codigo: String(cod || '').trim() }); return r.error ? null : r.data; },
    async criarPedido(cliente, itens, cupom) {
      const r = await sb.rpc('criar_pedido', { p_loja: L, p_cliente: cliente, p_itens: itens.map(i => ({ produto_id: i.id, cor: i.cor || '', tam: i.tam || '', qtd: i.qtd })), p_cupom: cupom || null });
      if (r.error) throw new Error(/indispon/i.test(r.error.message) ? 'Uma das peças acabou de esgotar. Atualize a página.' : r.error.message);
      return r.data;
    },
    auth: {
      tipo: hashTipo, erro: hashErro,
      async sessao() { const { data } = await sb.auth.getSession(); return data.session; },
      async entrar(email, senha) { const { error } = await sb.auth.signInWithPassword({ email, password: senha }); if (error) throw new Error(/invalid/i.test(error.message) ? 'E-mail ou senha incorretos' : error.message); },
      async sair() { await sb.auth.signOut(); },
      async esqueci(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); if (error) throw new Error(error.message); },
      async novaSenha(senha) { const { error } = await sb.auth.updateUser({ password: senha }); if (error) throw new Error(/should be different/i.test(error.message) ? 'Use uma senha diferente da anterior' : error.message); },
      async membro() { const { data, error } = await sb.from('loja_membros').select('papel').eq('loja_id', L); return !error && data && data.length ? data[0].papel : null; }
    }
  });
})();
