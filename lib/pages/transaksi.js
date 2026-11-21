import { Catalog, SITE } from '../data';
import { $, esc, rp, fmtDate, maskId, statusBadge, copyText } from '../util';
import { ui } from '../icons';
import { Api } from '../api';
import { Tx } from '../store';
import { Toast } from '../ui/toast';
import { Sheet } from '../ui/sheet';

/* js/pages/transaksi.js */
/* pages/transaksi.js — cek invoice & detail pesanan (tiket + linimasa vertikal) */
export function PageTxList(view, query) {
  let q = (query.q || '').toUpperCase(), alive = true;
  view.innerHTML = `<div class="wrap pg">
    <header class="ph"><p class="eyebrow">Pesanan</p><h1>Cek status pesanan.</h1><p class="ph__sub">Masukkan nomor invoice untuk melihat status pesanan.</p></header>
    <form class="invq" id="inv-form" role="search"><div class="sin">${ui('search', 18)}<label class="sr" for="inv-q">Nomor invoice</label><input id="inv-q" type="search" placeholder="Nomor invoice, misalnya TV250101ABC123" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(q)}"></div><button class="btn btn--ink" type="submit">Cek Invoice</button></form>
    <p class="field__err" id="inv-err" role="alert"></p>
    <p class="muted tx-note">Demi keamanan, riwayat transaksi tidak disimpan di perangkat ini. Catat nomor invoice untuk referensi atau bantuan.</p>
    </div>`;
  const err = $('#inv-err', view), inp = $('#inv-q', view);

  inp.addEventListener('input', () => { err.textContent = ''; });
  $('#inv-form', view).addEventListener('submit', async e => {
    e.preventDefault(); q = inp.value.trim().toUpperCase(); inp.value = q; err.textContent = '';
    if (!q) { err.textContent = 'Masukkan nomor invoice terlebih dahulu.'; inp.focus(); return; }
    const btn = $('#inv-form button', view); btn.disabled = true;
    try {
      const o = await Api.getOrder(q); if (!alive) return;
      if (o) { Tx.upsert(o); location.hash = '#/pesanan/' + o.id; }
      else { err.textContent = `Invoice ${q} tidak ditemukan. Periksa kembali nomornya.`; inp.focus(); }
    } catch (x) { err.textContent = 'Gagal memeriksa invoice. Coba lagi.'; }
    btn.disabled = false;
  });
  return () => { alive = false; };
}

