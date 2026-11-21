import { Catalog, PAY_METHODS } from './data';
import { delay, validateField } from './util';
import { Pricing } from './pricing';

/* js/api.js */
/* ============================================================
   api.js — SATU-SATUNYA pintu komunikasi ke server.

   KONTRAK (endpoint yang disarankan):
   inquireBill(payload)  POST /api/bills/inquiry   body {serviceId, fields}
        → BillInquiry { billRef, customerName, period, amount, adminFee, details:[{label,value}] }
   createOrder(payload)  POST /api/orders           body OrderPayload
        → Order
   getOrder(id)          GET  /api/orders/:id       → Order | null (404)
   payOrder(id)          POST /api/orders/:id/pay   → { order, redirectUrl? }
        Bila redirectUrl ada, UI mengarahkan ke gateway pembayaran.
   cancelOrder(id)       POST /api/orders/:id/cancel → Order

   OrderPayload {
     kind: 'game'|'ppob', serviceId, fields: {key: nilai},
     productId?  (prabayar / game),
     billRef?    (pascabayar, hasil inquireBill),
     promoCode?, methodId
   }
   Order {
     id (= nomor invoice), kind, serviceId, serviceName, productName,
     targets: [{label, value}],  subtotal, discount, promoCode, fee, total,
     methodId, methodName, status: 'Menunggu Pembayaran'|'Diproses'|'Berhasil'|'Gagal'|'Dibatalkan',
     createdAt, expiresAt, paidAt?, processingAt?, doneAt?, note?   (epoch ms)
   }
   Error: lempar ApiError(message) — pesan ditampilkan apa adanya di UI.

   Setelah go-live: hapus MockBackend, ganti isi objek Api dengan fetch().
   ============================================================ */

export class ApiError extends Error {}

let memoryDb = {};

