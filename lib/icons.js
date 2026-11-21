import { SITE } from './data';

/* js/icons.js */
/* icons.js — ikon PPOB duotone (viewBox 48) + ikon UI (viewBox 24) + logo. Semua currentColor. */
const PPOB_ICONS = {
  pulsa: '<rect x="13" y="5" width="22" height="38" rx="6"/><path fill="none" d="M21 10h6M22 37h4"/>',
  data: '<circle cx="24" cy="24" r="17"/><path fill="none" d="M7 24h34M24 7c-7 6-7 28 0 34M24 7c7 6 7 28 0 34"/>',
  pln: '<path d="M27 4 10 27h12l-2 17 18-23H26z"/>',
  pasca: '<path d="M12 5h24v38l-4-3-4 3-4-3-4 3-4-3-4 3z"/><path fill="none" d="M18 14h12M18 21h12M18 28h7"/>',
  bpjs: '<path d="M24 4 39 10v13c0 9-6 16-15 20C15 39 9 32 9 23V10z"/><path fill="none" d="M24 16v14M17 23h14"/>',
  pdam: '<path d="M24 4S11 19 11 29a13 13 0 0 0 26 0C37 19 24 4 24 4z"/><path fill="none" d="M18 30a6 6 0 0 0 6 6"/>',
  inet: '<rect x="5" y="9" width="38" height="26" rx="6"/><path fill="none" d="M17 42h14M16.5 22a10 10 0 0 1 15 0M20 26a5 5 0 0 1 8 0"/><circle cx="24" cy="30" r="1.2" fill="currentColor" stroke="none"/>',
  ewallet: '<rect x="5" y="11" width="38" height="28" rx="7"/><path fill="none" d="M9 11l24-6 3 6"/><rect x="28" y="21" width="15" height="10" rx="4" fill="none"/><circle cx="34" cy="26" r="1.3" fill="currentColor" stroke="none"/>',
  voucher: '<path d="M5 15a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v4a5 5 0 0 0 0 10v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-4a5 5 0 0 0 0-10z"/><path fill="none" stroke-dasharray="3 4" d="M30 13v22"/><path fill="none" d="M14 20h8M14 27h6"/>'
};

export function ppobIcon(name, size) {
  const s = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="ico-ppob" viewBox="0 0 48 48"${s} aria-hidden="true" focusable="false"><g fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${PPOB_ICONS[name] || ''}</g></svg>`;
}

const UI_ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
  auto: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  home: '<path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  game: '<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 8h5M9.5 12h5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v5M12 17.5h.01"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
  shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h3v-3"/>'
};

export function ui(name, size) {
  const s = size || 20;
  return `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${UI_ICONS[name] || ''}</svg>`;
}

export function logoMark(size) {
  const s = size || 40;
  return `<svg class="logo__mark" viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true" focusable="false"><defs><linearGradient id="lg1" x1="6" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse"><stop stop-color="#5B79FF"/><stop offset="1" stop-color="#2236C9"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#lg1)"/><path d="M11 13h26v8H29v14a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V21h-8z" fill="#fff"/><path d="M33 29l5 5-5 5z" fill="#C6F24E"/></svg>`;
}

export function logoFull() {
  return `<a class="logo" href="#/" aria-label="${SITE.name} — Beranda">${logoMark(40)}<span class="logo__word"><b>${SITE.first}</b><span>${SITE.second}</span></span></a>`;
}