export function PageTxDetail(view, id) {
  id = String(id).toUpperCase(); let alive = true, poll = null, tick = null, order = Tx.get(id);
  view.innerHTML = `<div class="wrap pg pg--slim"><a class="back" href="#/pesanan">${ui('chevL', 16)} Semua pesanan</a><div id="d-out"><div class="skeleton" style="height:320px;border-radius:26px"></div></div></div>`;
  const out = $('#d-out', view);

  function render() {
    const o = order;
    if (!o) { out.innerHTML = `<div class="empty"><div class="empty__ico">${ui('search', 30)}</div><h1>Invoice tidak ditemukan</h1><p>Nomor <code>${esc(id)}</code> tidak terdaftar. Periksa kembali nomornya.</p><div class="empty__act"><a class="btn btn--accent" href="#/pesanan">Kembali ke Pesanan</a></div></div>`; return; }
    const svc = Catalog.service(o.kind, o.serviceId), waiting = o.status === 'Menunggu Pembayaran';
    const msg = { 'Menunggu Pembayaran': 'Selesaikan pembayaran sebelum batas waktu.', 'Diproses': 'Pembayaran diterima. Pesanan sedang diproses.', 'Berhasil': 'Pesanan sudah terkirim ke tujuan.', 'Gagal': 'Hubungi kami dengan nomor invoice ini.', 'Dibatalkan': o.note || 'Pesanan ini tidak dilanjutkan.' }[o.status];
    const finalLabel = o.status === 'Gagal' ? 'Gagal' : o.status === 'Dibatalkan' ? 'Dibatalkan' : 'Selesai';
    const stages = [['Pesanan dibuat', o.createdAt], ['Dibayar', o.paidAt], ['Diproses', o.processingAt], [finalLabel, o.doneAt]];
    const nowIdx = stages.findIndex(s => !s[1]);
    const track = `<ol class="vt" aria-label="Tahapan pesanan">${stages.map((s, i) => `<li class="${s[1] ? 'is-done' : ''}${i === nowIdx && (waiting || o.status === 'Diproses') ? ' is-now' : ''}"><i>${s[1] ? ui('check', 14) : i + 1}</i><b>${s[0]}</b><small>${s[1] ? fmtDate(s[1]) : 'Belum'}</small></li>`).join('')}</ol>`;
    const title = o.status === 'Berhasil' ? 'Pesanan berhasil' : waiting ? 'Menunggu pembayaran' : o.status === 'Diproses' ? 'Sedang diproses' : o.status === 'Gagal' ? 'Pesanan gagal' : 'Pesanan dibatalkan';
    out.innerHTML = `
      <article class="tk" aria-labelledby="r-h">
        <header class="tk__head">
          <div class="tk__top"><p class="slip__brand">${esc(SITE.name)}</p>${statusBadge(o.status)}</div>
          <h1 id="r-h">${title}</h1><p class="tk__msg">${esc(msg)}</p>
          <div class="tk__amt"><div><small>Total bayar</small><b>${rp(o.total)}</b></div>${waiting ? `<div class="tk__cd"><small>Sisa waktu</small><b id="cd">—</b></div>` : ''}</div>
          ${waiting ? `<p class="tk__dl">Bayar sebelum ${fmtDate(o.expiresAt)}</p>` : ''}
        </header>
        <div class="tk__body">
          ${waiting && o.methodId === 'qris' ? `<div class="tk__qr"><img src="/qris_barcode_only.png" width="530" height="535" alt="Kode QRIS pembayaran"><p>Scan dengan e-wallet atau m-banking.</p></div>` : ''}
          ${waiting ? `<div class="tk__act"><button type="button" class="btn btn--accent btn--lg" id="pay-now">Bayar Sekarang</button><button type="button" class="btn btn--ghost btn--lg" id="cancel-o">Batalkan Pesanan</button></div>` : o.status === 'Diproses' ? `<p class="proc"><span class="spin" aria-hidden="true"></span> Pembayaran diterima, pesanan sedang diproses.</p>` : ''}
          <div class="tk__inv"><div><small>Nomor invoice</small><code id="inv-no">${esc(o.id)}</code></div><button type="button" class="btn btn--ghost btn--sm" id="copy-inv">${ui('copy', 16)} Salin</button></div>
          <h2 class="tk__h">Rincian</h2>
          <dl class="sum"><div><dt>Layanan</dt><dd>${esc(o.serviceName)}</dd></div><div><dt>Produk</dt><dd>${esc(o.productName)}</dd></div>
            ${(o.targets || []).map(t => `<div><dt>${esc(t.label)}</dt><dd>${esc(t.mask ? maskId(t.value) : t.value)}</dd></div>`).join('')}
            <div><dt>Harga</dt><dd>${rp(o.subtotal)}</dd></div>${o.discount ? `<div class="sum--disc"><dt>Diskon ${esc(o.promoCode)}</dt><dd>−${rp(o.discount)}</dd></div>` : ''}
            <div><dt>Biaya admin</dt><dd>${rp(o.fee)}</dd></div><div><dt>Metode bayar</dt><dd>${esc(o.methodName)}</dd></div>
            <div class="sum--tot"><dt>Total</dt><dd>${rp(o.total)}</dd></div></dl>
          <h2 class="tk__h">Status pesanan</h2>
          ${track}
        </div>
      </article>
      <div class="again">${svc ? `<a class="btn btn--ink" href="${Catalog.href(svc, o.productId)}">Pesan Lagi</a>` : ''}<a class="btn btn--ghost" href="#/bantuan">Butuh bantuan?</a></div>`;
    updateCd();
  }
  function updateCd() {
    const el = $('#cd', view); if (!el || !order) return;
    const ms = order.expiresAt - Date.now(); if (ms <= 0) { el.textContent = 'Habis'; return; }
    const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
    el.textContent = `${h}j ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}d`;
  }
  async function refresh() {
    try {
      const n = await Api.getOrder(id); if (!alive) return;
      if (!n) { if (!order) render(); return; }
      Tx.upsert(n); const changed = !order || order.status !== n.status; order = n; if (changed) render();
    } catch (e) { /* coba lagi */ }
  }
  if (order) render();
  refresh();
  poll = setInterval(() => { if (!order || order.status === 'Menunggu Pembayaran' || order.status === 'Diproses') refresh(); }, 1200);
  tick = setInterval(updateCd, 1000);

  out.addEventListener('click', async e => {
    if (e.target.closest('#copy-inv')) Toast.show(await copyText(order.id) ? 'Nomor invoice disalin' : 'Gagal menyalin', 'ok');
    if (e.target.closest('#pay-now')) {
      const b = $('#pay-now', view); b.disabled = true; b.textContent = 'Memproses…';
      try {
        const r = await Api.payOrder(order.id);
        if (r.redirectUrl) { location.href = r.redirectUrl; return; }
        if (!alive) return; order = r.order; Tx.upsert(order); render(); Toast.show('Pembayaran diterima');
      } catch (x) { Toast.show(x.message, 'err'); if (alive) { b.disabled = false; b.textContent = 'Bayar Sekarang'; } }
    }
    if (e.target.closest('#cancel-o')) {
      if (!await Sheet.confirm({ title: 'Batalkan pesanan?', message: 'Pesanan ini akan dibatalkan dan tidak bisa dibayar lagi.', ok: 'Batalkan Pesanan', cancel: 'Kembali', danger: true })) return;
      try { const n = await Api.cancelOrder(order.id); if (!alive) return; order = n; Tx.upsert(n); render(); Toast.show('Pesanan dibatalkan'); } catch (x) { Toast.show(x.message, 'err'); }
    }
  });
  return () => { alive = false; clearInterval(poll); clearInterval(tick); };
}