const MockBackend = {
  PROCESS_MS: 3500,
  EXPIRE_MS: 24 * 3600 * 1000,
  db() { return memoryDb; },
  save(db) { memoryDb = db; },
  hash(s) { return Array.from(String(s)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); },
  NAMES: ['Budi Santoso', 'Siti Rahayu', 'Agus Wijaya', 'Dewi Lestari', 'Rizky Pratama', 'Nur Aini', 'Hendra Kusuma', 'Maya Sari'],

  async inquireBill({ serviceId, fields }) {
    await delay(700);
    const svc = Catalog.service('ppob', serviceId);
    if (!svc || !svc.postpaid) throw new ApiError('Layanan tidak mendukung cek tagihan.');
    for (const f of svc.fields) { const m = validateField(f, fields[f.key]); if (m) throw new ApiError(m); }
    const num = String(fields.idpel || fields.va || '');
    if (/(\d)\1{5,}$/.test(num)) throw new ApiError('Nomor pelanggan tidak ditemukan atau tidak punya tagihan aktif.');
    const h = this.hash(num + serviceId);
    const months = parseInt(fields.months, 10) || 1;
    const base = serviceId === 'bpjs' ? 42000 * months : 60000 + (h % 60) * 5000;
    const d = new Date();
    const period = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const details = [{ label: 'Periode', value: serviceId === 'bpjs' ? months + ' bulan' : period }];
    if (serviceId === 'plnpasca') details.push({ label: 'Tarif / Daya', value: 'R1 / ' + [900, 1300, 2200][h % 3] + ' VA' });
    if (serviceId === 'pdam') details.push({ label: 'Wilayah', value: fields.area });
    if (serviceId === 'internet') details.push({ label: 'Penyedia', value: fields.provider });
    return { billRef: 'BILL' + h.toString(36).toUpperCase() + months, customerName: this.NAMES[h % this.NAMES.length], period, amount: base, adminFee: 2500, details };
  },

  async createOrder(p) {
    await delay(600);
    const svc = Catalog.service(p.kind, p.serviceId);
    if (!svc) throw new ApiError('Layanan tidak ditemukan.');
    for (const f of svc.fields) { const m = validateField(f, p.fields && p.fields[f.key]); if (m) throw new ApiError(m); }
    const method = PAY_METHODS.find(m => m.id === p.methodId);
    if (!method) throw new ApiError('Metode pembayaran tidak valid.');
    let productName, subtotal;
    if (svc.postpaid) {
      const bill = await this.inquireBill({ serviceId: svc.id, fields: p.fields });
      if (bill.billRef !== p.billRef) throw new ApiError('Tagihan berubah. Silakan cek tagihan lagi.');
      productName = 'Tagihan ' + (svc.short || svc.name) + ' · ' + bill.period; subtotal = bill.amount + bill.adminFee;
    } else {
      const prod = Catalog.product(svc, p.productId);
      if (!prod) throw new ApiError('Produk tidak ditemukan.');
      productName = prod.name; subtotal = prod.price;
    }
    let discount = 0, promoCode = '';
    if (p.promoCode) {
      const r = Pricing.check(p.promoCode, { kind: p.kind, serviceId: svc.id, subtotal, isFirst: !(this.db().__used) });
      if (!r.ok) throw new ApiError(r.message);
      discount = r.discount; promoCode = r.promo.code;
    }
    const fee = Pricing.fee(method, subtotal - discount);
    const now = Date.now();
    const rnd = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const dt = new Date(now);
    const id = 'TV' + String(dt.getFullYear()).slice(2) + String(dt.getMonth() + 1).padStart(2, '0') + String(dt.getDate()).padStart(2, '0') + rnd;
    const order = {
      id, kind: p.kind, serviceId: svc.id, serviceName: svc.name, productId: p.productId || '', productName,
      targets: svc.fields.map(f => ({ label: f.label, value: p.fields[f.key], mask: f.type !== 'select' })),
      subtotal, discount, promoCode, fee, total: subtotal - discount + fee,
      methodId: method.id, methodName: method.name, status: 'Menunggu Pembayaran',
      createdAt: now, expiresAt: now + this.EXPIRE_MS
    };
    const db = this.db(); db[id] = order; db.__used = true; this.save(db);
    return order;
  },

  /* Status berjalan otomatis: Diproses → Berhasil setelah ±3,5 dtk; menunggu → batal setelah 24 jam. */
  tick(o) {
    const now = Date.now();
    if (o.status === 'Diproses' && now - o.processingAt >= this.PROCESS_MS) { o.status = 'Berhasil'; o.doneAt = o.processingAt + this.PROCESS_MS; }
    if (o.status === 'Menunggu Pembayaran' && now >= o.expiresAt) { o.status = 'Dibatalkan'; o.doneAt = o.expiresAt; o.note = 'Melewati batas waktu pembayaran.'; }
    return o;
  },

  async getOrder(id) {
    await delay(150);
    const db = this.db(); const o = db[String(id).toUpperCase()];
    if (!o) return null;
    const before = o.status; this.tick(o);
    if (o.status !== before) { db[o.id] = o; this.save(db); }
    return o;
  },
  async payOrder(id) {
    await delay(500);
    const db = this.db(); const o = db[id];
    if (!o) throw new ApiError('Pesanan tidak ditemukan.');
    this.tick(o);
    if (o.status !== 'Menunggu Pembayaran') throw new ApiError('Pesanan ini tidak bisa dibayar lagi.');
    o.status = 'Diproses'; o.paidAt = o.processingAt = Date.now();
    db[id] = o; this.save(db);
    return { order: o };
  },
  async cancelOrder(id) {
    await delay(400);
    const db = this.db(); const o = db[id];
    if (!o) throw new ApiError('Pesanan tidak ditemukan.');
    this.tick(o);
    if (o.status !== 'Menunggu Pembayaran') throw new ApiError('Hanya pesanan yang menunggu pembayaran yang bisa dibatalkan.');
    o.status = 'Dibatalkan'; o.doneAt = Date.now(); o.note = 'Dibatalkan oleh Anda.';
    db[id] = o; this.save(db);
    return o;
  },
  reset() { memoryDb = {}; }
};

export const Api = {
  inquireBill: p => MockBackend.inquireBill(p),
  createOrder: p => MockBackend.createOrder(p),
  getOrder: id => MockBackend.getOrder(id),
  payOrder: id => MockBackend.payOrder(id),
  cancelOrder: id => MockBackend.cancelOrder(id)
};

