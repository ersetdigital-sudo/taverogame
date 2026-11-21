import { GAMES, PPOB, PAY_METHODS_ACTIVE, Catalog } from '../data';
import { esc, rp, svcIconHTML } from '../util';
import { ppobIcon, ui } from '../icons';

/* js/pages/home.js */
/* pages/home.js — Beranda: hero ilustrasi, bento layanan, rel game, kupon, alur, pilihan cepat. */
function secHead(title, link, sub, id) {
  return `<div class="sh"><div><h2${id ? ` id="${id}"` : ''}>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${link ? `<a class="sh__more" href="${link[1]}">${link[0]} ${ui('arrow', 16)}</a>` : ''}</div>`;
}

/* Visual hero: permata besar + koin + cincin orbit (SVG), dengan chip status kaca di atasnya.
   Animasi memakai CSS `translate` pada <g class="fl"> di dalam <g transform> pembungkus. */
function heroArt() {
  const gem = (s, x, y, cls) => `<g transform="translate(${x} ${y}) scale(${s}) translate(-260 -200)"><g class="${cls || ''}">
    <polygon points="130,200 192,122 205,200" fill="#8FA8FF"/><polygon points="192,122 260,122 205,200" fill="#C3D1FF"/><polygon points="260,122 315,200 205,200" fill="#6F8CFF"/>
    <polygon points="260,122 328,122 315,200" fill="#A9BBFF"/><polygon points="328,122 390,200 315,200" fill="#5B79F5"/>
    <polygon points="130,200 205,200 260,352" fill="#3F5CEA"/><polygon points="205,200 260,200 260,352" fill="#5671F2"/><polygon points="260,200 315,200 260,352" fill="#2D47CC"/><polygon points="315,200 390,200 260,352" fill="#2338A8"/>
    <polygon points="130,200 192,122 328,122 390,200 260,352" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linejoin="round"/>
    <path d="M205 200 260 122 315 200M205 200 260 352 315 200M260 122v230" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
    <path d="M150 192 196 132h28L176 192z" fill="#fff" opacity=".35"/></g></g>`;
  const spark = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-14C2-4 4-2 14 0 4 2 2 4 0 14-2 4-4 2-14 0-4-2-2-4 0-14z" fill="#fff" opacity=".9"/>`;
  const coin = (x, y) => `<g transform="translate(${x} ${y}) rotate(-12)"><g class="fl fl3"><ellipse cy="26" rx="46" ry="16" fill="#7BA312"/><rect x="-46" y="8" width="92" height="18" fill="#9FCB1F"/><ellipse cy="8" rx="46" ry="16" fill="#C6F24E"/><ellipse cy="8" rx="34" ry="11" fill="none" stroke="#7BA312" stroke-width="3"/><text y="14" text-anchor="middle" font-family="Sora,Arial,sans-serif" font-weight="700" font-size="17" fill="#5E8000">Rp</text></g></g>`;
  const chip = (cls, anim, svc, title, sub) => `<div class="gchip ${cls}"><span class="fl ${anim}" style="display:flex;align-items:center;gap:10px"><i style="--c:${svc.color}">${ppobIcon(svc.icon)}</i><span><b>${title}</b><small>${sub}</small></span></span></div>`;
  const P = id => PPOB.find(p => p.id === id);
  return `<div class="stage" role="img" aria-label="Permata, koin, dan status pesanan berhasil">
  <svg class="stage__svg" viewBox="0 0 520 470" aria-hidden="true" focusable="false">
    <defs><radialGradient id="hg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4F6BFF" stop-opacity=".85"/><stop offset=".6" stop-color="#3B5BFF" stop-opacity=".25"/><stop offset="1" stop-color="#3B5BFF" stop-opacity="0"/></radialGradient></defs>
    <circle cx="260" cy="225" r="230" fill="url(#hg)"/>
    <g transform="translate(260 235) rotate(-16)"><ellipse rx="218" ry="66" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/><circle cx="-218" cy="0" r="7" fill="#C6F24E"/><circle cx="154" cy="46" r="5" fill="#5FE1FF"/></g>
    <ellipse cx="260" cy="400" rx="118" ry="16" fill="#000" opacity=".35"/>
    ${gem(1, 260, 232, 'fl')}
    ${coin(96, 96)}
    ${gem(.2, 98, 392, 'fl fl2')}${gem(.16, 452, 262, 'fl fl3')}
    ${spark(404, 62, 1)}${spark(52, 238, .7)}${spark(470, 392, .8)}${spark(318, 420, .6)}${spark(166, 40, .6)}
  </svg>
  ${chip('gchip--a', 'fl3', P('pulsa'), 'Pulsa Rp20.000', '✓ Berhasil')}
  ${chip('gchip--b', 'fl2', P('pln'), 'Token PLN Rp100.000', '✓ Berhasil')}
  ${chip('gchip--c', '', P('ewallet'), 'Saldo E-Wallet', '✓ Berhasil')}
  </div>`;
}

