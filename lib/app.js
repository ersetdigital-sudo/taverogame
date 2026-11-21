import { $ } from './util';
import { SITE, PAY_METHODS_ACTIVE } from './data';
import { esc } from './util';
import { logoFull, ui } from './icons';
import { Theme } from './ui/theme';
import { Palette } from './ui/palette';
import { Router } from './router';

const NAV = [
  ['home', 'Beranda', '#/', 'home'],
  ['bayar', 'Tagihan & Pulsa', '#/bayar', 'grid'],
  ['topup', 'Top Up Game', '#/topup', 'game'],
  ['pesanan', 'Pesanan', '#/pesanan', 'receipt'],
  ['help', 'Bantuan', '#/bantuan', 'help']
];
const SHORT = { bayar: 'Bayar', topup: 'Game' };

let booted = false;

function topbar() {
  return `<div class="tb">${logoFull()}
    <nav class="tb__nav" aria-label="Navigasi utama">${NAV.map(n => `<a href="${n[2]}" data-nav="${n[0]}">${n[1]}</a>`).join('')}</nav>
    <button type="button" class="tb__find" data-open-palette aria-label="Cari layanan atau game (Ctrl+K)">${ui('search', 18)}<span>Cari</span><kbd>Ctrl K</kbd></button>
    <button type="button" class="icon-btn tb__findi" data-open-palette aria-label="Cari layanan atau game">${ui('search', 20)}</button>
    <button type="button" class="icon-btn" data-theme-btn></button>
    <a class="btn btn--accent btn--sm tb__cta" href="#/pesanan">Cek Pesanan</a></div>`;
}
function tabbar() {
  return NAV.map(n => `<a href="${n[2]}" data-nav="${n[0]}">${ui(n[3], 22)}<span>${SHORT[n[0]] || n[1]}</span></a>`).join('');
}
function footer() {
  const c = [];
  if (SITE.email) c.push(`<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>`);
  if (SITE.whatsapp) c.push(`<li>WhatsApp ${esc(SITE.whatsapp)}</li>`);
  if (SITE.phone) c.push(`<li>Telepon ${esc(SITE.phone)}</li>`);
  if (SITE.hours) c.push(`<li>${esc(SITE.hours)}</li>`);
  if (SITE.address) c.push(`<li>${esc(SITE.address)}</li>`);
  return `<div class="wrap"><div class="ft">
    <div class="ft__a"><b>${esc(SITE.name)}</b><p>Pulsa, tagihan, e-wallet, voucher digital, dan top up game.</p></div>
    <div><h3>Hubungi kami</h3><ul>${c.join('')}</ul></div>
    <div><h3>Tautan</h3><ul><li><a href="#/pesanan">Cek Pesanan</a></li><li><a href="#/bantuan">Pertanyaan Umum</a></li><li><a href="#/bantuan/syarat">Syarat &amp; Ketentuan</a></li><li><a href="#/bantuan/privasi">Kebijakan Privasi</a></li></ul></div>
  </div>
  <div class="ft__pay"><span>Bayar dengan</span>${PAY_METHODS_ACTIVE.map(m => `<i>${esc(m.name)}</i>`).join('')}</div>
  <p class="ft__copy">© ${new Date().getFullYear()} ${esc(SITE.legalName || SITE.name)}</p></div>`;
}

export function boot() {
  if (booted || typeof window === 'undefined' || window.__taveroBooted) return;
  booted = true;
  window.__taveroBooted = true;
  $('#topbar').innerHTML = topbar();
  $('#tabbar').innerHTML = tabbar();
  $('#site-footer').innerHTML = footer();
  Theme.init();
  Palette.init();
  const skip = $('#skip');
  if (skip) skip.addEventListener('click', (e) => { e.preventDefault(); const v = $('#view'); v.focus(); v.scrollIntoView(); });
  Router.start();
}
