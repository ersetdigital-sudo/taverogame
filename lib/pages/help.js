import { SITE, FAQ, LEGAL } from '../data';
import { $, esc, setTitle } from '../util';

/* js/pages/help.js */
/* pages/help.js — Bantuan: satu tab aktif (FAQ, kontak, syarat, privasi) */
export function PageHelp(view, sec) {
  const tabs = [['faq', 'Pertanyaan umum'], ['kontak', 'Kontak'], ['syarat', 'Syarat & Ketentuan'], ['privasi', 'Kebijakan Privasi']];
  const cur = tabs.some(t => t[0] === sec) ? sec : 'faq';
  const contact = [];
  if (SITE.email) contact.push(['Email', `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`]);
  if (SITE.whatsapp) contact.push(['WhatsApp', esc(SITE.whatsapp)]);
  if (SITE.phone) contact.push(['Telepon', esc(SITE.phone)]);
  if (SITE.hours) contact.push(['Jam layanan', esc(SITE.hours)]);
  if (SITE.address) contact.push(['Alamat', esc(SITE.address)]);
  const legal = k => `<h2>${esc(LEGAL[k].title)}</h2>${LEGAL[k].items.map((it, i) => `<h3>${i + 1}. ${esc(it[0])}</h3><p>${esc(it[1])}</p>`).join('')}`;
  const body = {
    faq: `<h2>Pertanyaan umum</h2><div class="faq">${FAQ.map(f => `<details><summary>${esc(f[0])}<span class="faq__pm" aria-hidden="true"></span></summary><p>${esc(f[1])}</p></details>`).join('')}</div>`,
    kontak: `<h2>Kontak</h2><div class="ccards">${contact.map(c => `<div class="cc"><small>${c[0]}</small><b>${c[1]}</b></div>`).join('')}</div><p class="muted">Sertakan nomor invoice supaya pertanyaan lebih cepat ditangani.</p>`,
    syarat: legal('syarat'),
    privasi: legal('privasi')
  };
  setTitle(tabs.find(t => t[0] === cur)[1]);
  view.innerHTML = `<div class="wrap pg">
    <header class="ph"><p class="eyebrow">Bantuan</p><h1>Ada yang bisa dibantu?</h1></header>
    <nav class="ht" aria-label="Topik bantuan">${tabs.map(t => `<a href="#/bantuan/${t[0]}" ${cur === t[0] ? 'aria-current="page"' : ''}>${t[1]}</a>`).join('')}</nav>
    <section class="hsec" id="${cur}" tabindex="-1">${body[cur]}</section></div>`;
}