export function PageHome(view) {
  const minPrice = g => Math.min(...g.products.map(p => p.price));
  const svcTile = (s, extra) => {
    const chips = extra ? `<div class="bt__chips">${s.products.slice(0, extra).map(p => `<a href="${Catalog.href(s, p.id)}" aria-label="${esc(s.name)}: ${esc(p.name)}">${esc(p.name)}</a>`).join('')}</div>` : '';
    return `<li class="bt${s.id === 'pulsa' ? ' bt--big' : ''}" style="--c:${s.color};--ink-c:${s.ink}"><a class="bt__a" href="${Catalog.href(s)}" aria-label="${esc(s.name)}"></a><span class="bt__ico">${ppobIcon(s.icon)}</span><span class="bt__g">${esc(s.group)}</span><b>${esc(s.short || s.name)}</b><small>${esc(s.desc)}</small><span class="bt__go" aria-hidden="true">${ui('arrow', 18)}</span>${chips}</li>`;
  };
  const order = ['pulsa', 'data', 'pln', 'plnpasca', 'bpjs', 'pdam', 'internet', 'ewallet', 'voucher'];
  const tiles = order.map(id => PPOB.find(p => p.id === id)).filter(Boolean);

  view.innerHTML = `
  <section class="wrap" aria-labelledby="hero-h"><div class="hero">
    <div class="hero__txt">
      <p class="pill"><i></i>Top up &amp; PPOB dalam satu platform</p>
      <h1 id="hero-h">Top up game. <span class="u">Bayar tagihan.</span> Satu tempat.</h1>
      <p class="hero__sub">Diamond, pulsa, token listrik, BPJS, sampai saldo e-wallet. Pilih layanan, bayar, lalu pantau statusnya dari satu halaman.</p>
      <div class="hero__cta"><a class="btn btn--accent btn--lg" href="#/bayar">Mulai Bayar ${ui('arrow', 18)}</a><a class="btn btn--line btn--lg" href="#/topup">Top Up Game</a></div>
      <dl class="stats">
        <div><dt>layanan PPOB</dt><dd>${PPOB.length}</dd></div>
        <div><dt>game tersedia</dt><dd>${GAMES.length}</dd></div>
        <div><dt>metode bayar</dt><dd>${PAY_METHODS_ACTIVE.length}</dd></div>
        <div><dt>batas bayar</dt><dd>24 jam</dd></div>
      </dl>
    </div>
    <div class="hero__vis">${heroArt()}</div>
  </div></section>

  <section class="wrap blk" aria-labelledby="h-ppob">${secHead('Layanan PPOB', ['Semua layanan', '#/bayar'], 'Pulsa, kuota, listrik, dan tagihan bulanan dalam satu tempat.', 'h-ppob')}
    <ul class="bento">${tiles.map(s => svcTile(s, s.id === 'pulsa' ? 4 : 0)).join('')}</ul></section>

  <section class="wrap blk" aria-labelledby="h-game">${secHead('Top Up Game', ['Semua game', '#/topup'], 'Pilih game, masukkan ID, pilih nominal.', 'h-game')}
    <div class="rail" tabindex="0" role="region" aria-label="Daftar game, geser ke samping">${GAMES.map(g => `<a class="gcard" href="${Catalog.href(g)}"><span class="gcard__img"><img src="${g.cover}" alt="" width="204" height="255" loading="lazy"><span class="gcard__cat">${esc(g.cat)}</span></span><span><b>${esc(g.name)}</b><small>${esc(g.pub)}</small></span></a>`).join('')}</div></section>

  <section class="wrap blk" aria-labelledby="h-quick">${secHead('Pilihan cepat', null, 'Satu ketukan langsung ke nominal yang sering dicari.', 'h-quick')}
    <div class="qps">${Catalog.featured.map(([k, sid, pid]) => { const s = Catalog.service(k, sid), p = s && Catalog.product(s, pid); if (!p) return ''; return `<a class="qp" href="${Catalog.href(s, pid)}">${svcIconHTML(s, 'qp__ico')}<span><b>${esc(p.name)}</b><small>${esc(s.short || s.name)}</small></span><span class="qp__p">${rp(p.price)}</span></a>`; }).join('')}</div></section>

  <section class="wrap blk" aria-labelledby="h-flow">${secHead('Cara pesan', null, null, 'h-flow')}
    <ol class="flow"><li><i>1</i><b>Pilih layanan</b><p>Cari pulsa, tagihan, atau game yang ingin diisi.</p></li><li><i>2</i><b>Isi data dan nominal</b><p>Masukkan nomor atau ID tujuan, lalu pilih nominalnya.</p></li><li><i>3</i><b>Bayar</b><p>Bayar lewat QRIS, lalu pantau status pesanan di menu Pesanan.</p></li></ol></section>

  <section class="wrap blk"><div class="band"><div><h2>Sudah pesan? Cek statusnya.</h2><p>Buka menu Pesanan dan masukkan nomor invoice untuk melihat pesanan Anda.</p></div><a class="btn btn--ink btn--lg" href="#/pesanan">Cek Pesanan</a></div></section>`;
}
