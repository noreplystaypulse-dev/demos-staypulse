#!/usr/bin/env node
/* Coralli · gerador de SEO (StayPulse)
   Gera, a partir de js/store.js:
   - <head> da home (title, description, canonical, Open Graph, JSON-LD)
   - conteúdo renderizado no HTML (grade de peças, FAQ, NAP, endereço, texto "sobre")
   - uma página por peça em /produto/<slug>/ (Product + BreadcrumbList)
   - /termos/ e /privacidade/, 404.html, sitemap.xml, robots.txt, llms.txt, _redirects e _headers

   Uso:  DEMO=1 node tools/seo-build.mjs           (demo em staypulse.com.br/demos/coralli: tudo noindex)
         SITE=https://www.dominio.com.br node tools/seo-build.mjs   (site oficial: indexável)
   Rode de novo sempre que mudar peças, preços, NAP ou o domínio. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = !!process.env.DEMO;
const SITE = (process.env.SITE || (DEMO ? 'https://www.staypulse.com.br/demos/coralli' : 'https://usecoralli.com.br')).replace(/\/$/, '');
const HOJE = new Date().toISOString().slice(0, 10);

/* ---------- dados da loja ---------- */
const ctx = { window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, Date, JSON, Math, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/store.js'), 'utf8'), ctx);
const S = ctx.window.CoralliStore, DB = S.load(), C = S.CONFIG, N = C.nap;
const PRODS = DB.produtos.filter(p => p.status === 'publicado' || p.status === 'esgotado');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = S.brl;
const slugify = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usados = new Set();
PRODS.forEach(p => { let sl = slugify(p.nome); while (usados.has(sl)) sl += '-' + p.id; usados.add(sl); p.slug = sl; });
const corta = (t, n) => { t = t.trim(); if (t.length <= n) return t; const c = t.slice(0, n - 1); return c.slice(0, c.lastIndexOf(' ')).replace(/[,.;:]$/, '') + '…'; };
const abs = rel => SITE + '/' + String(rel).replace(/^\.?\//, '');
const fotos = p => (p.fotos || []).filter(f => /^img\//.test(f));
const telDigits = N.telefone.replace(/\D/g, '');
const telFmt = N.telefone.replace(/^\+55\s?/, '').replace(/^(\d{2})\s?/, '($1) ');
const enderecoLinha = `${N.rua} – ${N.bairro}, ${N.cidade} – ${N.uf}${N.cep ? ', ' + N.cep : ''}`;
const WA = (C.whatsapp || telDigits || C.whatsappDemo).replace(/\D/g, '');
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const precos = PRODS.map(p => p.preco).filter(Boolean);
const PRICE_RANGE = `R$ ${Math.min(...precos)} – R$ ${Math.max(...precos)}`;

/* ---------- perguntas frequentes (aparecem no site E no schema) ---------- */
const FAQ = [
  ['Vocês vendem no varejo?', 'Não. A Coralli vende só no atacado, para lojistas e revendedoras. Os preços do site já são de atacado, por peça.'],
  ['Onde fica a loja física?', `Estamos na ${N.rua}, no ${N.bairro}, em ${N.cidade} – ${N.uf}. Passe no box para ver as peças de perto.`],
  ['Como faço meu pedido pelo site?', 'Escolha as peças, monte a grade com a quantidade de cada tamanho, preencha seus dados e envie. O pedido chega pronto no nosso WhatsApp, com número, peças e total.'],
  ['Vocês enviam para todo o Brasil?', 'Sim. Você pode escolher entrega, retirada no box, Correios (PAC ou Sedex) ou transportadora. O frete é combinado na confirmação do pedido.'],
  ['Quais são as formas de pagamento?', 'Pix e cartão de crédito, com parcelamento. As condições são confirmadas junto com o pedido.'],
  ['Com que frequência chegam peças novas?', 'Toda semana. As novidades aparecem primeiro em Lançamentos e as ofertas em Promoções do dia.']
];

/* ---------- JSON-LD ---------- */
const STORE_ID = SITE + '/#loja', SITE_ID = SITE + '/#site';
const storeNode = {
  '@type': ['ClothingStore', 'Organization'], '@id': STORE_ID, name: N.nome,
  alternateName: 'use.coralli', description: 'Loja de moda feminina gringa no atacado na Feira da Madrugada, no Brás, em São Paulo.',
  url: SITE + '/', logo: abs('img/logo.png'), image: abs('img/share.jpg'),
  telephone: N.telefone, email: N.email, priceRange: PRICE_RANGE, currenciesAccepted: 'BRL', paymentAccepted: 'Pix, Cartão de crédito',
  address: Object.assign({ '@type': 'PostalAddress', streetAddress: N.rua, addressLocality: `${N.cidade}`, addressRegion: N.uf, addressCountry: 'BR' }, N.cep ? { postalCode: N.cep } : {}),
  areaServed: { '@type': 'Country', name: 'Brasil' },
  sameAs: [C.instagram].filter(Boolean)
};
const serviceNode = {
  '@type': 'Service', '@id': SITE + '/#atacado', name: 'Venda de moda feminina no atacado',
  serviceType: 'Atacado de roupas femininas para revenda', provider: { '@id': STORE_ID },
  areaServed: { '@type': 'Country', name: 'Brasil' },
  description: 'Vestidos, conjuntos, saias, corseletes, macacões e moda praia no atacado, com pedido pelo site e WhatsApp e envio para todo o Brasil.',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Catálogo Coralli', itemListElement: S.CATEGORIAS.map(c => ({ '@type': 'OfferCatalog', name: c })) }
};
const faqNode = { '@type': 'FAQPage', '@id': SITE + '/#faq', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
const crumbs = list => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })) });
const ld = graph => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

