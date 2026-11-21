import { Catalog, PAY_METHODS_ACTIVE, SITE } from '../data';
import { $, $$, esc, rp, maskId, maskName, detectOperator, validateField, REDUCED, setTitle } from '../util';
import { ppobIcon, ui } from '../icons';
import { Pricing } from '../pricing';
import { Api } from '../api';
import { Tx } from '../store';
import { Toast } from '../ui/toast';
import { Sheet } from '../ui/sheet';
import { PageNotFound } from './notfound';

/* js/pages/service.js */
/* pages/service.js — checkout satu halaman untuk SEMUA game & PPOB, dirender dari objek katalog.
   Bagian: Data tujuan → Nominal (prabayar/game) → Promo → Metode bayar, dengan panel keranjang di samping. */
export function PageService(view, kind, id, query) {
  const svc = Catalog.service(kind, id);
  if (!svc) return PageNotFound(view);
  setTitle(svc.name);
  const post = !!svc.postpaid;
  const S = { values: {}, productId: null, promoCode: '', promoMsg: null, methodId: PAY_METHODS_ACTIVE[0]?.id || 'qris', bill: null, busy: false, inquiring: false };
  svc.fields.forEach(f => { S.values[f.key] = query['f_' + f.key] && (f.type !== 'select' || f.options.includes(query['f_' + f.key])) ? String(query['f_' + f.key]).slice(0, 40) : ''; });
  if (!post && query.p && Catalog.product(svc, query.p)) S.productId = query.p;
  const ctxBase = () => ({ kind, serviceId: svc.id, isFirst: !Tx.hasUsed() });
  const listPath = kind === 'game' ? '#/topup' : '#/bayar';
  const num = (() => { let n = 0; return () => ++n; })();

  const iconHTML = kind === 'game' ? `<img src="${svc.cover}" alt="" width="72" height="72">` : ppobIcon(svc.icon);
  const head = (n, t) => `<header class="cs__h"><i>${n}</i><h2>${t}</h2></header>`;

  const fieldHTML = f => {
    const fid = 'f-' + f.key;
    if (f.type === 'select') return `<div class="field"><label for="${fid}">${esc(f.label)}</label><select id="${fid}" data-key="${f.key}" aria-describedby="${fid}-err"><option value="">Pilih ${esc(f.label.toLowerCase())}</option>${f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select><p class="field__err" id="${fid}-err" role="alert"></p></div>`;
    const im = f.digits || f.type === 'phone' ? 'numeric' : f.type === 'email' ? 'email' : 'text';
    return `<div class="field"><label for="${fid}">${esc(f.label)}</label><input id="${fid}" data-key="${f.key}" type="${f.type === 'email' ? 'email' : 'text'}" inputmode="${im}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(f.placeholder || '')}" ${f.max ? `maxlength="${f.type === 'phone' ? 16 : f.max}"` : ''} aria-describedby="${fid}-hint ${fid}-err"><p class="field__hint" id="${fid}-hint">${esc(f.help || '')}${f.detect ? ' <span class="op" id="op-badge" hidden></span>' : ''}</p><p class="field__err" id="${fid}-err" role="alert"></p></div>`;
  };

  const sections = [];
  sections.push(`<section class="cs" aria-labelledby="sec-data">${head(num(), `<span id="sec-data">${kind === 'game' ? 'Data akun' : 'Data tujuan'}</span>`)}<div class="fields${svc.fields.length > 1 && kind === 'game' ? ' fields--2' : ''}">${svc.fields.map(fieldHTML).join('')}</div>${post ? `<button type="button" class="btn btn--ink bill-btn" id="bill-go">Cek Tagihan</button><div id="bill-box" aria-live="polite"></div>` : ''}</section>`);
  if (!post) sections.push(`<section class="cs" aria-labelledby="sec-nom">${head(num(), `<span id="sec-nom">Pilih nominal</span>`)}<div class="opts" role="radiogroup" aria-label="Pilih nominal">${svc.products.map(p => `<label class="opt"><input type="radio" name="product" value="${p.id}" ${S.productId === p.id ? 'checked' : ''}><span class="opt__body">${p.tag ? `<em class="opt__tag">${esc(p.tag)}</em>` : ''}<b>${esc(p.name)}</b><span class="opt__price">${rp(p.price)}${p.was ? ` <s>${rp(p.was)}</s>` : ''}</span></span></label>`).join('')}</div><p class="field__err" id="prod-err" role="alert"></p></section>`);
  sections.push(`<section class="cs" aria-labelledby="sec-pay">${head(num(), `<span id="sec-pay">Metode pembayaran</span>`)}<div class="opts opts--list" role="radiogroup" aria-label="Metode pembayaran">${PAY_METHODS_ACTIVE.map(m => `<label class="opt opt--row"><input type="radio" name="method" value="${m.id}" ${m.id === S.methodId ? 'checked' : ''}><span class="opt__body"><span class="mk" style="--c:${m.color}">${m.mark}</span><span class="opt__txt"><b>${esc(m.name)}</b><small>${esc(m.desc)}</small></span><span class="opt__fee" data-fee="${m.id}"></span></span></label>`).join('')}</div></section>`);

  view.innerHTML = `<div class="wrap co">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Beranda</a>${ui('chevR', 14)}<a href="${listPath}">${kind === 'game' ? 'Top Up Game' : 'Tagihan & Pulsa'}</a>${ui('chevR', 14)}<span aria-current="page">${esc(svc.name)}</span></nav>
    <header class="cohead" style="--c:${kind === 'game' ? 'var(--panel)' : svc.color};--ink-c:${kind === 'game' ? 'var(--panel-ink)' : svc.ink}"><span class="cohead__ico">${iconHTML}</span><div><h1>${esc(svc.name)}</h1><p>${esc(svc.desc)}</p></div></header>
    <div class="co-grid">
      <form class="co-form" id="cof" novalidate autocomplete="off">${sections.join('')}</form>
      <aside class="cart" aria-label="Rincian pesanan"><div class="cart__in" id="cart"></div></aside>
    </div></div>
    <div class="cartbar" id="cartbar"><div><small>Total bayar</small><b id="cb-tot">—</b></div><button type="button" class="btn btn--accent" data-submit>Buat Pesanan</button></div>`;

  const billHTML = () => {
    const b = S.bill; if (!b) return '';
    return `<div class="bill"><div class="bill__top"><span class="badge badge--ok">Tagihan ditemukan</span><b>${esc(maskName(b.customerName))}</b></div><dl class="sum">${b.details.map(d => `<div><dt>${esc(d.label)}</dt><dd>${esc(d.value)}</dd></div>`).join('')}<div><dt>Tagihan</dt><dd>${rp(b.amount)}</dd></div><div><dt>Biaya layanan</dt><dd>${rp(b.adminFee)}</dd></div><div class="sum--tot"><dt>Total tagihan</dt><dd>${rp(b.amount + b.adminFee)}</dd></div></dl></div>`;
  };

  function calc() {
    let name = '', subtotal = 0;
    if (post) { if (S.bill) { name = 'Tagihan ' + (svc.short || svc.name) + ' · ' + S.bill.period; subtotal = S.bill.amount + S.bill.adminFee; } }
    else { const p = Catalog.product(svc, S.productId); if (p) { name = p.name; subtotal = p.price; } }
    const res = S.promoCode ? Pricing.check(S.promoCode, { ...ctxBase(), subtotal }) : null;
    const discount = res && res.ok ? res.discount : 0;
    const method = PAY_METHODS_ACTIVE.find(m => m.id === S.methodId);
    const fee = Pricing.fee(method, subtotal - discount);
    return { name, subtotal, res, discount, method, fee, total: subtotal ? subtotal - discount + fee : 0 };
  }

  function paint() {
    const c = calc();
    const tg = svc.fields.filter(f => S.values[f.key]).map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.type === 'select' ? S.values[f.key] : maskId(S.values[f.key]))}</dd></div>`).join('');
    $('#cart', view).innerHTML = `<p class="cart__brand">${esc(SITE.name)}</p><h2>Rincian pesanan</h2><dl class="sum"><div><dt>Layanan</dt><dd>${esc(svc.name)}</dd></div>${tg}<div><dt>Produk</dt><dd>${esc(c.name || '—')}</dd></div><div><dt>Harga</dt><dd>${c.subtotal ? rp(c.subtotal) : '—'}</dd></div>${c.discount ? `<div class="sum--disc"><dt>Diskon ${esc(S.promoCode.toUpperCase())}</dt><dd>−${rp(c.discount)}</dd></div>` : ''}<div><dt>Admin ${esc(c.method.name)}</dt><dd>${c.subtotal ? rp(c.fee) : '—'}</dd></div></dl><div class="cart__tot"><span>Total</span><b>${c.total ? rp(c.total) : '—'}</b></div><p class="cart__note">${ui('info', 15)} Harga final dihitung ulang saat pesanan dibuat.</p><button type="button" class="btn btn--accent btn--block btn--lg" data-submit>${btnLabel()}</button>`;
    $('#cb-tot', view).textContent = c.total ? rp(c.total) : '—';
    $$('[data-submit]', view).forEach(b => { b.textContent = btnLabel(); b.disabled = S.busy || S.inquiring; });
    const bg = $('#bill-go', view); if (bg) { bg.textContent = S.inquiring ? 'Memeriksa…' : S.bill ? 'Cek Ulang Tagihan' : 'Cek Tagihan'; bg.disabled = S.inquiring; }
    PAY_METHODS_ACTIVE.forEach(m => { const el = $(`[data-fee="${m.id}"]`, view); if (el) el.textContent = c.subtotal ? '+' + rp(Pricing.fee(m, c.subtotal - c.discount)) : Pricing.feeLabel(m); });
  }
  const btnLabel = () => S.busy ? 'Memproses…' : (post && !S.bill ? (S.inquiring ? 'Memeriksa…' : 'Cek Tagihan') : 'Buat Pesanan');

  /* ---------- validasi ---------- */
  const errEl = k => $('#f-' + k + '-err', view);
  function setErr(f, msg) { const inp = $('#f-' + f.key, view); if (!inp) return; errEl(f.key).textContent = msg || ''; inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); inp.closest('.field').classList.toggle('has-err', !!msg); }
  function validateAll() { let first = null; svc.fields.forEach(f => { const m = validateField(f, S.values[f.key]); setErr(f, m); if (m && !first) first = f; }); return first; }
  const focusEl = el => { if (!el) return; el.scrollIntoView({ block: 'center', behavior: REDUCED() ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); };

  async function inquire() {
    const bad = validateAll(); if (bad) { focusEl($('#f-' + bad.key, view)); return; }
    S.inquiring = true; paint();
    try {
      S.bill = await Api.inquireBill({ serviceId: svc.id, fields: { ...S.values } });
      $('#bill-box', view).innerHTML = billHTML(); Toast.show('Tagihan ditemukan');
    } catch (e) {
      S.bill = null; $('#bill-box', view).innerHTML = '';
      const first = svc.fields.find(f => f.key === 'idpel' || f.key === 'va') || svc.fields[0]; setErr(first, e.message); focusEl($('#f-' + first.key, view));
    } finally { S.inquiring = false; paint(); }
  }

  async function submit() {
    if (S.busy || S.inquiring) return;
    const bad = validateAll(); if (bad) { focusEl($('#f-' + bad.key, view)); return; }
    if (post && !S.bill) return inquire();
    if (!post && !S.productId) { $('#prod-err', view).textContent = 'Pilih nominal terlebih dahulu.'; focusEl($('input[name="product"]', view)); return; }
    const c = calc();
    const details = [['Layanan', svc.name], ...svc.fields.map(f => [f.label, f.type === 'select' ? S.values[f.key] : maskId(S.values[f.key])]), ['Produk', c.name], ['Metode bayar', c.method.name]];
    const prices = [['Harga', rp(c.subtotal)]];
    if (c.discount) prices.push(['Diskon', '−' + rp(c.discount)]);
    prices.push(['Biaya admin', rp(c.fee)]);
    const ok = await Sheet.show({
      title: 'Konfirmasi pesanan',
      variant: 'wide',
      body: `<div class="confirm">
        <section class="confirm__details"><h3 class="confirm__label">Detail pesanan</h3><dl class="sum sum--sheet">${details.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl></section>
        <aside class="confirm__summary"><h3 class="confirm__label">Ringkasan biaya</h3><dl class="sum">${prices.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl><div class="confirm__total"><span>Total bayar</span><b>${rp(c.total)}</b></div></aside>
      </div><p class="muted confirm__note">Pastikan data tujuan sudah benar. Pesanan yang berhasil diproses tidak dapat dibatalkan.</p>`,
      actions: [{ label: 'Periksa Lagi', value: false, kind: 'ghost' }, { label: 'Buat Pesanan', value: true, kind: 'accent' }]
    });
    if (ok !== true) return;
    S.busy = true; paint();
    try {
      const order = await Api.createOrder({ kind, serviceId: svc.id, fields: { ...S.values }, productId: S.productId || undefined, billRef: S.bill ? S.bill.billRef : undefined, promoCode: c.res && c.res.ok ? S.promoCode : undefined, methodId: S.methodId });
      Tx.upsert(order);
      Toast.show('Pesanan dibuat. Selesaikan pembayaran.');
      location.hash = '#/pesanan/' + order.id;
    } catch (e) { Toast.show(e.message || 'Pesanan gagal dibuat.', 'err'); S.busy = false; paint(); }
  }

  /* ---------- event ---------- */
  const clearBill = () => { if (post && S.bill) { S.bill = null; $('#bill-box', view).innerHTML = ''; } };
  view.addEventListener('input', e => {
    const t = e.target, key = t.dataset && t.dataset.key; if (!key) return;
    const f = svc.fields.find(x => x.key === key);
    if (f.digits && t.type !== 'email') { const c = t.value.replace(/\D/g, ''); if (c !== t.value) t.value = c; }
    if (f.type === 'phone') { const c = t.value.replace(/[^\d+\s-]/g, ''); if (c !== t.value) t.value = c; }
    S.values[key] = t.value; if (errEl(key).textContent) setErr(f, '');
    if (f.detect) { const op = detectOperator(t.value), b = $('#op-badge', view); if (b) { b.hidden = !op; b.textContent = op; } }
    clearBill(); paint();
  });
  view.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'product') { S.productId = t.value; $('#prod-err', view).textContent = ''; paint(); }
    else if (t.name === 'method') { S.methodId = t.value; paint(); }
    else if (t.dataset && t.dataset.key) { const f = svc.fields.find(x => x.key === t.dataset.key); S.values[f.key] = t.value; setErr(f, ''); clearBill(); paint(); }
  });
  view.addEventListener('focusout', e => { const key = e.target.dataset && e.target.dataset.key; if (!key) return; const f = svc.fields.find(x => x.key === key); if (S.values[key]) setErr(f, validateField(f, S.values[key])); });
  view.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') { e.preventDefault(); submit(); } });
  view.addEventListener('click', e => {
    if (e.target.closest('[data-submit]')) return submit();
    if (e.target.closest('#bill-go')) return inquire();
  });
  $('#cof', view).addEventListener('submit', e => e.preventDefault());

  /* ---------- awal ---------- */
  svc.fields.forEach(f => { const el = $('#f-' + f.key, view); if (el) el.value = S.values[f.key] || ''; });
  const ph = svc.fields.find(f => f.detect); if (ph) { const op = detectOperator(S.values[ph.key]), b = $('#op-badge', view); if (b) { b.hidden = !op; b.textContent = op; } }
  paint();
  if (window.innerWidth >= 1024 && !S.values[svc.fields[0].key]) { const fi = $('#f-' + svc.fields[0].key, view); if (fi) fi.focus({ preventScroll: true }); }
  return () => {};
}
