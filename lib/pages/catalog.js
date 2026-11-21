import { GAMES, PPOB, Catalog } from '../data';
import { $, $$, esc, debounce, REDUCED } from '../util';
import { ppobIcon, ui } from '../icons';

/* js/pages/catalog.js */
/* pages/catalog.js — daftar Top Up Game (poster) & Tagihan/Pulsa (kartu layanan) */
export function PageGames(view) {
  const cats = ['Semua', ...Array.from(new Set(GAMES.map(g => g.cat)))];
  view.innerHTML = `<div class="wrap pg">
    <header class="ph"><p class="eyebrow">Top Up Game</p><h1>Pilih game, isi ID, selesai.</h1></header>
    <div class="bar"><div class="sin">${ui('search', 18)}<label class="sr" for="g-q">Cari game</label><input id="g-q" type="search" placeholder="Cari game…" autocomplete="off"></div>
      <label class="sr" for="g-sort">Urutkan</label><select id="g-sort" class="sel"><option value="pop">Urutan awal</option><option value="az">A–Z</option><option value="za">Z–A</option></select></div>
    <div class="seg" id="g-cats" role="group" aria-label="Kategori">${cats.map((c, i) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('')}</div>
    <div id="g-out" aria-live="polite" style="margin-top:20px"></div></div>`;
  const out = $('#g-out', view); let cat = 'Semua', q = '', sort = 'pop', t;
  const minP = g => Math.min(...g.products.map(p => p.price));
  const skel = () => `<div class="pgrid">${Array.from({ length: 10 }, () => '<div><div class="gcard__img skeleton"></div></div>').join('')}</div>`;
  const paint = () => {
    let l = GAMES.filter(g => (cat === 'Semua' || g.cat === cat) && g.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'az') l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'za') l = [...l].sort((a, b) => b.name.localeCompare(a.name));
    out.innerHTML = l.length ? `<div class="pgrid">${l.map(g => `<a class="gcard" href="${Catalog.href(g)}"><span class="gcard__img"><img src="${g.cover}" alt="" width="204" height="255" loading="lazy"><span class="gcard__cat">${esc(g.cat)}</span></span><span><b>${esc(g.name)}</b><small>${esc(g.pub)}</small></span></a>`).join('')}</div>`
      : `<div class="empty"><div class="empty__ico">${ui('search', 28)}</div><h2>Game tidak ditemukan</h2><p>Coba kata kunci lain atau ganti kategori.</p><button type="button" class="btn btn--ghost" id="g-reset">Reset Filter</button></div>`;
  };
  out.innerHTML = skel(); t = setTimeout(paint, REDUCED() ? 0 : 320);
  $('#g-q', view).addEventListener('input', debounce(e => { q = e.target.value.trim(); paint(); }, 150));
  $('#g-sort', view).addEventListener('change', e => { sort = e.target.value; paint(); });
  const setCat = c => { cat = c; $$('#g-cats button', view).forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === c)); };
  $('#g-cats', view).addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { setCat(b.dataset.cat); paint(); } });
  out.addEventListener('click', e => { if (e.target.closest('#g-reset')) { q = ''; $('#g-q', view).value = ''; setCat('Semua'); paint(); } });
  return () => clearTimeout(t);
}

export function PagePpob(view) {
  const groups = ['Semua', 'Prabayar', 'Tagihan'];
  view.innerHTML = `<div class="wrap pg">
    <header class="ph"><p class="eyebrow">Tagihan &amp; Pulsa</p><h1>Pilih layanan yang mau dibayar.</h1></header>
    <div class="bar"><div class="sin">${ui('search', 18)}<label class="sr" for="p-q">Cari layanan</label><input id="p-q" type="search" placeholder="Cari layanan…" autocomplete="off"></div></div>
    <div class="seg" id="p-cats" role="group" aria-label="Jenis layanan">${groups.map((c, i) => `<button type="button" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div>
    <div id="p-out" aria-live="polite" style="margin-top:20px"></div></div>`;
  const out = $('#p-out', view); let g = 'Semua', q = '';
  const paint = () => {
    const l = PPOB.filter(s => (g === 'Semua' || s.group === g) && (s.name + ' ' + s.kw).toLowerCase().includes(q.toLowerCase()));
    out.innerHTML = l.length ? `<div class="svgrid">${l.map(s => `<a class="sv" href="${Catalog.href(s)}" style="--c:${s.color};--ink-c:${s.ink}"><span class="sv__ico">${ppobIcon(s.icon)}</span><span class="sv__t"><b>${esc(s.name)}</b><small>${esc(s.desc)}</small></span><span class="sv__g">${esc(s.group)}</span></a>`).join('')}</div>`
      : `<div class="empty"><div class="empty__ico">${ui('search', 28)}</div><h2>Layanan tidak ditemukan</h2><p>Coba kata kunci lain.</p></div>`;
  };
  paint();
  $('#p-q', view).addEventListener('input', debounce(e => { q = e.target.value.trim(); paint(); }, 150));
  $('#p-cats', view).addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; g = b.dataset.cat; $$('#p-cats button', view).forEach(c => c.setAttribute('aria-pressed', c.dataset.cat === g)); paint(); });
}