function head({ title, desc, url, img = abs('img/share.jpg'), type = 'website', graph, robots = 'index, follow, max-image-preview:large' }) {
  if (DEMO) robots = 'noindex, follow';
  return `<meta name="robots" content="${robots}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Coralli">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
${ld(graph)}`;
}

/* ---------- home ---------- */
const HOME_TITLE = 'Coralli · Moda feminina gringa no atacado na Feira da Madrugada';
const HOME_DESC = `Moda gringa no atacado a partir de ${brl(Math.min(...precos))} a peça: vestidos, conjuntos, saias e moda praia. Box na Feira da Madrugada, Brás (SP). Envio para todo o Brasil.`;
const homeGraph = [
  { '@type': 'WebSite', '@id': SITE_ID, url: SITE + '/', name: 'Coralli', inLanguage: 'pt-BR', publisher: { '@id': STORE_ID } },
  { '@type': 'WebPage', '@id': SITE + '/#pagina', url: SITE + '/', name: HOME_TITLE, description: HOME_DESC, isPartOf: { '@id': SITE_ID }, about: { '@id': STORE_ID }, inLanguage: 'pt-BR' },
  storeNode, serviceNode, faqNode,
  crumbs([['Início', SITE + '/']]),
  { '@type': 'ItemList', name: 'Peças no atacado', itemListElement: PRODS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/produto/${p.slug}/`, name: p.nome })) }
];
const cardSSR = p => {
  const f = fotos(p)[0];
  return `<article class="card${p.status === 'esgotado' ? ' esgotado' : ''}" data-id="${p.id}"><a href="produto/${p.slug}/" style="text-decoration:none;color:inherit"><div class="ph">${f ? `<img src="${f}" alt="${esc(p.nome)} · ${esc(p.categoria)} no atacado" loading="lazy" width="412" height="400">` : ''}</div><span class="cat" style="margin-top:.8rem">${esc(p.categoria)}</span><h3 style="margin-top:.2rem">${esc(p.nome)}</h3><div class="price"><b>${brl(p.preco)}</b></div><span class="atac">atacado · por peça</span></a></article>`;
};
const faqHTML = `<h2>Perguntas <span class="serif" style="color:var(--teal)">frequentes</span></h2>\n` + FAQ.map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
const napHTML = `<address class="nap"><b>${esc(N.nome)}</b> · Moda gringa no atacado<br>${esc(enderecoLinha)}<br><a href="tel:+${telDigits}">${esc(telFmt)}</a> · <a href="mailto:${esc(N.email)}">${esc(N.email)}</a></address>`;

function inject(html, key, content) {
  const re = new RegExp(`<!--${key}-->[\\s\\S]*?<!--/${key}-->`);
  if (!re.test(html)) throw new Error('Marcador não encontrado: ' + key);
  return html.replace(re, `<!--${key}-->${content}<!--/${key}-->`);
}
let home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
home = inject(home, 'SEO:HEAD', '\n' + head({ title: HOME_TITLE, desc: HOME_DESC, url: SITE + '/', graph: homeGraph }) + '\n');
home = inject(home, 'SSR:GRID', PRODS.slice().sort((a, b) => b.criado - a.criado).map(cardSSR).join(''));
home = inject(home, 'SSR:SOBRE', esc(C.sobre));
home = inject(home, 'SSR:FAQ', faqHTML);
home = inject(home, 'SSR:ADDR', esc(enderecoLinha));
home = inject(home, 'SSR:NAP', napHTML);
fs.writeFileSync(path.join(ROOT, 'index.html'), home);

/* ---------- layout das páginas internas ---------- */
const PAGE_CSS = `:root{--teal:#2AA79D;--teal-d:#17786F;--pink:#EC5C93;--ink:#1D1D1F;--muted:#6E6E73;--line:#ECECEC;--soft:#F7F7F5}
*{box-sizing:border-box}body{margin:0;font-family:Lexend,system-ui,sans-serif;color:var(--ink);line-height:1.6;background:#fff}
img{max-width:100%;height:auto;display:block}a{color:var(--teal-d)}
.wrap{width:min(1080px,92%);margin:0 auto}
header{border-bottom:1px solid var(--line);background:linear-gradient(90deg,#FFF0F5,#E9F8F6)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:72px}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none;color:var(--ink)}
.brand img{width:48px;height:48px;border-radius:50%}
.brand b{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.6rem;color:var(--pink)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.85rem 1.4rem;font-weight:600;text-decoration:none;border:0}
.btn-pink{background:linear-gradient(90deg,#EC5C93,#E8857A);color:#fff}.btn-line{border:1.5px solid var(--line);color:var(--ink);background:#fff}
.crumbs{font-size:.85rem;color:var(--muted);margin:22px 0 10px}.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:.4rem;padding:0;margin:0}
.crumbs li+li::before{content:"›";margin-right:.4rem}.crumbs a{color:var(--muted);text-decoration:none}
h1{font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.1;margin:.2rem 0 1rem;letter-spacing:-.02em}
h2{font-size:1.25rem;margin:1.8rem 0 .5rem}
.legal{max-width:760px;padding-bottom:40px}.legal p,.legal li{color:#3a3a3e}
.prod{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;padding-bottom:30px}.prod>*{min-width:0}
.prod .ph{border-radius:22px;overflow:hidden;background:var(--soft);aspect-ratio:4/5}.prod .ph img{width:100%;height:100%;object-fit:cover}
.cat{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.price{font-size:2rem;font-weight:700;margin:.4rem 0 0}.price small{font-size:.85rem;font-weight:400;color:var(--muted);margin-left:.4rem}
.parc{color:var(--muted);font-size:.9rem}.tags{display:flex;gap:.4rem;flex-wrap:wrap;margin:.4rem 0 1rem}
.tags span{border:1.5px solid var(--line);border-radius:10px;padding:.3rem .7rem;font-size:.85rem}
.ctas{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1.4rem}
.esg{display:inline-block;background:#1D1D1F;color:#fff;border-radius:8px;padding:.2rem .6rem;font-size:.8rem;margin-left:.4rem;vertical-align:middle}
.rel{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:10px 0 40px}.rel>*{min-width:0}
.rel a{text-decoration:none;color:var(--ink)}.rel .ph{border-radius:16px;overflow:hidden;aspect-ratio:4/5;background:var(--soft)}.rel .ph img{width:100%;height:100%;object-fit:cover}
.rel b{display:block;font-size:.95rem;margin-top:.4rem}.rel span{color:var(--muted);font-size:.85rem}
footer{border-top:1px solid var(--line);background:linear-gradient(90deg,#FFE3EE,#E4F7F4);padding:30px 0;font-size:.88rem;color:var(--muted)}
footer .wrap{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}footer a{color:var(--ink)}
.nap{font-style:normal}.nap b{color:var(--ink)}
@media(max-width:760px){.prod{grid-template-columns:1fr;gap:20px}.rel{grid-template-columns:repeat(2,1fr)}}`;

function page({ rel, title, desc, url, graph, crumbsHTML, body, img, type, robots }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${head({ title, desc, url, graph, img, type, robots })}
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="${rel}img/logo.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Lexend:wght@400;600;700&display=swap" rel="stylesheet">
<style>${PAGE_CSS}</style>
</head>
<body>
<header><div class="wrap"><a class="brand" href="${rel}"><img src="${rel}img/logo.webp" alt="Logo Coralli" width="48" height="48"><b>Coralli</b></a><a class="btn btn-pink" href="${rel}#produtos">Ver todas as peças</a></div></header>
<main class="wrap">
${crumbsHTML}
${body}
</main>
<footer><div class="wrap">${napHTML}<nav aria-label="Links institucionais"><a href="${rel}termos/">Termos de uso</a> · <a href="${rel}privacidade/">Política de privacidade</a> · <a href="${C.instagram}" target="_blank" rel="noopener">Instagram @use.coralli</a></nav></div></footer>
</body>
</html>
`;
}
const crumbsNav = (rel, list) => `<nav class="crumbs" aria-label="Você está em"><ol>${list.map(([n, u], i) => i === list.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
const write = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

/* ---------- páginas de produto ---------- */
fs.rmSync(path.join(ROOT, 'produto'), { recursive: true, force: true });
for (const p of PRODS) {
  const rel = '../../', url = `${SITE}/produto/${p.slug}/`, fs1 = fotos(p), esg = p.status === 'esgotado';
  const title = `${p.nome} no atacado · ${brl(p.preco)} · Coralli`;
  const desc = corta(`${p.nome} no atacado por ${brl(p.preco)} a peça na Coralli, Feira da Madrugada (Brás, SP). ${p.descricao || ''}`, 158);
  const relacionados = PRODS.filter(x => x !== p && x.categoria === p.categoria).concat(PRODS.filter(x => x !== p && x.categoria !== p.categoria)).slice(0, 4);
  const graph = [
    { '@type': 'Product', '@id': url + '#produto', name: p.nome, sku: p.id, category: p.categoria, description: p.descricao || `${p.nome} no atacado.`,
      image: fs1.map(abs), brand: { '@type': 'Brand', name: 'Coralli' },
      offers: { '@type': 'Offer', url, priceCurrency: 'BRL', price: Number(p.preco).toFixed(2), itemCondition: 'https://schema.org/NewCondition',
        availability: esg ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', seller: { '@id': STORE_ID },
        eligibleCustomerType: 'https://schema.org/BusinessCustomer' } },
    crumbs([['Início', SITE + '/'], [p.categoria, SITE + '/#produtos'], [p.nome, url]]),
    { '@type': 'ClothingStore', '@id': STORE_ID, name: N.nome, url: SITE + '/', telephone: N.telefone, address: storeNode.address, sameAs: storeNode.sameAs }
  ];
  const body = `<article class="prod">
  <div class="ph">${fs1[0] ? `<img src="${rel}${fs1[0]}" alt="${esc(p.nome)} · ${esc(p.categoria)} no atacado na Coralli" width="412" height="400">` : ''}</div>
  <div>
    <span class="cat">${esc(p.categoria)}</span>
    <h1>${esc(p.nome)}${esg ? '<span class="esg">Esgotado</span>' : ''}</h1>
    <p class="price">${brl(p.preco)}<small>por peça · atacado</small></p>
    ${C.parcelas > 1 ? `<p class="parc">ou ${C.parcelas}x de ${brl(p.preco / C.parcelas)} no cartão</p>` : ''}
    ${p.descricao ? `<p>${esc(p.descricao)}</p>` : ''}
    <h2>Tamanhos</h2><div class="tags">${(p.tamanhos || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    ${(p.cores || []).length ? `<h2>Cores</h2><div class="tags">${p.cores.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
    <div class="ctas">${esg ? '' : `<a class="btn btn-pink" href="${rel}?p=${p.id}">Escolher tamanhos e pedir</a>`}<a class="btn btn-line" href="${wa(`Oi! Quero saber da peça ${p.nome} (${brl(p.preco)}) no atacado.`)}" target="_blank" rel="noopener">Perguntar no WhatsApp</a></div>
    <p class="parc" style="margin-top:1rem">Venda só no atacado · Box na Feira da Madrugada, Brás · Envio para todo o Brasil</p>
  </div>
</article>
<h2>Você também pode gostar</h2>
<div class="rel">${relacionados.map(x => `<a href="${rel}produto/${x.slug}/"><div class="ph">${fotos(x)[0] ? `<img src="${rel}${fotos(x)[0]}" alt="${esc(x.nome)} no atacado" loading="lazy" width="412" height="400">` : ''}</div><b>${esc(x.nome)}</b><span>${brl(x.preco)} · atacado</span></a>`).join('')}</div>`;
  write(`produto/${p.slug}/index.html`, page({ rel, title, desc, url, graph, img: fs1[0] ? abs(fs1[0]) : undefined, type: 'product',
    crumbsHTML: crumbsNav(rel, [['Início', rel], [p.categoria, rel + '#produtos'], [p.nome]]), body }));
}

/* ---------- termos e privacidade ---------- */
const legal = (slug, titulo, desc, conteudo) => {
  const rel = '../', url = `${SITE}/${slug}/`;
  write(`${slug}/index.html`, page({ rel, title: `${titulo} · Coralli`, desc, url,
    graph: [{ '@type': 'WebPage', '@id': url, url, name: titulo, description: desc, isPartOf: { '@type': 'WebSite', '@id': SITE_ID, url: SITE + '/', name: 'Coralli' }, about: { '@id': STORE_ID }, inLanguage: 'pt-BR', dateModified: HOJE },
      crumbs([['Início', SITE + '/'], [titulo, url]]),
      { '@type': 'ClothingStore', '@id': STORE_ID, name: N.nome, url: SITE + '/', telephone: N.telefone, address: storeNode.address, sameAs: storeNode.sameAs }],
    crumbsHTML: crumbsNav(rel, [['Início', rel], [titulo]]),
    body: `<article class="legal"><h1>${titulo}</h1><p class="parc">Última atualização: ${HOJE.split('-').reverse().join('/')}</p>${conteudo}</article>` }));
};
const contato = `pelo WhatsApp <a href="tel:+${telDigits}">${esc(telFmt)}</a> ou pelo e-mail <a href="mailto:${esc(N.email)}">${esc(N.email)}</a>`;
legal('termos', 'Termos de uso', 'Termos de uso do site da Coralli: venda só no atacado, pedidos pelo WhatsApp, preços, pagamento, envio e trocas.', `
<p>Estes termos valem para quem usa o site da <b>${esc(N.nome)}</b>, loja de moda feminina no atacado localizada na ${esc(enderecoLinha)}. Ao fazer um pedido pelo site, você concorda com as condições abaixo.</p>
<h2>1. Venda só no atacado</h2><p>A Coralli vende exclusivamente no atacado, para lojistas e revendedoras. Os preços exibidos são por peça, já com valor de atacado.</p>
<h2>2. Como funciona o pedido</h2><p>No site você escolhe as peças, tamanhos e quantidades e preenche seus dados. O pedido é enviado para o nosso WhatsApp com um número de identificação. <b>O pedido só é confirmado depois que verificamos a disponibilidade das peças e combinamos com você o pagamento e a forma de envio.</b></p>
<h2>3. Preços, fotos e disponibilidade</h2><p>Os preços e o estoque podem mudar sem aviso prévio. As fotos são ilustrativas e as cores podem variar um pouco conforme a tela. Se alguma peça estiver indisponível, avisamos antes de fechar o pedido.</p>
<h2>4. Cupons e promoções</h2><p>Cupons de desconto e promoções têm validade e regras próprias, informadas no site ou nas nossas redes, e não são cumulativos, salvo aviso em contrário.</p>
<h2>5. Pagamento</h2><p>Aceitamos Pix e cartão de crédito, com as condições informadas na confirmação do pedido. Pagamentos online, quando disponíveis, são processados por empresa de pagamentos parceira, e a Coralli não tem acesso aos dados completos do seu cartão.</p>
<h2>6. Envio e retirada</h2><p>Você pode retirar no box ou receber por entrega, Correios (PAC ou Sedex) ou transportadora. Prazo e valor do frete são combinados na confirmação. Após a postagem, o prazo é de responsabilidade da transportadora escolhida.</p>
<h2>7. Trocas e devoluções</h2><p>Peças com defeito de fabricação devem ser informadas em até 7 dias após o recebimento, ${contato}. Como a venda é no atacado, para revenda, trocas por gosto ou tamanho dependem de combinação prévia com a loja.</p>
<h2>8. Uso do site</h2><p>Textos, fotos e marca da Coralli não podem ser copiados ou usados sem autorização. Não nos responsabilizamos por indisponibilidades temporárias do site.</p>
<h2>9. Contato</h2><p>Dúvidas sobre estes termos: ${contato}.</p>`);
legal('privacidade', 'Política de privacidade', 'Como a Coralli coleta, usa e protege seus dados pessoais no site e nos pedidos pelo WhatsApp, de acordo com a LGPD.', `
<p>A <b>${esc(N.nome)}</b> respeita a sua privacidade e trata seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
<h2>1. Quais dados coletamos</h2><ul><li><b>Dados do pedido:</b> nome ou nome da loja, CPF/CNPJ, telefone, endereço de entrega, peças escolhidas e observações que você preencher.</li><li><b>Dados do aparelho:</b> o site guarda no seu próprio navegador o carrinho, o cupom e os dados do último pedido, para você não precisar digitar de novo. Esses dados ficam no seu aparelho e você pode apagá-los limpando os dados do navegador.</li></ul>
<h2>2. Para que usamos</h2><p>Para montar e confirmar o seu pedido, emitir a ficha do pedido e a etiqueta de envio, entrar em contato sobre pagamento e entrega e cumprir obrigações legais e fiscais. Não vendemos nem alugamos seus dados.</p>
<h2>3. Com quem compartilhamos</h2><ul><li><b>WhatsApp</b>, por onde o pedido é enviado e conversamos com você.</li><li><b>Transportadoras e Correios</b>, apenas nome, telefone e endereço, para fazer a entrega.</li><li><b>Empresa de pagamentos</b> (como o Mercado Pago), quando o pagamento for online.</li><li><b>ViaCEP</b>, serviço público que completa o endereço a partir do CEP que você digita.</li></ul>
<h2>4. Por quanto tempo guardamos</h2><p>Pelo tempo necessário para atender o pedido e pelos prazos exigidos pela legislação fiscal e de defesa do consumidor.</p>
<h2>5. Seus direitos</h2><p>Você pode pedir a confirmação, o acesso, a correção ou a exclusão dos seus dados, ${contato}.</p>
<h2>6. Segurança</h2><p>O site usa conexão segura (HTTPS) e o acesso ao painel da loja é restrito à equipe da Coralli.</p>
<h2>7. Cookies e análise</h2><p>Hoje o site não usa cookies de publicidade. Se passarmos a usar ferramentas de análise de visitas, esta política será atualizada.</p>
<h2>8. Contato do responsável</h2><p>${esc(N.nome)} · ${esc(enderecoLinha)} · ${contato}.</p>`);

/* ---------- 404 (noindex proposital: página de erro não deve ir para o Google) ---------- */
write('404.html', page({ rel: '/', title: 'Página não encontrada · Coralli', desc: 'A página que você procurou não existe. Veja as peças da Coralli no atacado.', url: SITE + '/404', robots: 'noindex, follow',
  graph: [crumbs([['Início', SITE + '/']])], crumbsHTML: '', body: `<div class="legal" style="padding:40px 0 60px"><h1>Ops, essa página não existe</h1><p>Ela pode ter mudado de endereço. Veja todas as peças no atacado:</p><p><a class="btn btn-pink" href="/">Ir para a loja</a></p></div>` }));

/* ---------- sitemap ---------- */
const urls = [
  { loc: SITE + '/', pri: '1.0', freq: 'daily', imgs: ['img/share.jpg'] },
  ...PRODS.map(p => ({ loc: `${SITE}/produto/${p.slug}/`, pri: '0.8', freq: 'weekly', imgs: fotos(p) })),
  { loc: SITE + '/termos/', pri: '0.3', freq: 'yearly', imgs: [] },
  { loc: SITE + '/privacidade/', pri: '0.3', freq: 'yearly', imgs: [] }
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${HOJE}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority>${u.imgs.map(i => `<image:image><image:loc>${abs(i)}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);

/* ---------- robots.txt (Google e robôs de IA liberados; só o painel fica fora) ---------- */
const BOTS = ['Googlebot', 'Googlebot-Image', 'Google-Extended', 'Bingbot', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Meta-ExternalAgent', 'Amazonbot', 'CCBot', 'cohere-ai', 'MistralAI-User'];
write('robots.txt', `# Coralli · ${SITE}
# Buscadores e assistentes de IA podem ler todo o site. Só o painel da loja fica de fora.
${BOTS.map(b => `User-agent: ${b}\nAllow: /\nDisallow: /admin/\n`).join('\n')}
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE}/sitemap.xml
`);

/* ---------- llms.txt (resumo para assistentes de IA) ---------- */
write('llms.txt', `# Coralli

> Loja de moda feminina gringa no atacado na Feira da Madrugada, no Brás, em São Paulo (SP). Vende só no atacado, para lojistas e revendedoras, com pedido pelo site e WhatsApp e envio para todo o Brasil.

- Endereço: ${enderecoLinha}
- Telefone/WhatsApp: ${telFmt}
- E-mail: ${N.email}
- Instagram: ${C.instagram}
- Categorias: ${S.CATEGORIAS.join(', ')}
- Preços de atacado: ${PRICE_RANGE} por peça

## Páginas
- [Loja e catálogo](${SITE}/)
${PRODS.map(p => `- [${p.nome} – ${brl(p.preco)}](${SITE}/produto/${p.slug}/)`).join('\n')}
- [Termos de uso](${SITE}/termos/)
- [Política de privacidade](${SITE}/privacidade/)
`);

/* ---------- _redirects (Cloudflare Pages: 301 de endereços antigos) ---------- */
write('_redirects', `# Redirecionamentos permanentes (301)
/index.html            /                 301
/home                  /                 301
/inicio                /                 301
/loja                  /                 301
/loja/*                /                 301
/produtos              /#produtos        301
/produtos/:slug        /produto/:slug/   301
/termos.html           /termos/          301
/termos-de-uso         /termos/          301
/privacidade.html      /privacidade/     301
/politica-de-privacidade /privacidade/   301
/admin                 /admin/           301
`);

/* ---------- _headers ---------- */
write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

# Painel da loja: fora do Google de propósito
/admin/*
  X-Robots-Tag: noindex, nofollow

/img/*
  Cache-Control: public, max-age=2592000
`);

/* ---------- catálogo para o pagamento online (preços conferidos no servidor) ---------- */
const FN = path.join(ROOT, '..', 'functions', 'coralli', 'api');
if (fs.existsSync(FN)) {
  const cat = Object.fromEntries(DB.produtos.filter(p => p.status === 'publicado').map(p => [p.id, { nome: p.nome, preco: p.preco }]));
  fs.writeFileSync(path.join(FN, '_catalogo.js'), `/* Gerado por coralli/tools/seo-build.mjs em ${HOJE}. Não edite à mão. */\nexport const CATALOGO = ${JSON.stringify(cat, null, 1)};\nexport const CUPONS = ${JSON.stringify((DB.cupons || []).filter(c => c.ativo).map(c => ({ codigo: c.codigo.toUpperCase(), pct: c.pct })))};\nexport const PARCELAS = ${Math.max(1, C.parcelas || 1)};\n`);
}

console.log(`OK${DEMO ? ' (DEMO: noindex)' : ''} · ${SITE} · ${PRODS.length} produtos · ${urls.length} URLs no sitemap`);
