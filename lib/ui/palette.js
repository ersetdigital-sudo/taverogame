import { PPOB, GAMES, PAGES, Catalog } from '../data';
import { $, $$, esc, svcIconHTML } from '../util';
import { ui } from '../icons';
import { Sheet } from './sheet';

/* js/ui/palette.js */
/* palette.js — indeks pencarian, combobox ARIA, command palette (Ctrl/⌘+K atau /) */
const SearchIndex = {
  items() {
    return [
      ...PPOB.map(s => ({ type: 'PPOB', label: s.name, sub: s.desc, href: Catalog.href(s), kw: s.kw, svc: s })),
      ...GAMES.map(s => ({ type: 'Game', label: s.name, sub: s.cat + ' · ' + s.unit, href: Catalog.href(s), kw: s.name + ' ' + s.cat + ' ' + s.unit + ' topup', svc: s })),
      ...PAGES.map(p => ({ type: 'Halaman', label: p.label, sub: p.sub, href: p.href, kw: p.kw }))
    ];
  },
  query(q, limit) {
    q = String(q || '').trim().toLowerCase();
    const out = [];
    if (!q) return out;
    const orderType = { PPOB: 0, Game: 1, Halaman: 2 };
    const scored = this.items().map(it => {
      const l = it.label.toLowerCase(), k = (it.kw || '').toLowerCase();
      let s = -1;
      if (l.startsWith(q)) s = 0; else if (l.split(/\s+/).some(w => w.startsWith(q))) s = 1; else if (l.includes(q)) s = 2; else if (k.includes(q)) s = 3;
      return { it, s };
    }).filter(x => x.s >= 0).sort((a, b) => a.s - b.s || orderType[a.it.type] - orderType[b.it.type]);
    scored.forEach(x => out.push(x.it));
    const inv = q.toUpperCase();
    if (/^TV\w{4,}/i.test(q)) out.push({ type: 'Invoice', label: 'Cari invoice ' + inv, sub: 'Buka halaman Pesanan', href: '#/pesanan?q=' + encodeURIComponent(inv) });
    return out.slice(0, limit || 8);
  },
  suggestions() {
    return [...PPOB.slice(0, 5), ...GAMES.slice(0, 3)].map(s => ({ type: s.kind === 'ppob' ? 'PPOB' : 'Game', label: s.name, sub: s.desc, href: Catalog.href(s), svc: s }));
  }
};

function resultItemHTML(it, id, active) {
  const ico = it.svc ? svcIconHTML(it.svc, 'rs__ico') : `<span class="rs__ico rs__ico--page">${ui(it.type === 'Invoice' ? 'receipt' : 'arrow', 18)}</span>`;
  return `<li role="option" id="${id}" class="rs${active ? ' is-active' : ''}" data-href="${esc(it.href)}" aria-selected="${active ? 'true' : 'false'}">${ico}<span class="rs__txt"><b>${esc(it.label)}</b><small>${esc(it.sub || '')}</small></span><span class="rs__type">${esc(it.type)}</span></li>`;
}

/* Combobox: input + listbox. getResults(q) → items. onPick(item) dipanggil saat dipilih. */
function attachCombobox({ input, list, getResults, onPick, showEmpty, openOnFocus }) {
  let items = [], idx = -1, open = false;
  const pre = list.id || 'cb';
  const setOpen = v => {
    open = v; list.hidden = !v; input.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (!v) { idx = -1; input.removeAttribute('aria-activedescendant'); }
  };
  const render = () => {
    const q = input.value.trim();
    items = getResults(q);
    if (!items.length) {
      if (q && showEmpty !== false) { list.innerHTML = `<li class="rs-empty" role="presentation">Tidak ada hasil untuk “${esc(q)}”. Coba kata lain.</li>`; setOpen(true); }
      else setOpen(false);
      return;
    }
    idx = -1;
    list.innerHTML = items.map((it, i) => resultItemHTML(it, pre + '-o' + i, false)).join('');
    setOpen(true);
  };
  const mark = n => {
    idx = n;
    $$('.rs', list).forEach((el, i) => { const on = i === idx; el.classList.toggle('is-active', on); el.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); } });
  };
  input.addEventListener('input', render);
  if (openOnFocus) input.addEventListener('focus', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) render(); if (items.length) mark((idx + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) mark((idx - 1 + items.length) % items.length); }
    else if (e.key === 'Enter') { if (open && items.length) { e.preventDefault(); onPick(items[idx >= 0 ? idx : 0]); } }
    else if (e.key === 'Escape' && open && openOnFocus !== 'keep') { e.stopPropagation(); setOpen(false); }
  });
  list.addEventListener('mousedown', e => e.preventDefault());
  list.addEventListener('click', e => { const li = e.target.closest('.rs'); if (li) onPick(items[$$('.rs', list).indexOf(li)]); });
  const outside = e => { if (!list.contains(e.target) && e.target !== input) setOpen(false); };
  document.addEventListener('click', outside);
  setOpen(false);
  return { render, close: () => setOpen(false), destroy: () => document.removeEventListener('click', outside) };
}

export const Palette = {
  isOpen: false,
  open() {
    if (this.isOpen) return; this.isOpen = true;
    Sheet.show({
      variant: 'palette', label: 'Cari layanan, game, halaman, atau invoice',
      body: `<div class="pal"><div class="pal__in">${ui('search', 20)}<input id="pal-q" type="search" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Cari" placeholder="Cari layanan, game, halaman, invoice…" autocomplete="off" data-autofocus><kbd>Esc</kbd></div><ul class="pal__list" id="pal-list" role="listbox" aria-label="Hasil pencarian"></ul></div>`,
      onMount: (el, close) => {
        const input = $('#pal-q', el), list = $('#pal-list', el);
        const cb = attachCombobox({ input, list, openOnFocus: 'keep', getResults: q => q ? SearchIndex.query(q, 8) : SearchIndex.suggestions(), onPick: it => { close(); location.hash = it.href.replace(/^#/, ''); } });
        cb.render();
      }
    }).then(() => { this.isOpen = false; });
  },
  init() {
    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.open(); }
      else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); this.open(); }
    });
    document.addEventListener('click', e => { if (e.target.closest('[data-open-palette]')) this.open(); });
  }
};

