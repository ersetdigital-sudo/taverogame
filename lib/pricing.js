import { PROMOS } from './data';
import { rp } from './util';

/* js/pricing.js */
/* pricing.js — perhitungan harga UNTUK TAMPILAN di klien.
   Server WAJIB menghitung ulang harga, diskon, dan biaya admin saat createOrder. */
export const Pricing = {
  fee(method, base) {
    if (!method || base <= 0) return 0;
    return method.fee.type === 'percent' ? Math.ceil(base * method.fee.value / 100) : method.fee.value;
  },
  feeLabel(method) {
    return method.fee.type === 'percent' ? String(method.fee.value).replace('.', ',') + '%' : rp(method.fee.value);
  },
  inScope(p, ctx) {
    if (p.scope === 'all') return true;
    if (p.scope === 'game' || p.scope === 'ppob') return p.scope === ctx.kind;
    return p.scope.includes(ctx.serviceId);
  },
  /* ctx: { kind, serviceId, subtotal, isFirst } → { ok, promo, discount, message } */
  check(code, ctx) {
    const c = String(code || '').trim().toUpperCase();
    if (!c) return { ok: false, message: 'Masukkan kode promo.' };
    const p = PROMOS.find(x => x.code === c);
    if (!p) return { ok: false, message: 'Kode promo tidak ditemukan.' };
    if (!this.inScope(p, ctx)) return { ok: false, promo: p, message: `Kode ${c} tidak berlaku untuk layanan ini.` };
    if (p.firstOnly && ctx.isFirst === false) return { ok: false, promo: p, message: `Kode ${c} hanya untuk transaksi pertama.` };
    if (ctx.subtotal <= 0) return { ok: false, promo: p, message: 'Pilih nominal dulu agar promo bisa dicek.' };
    if (ctx.subtotal < p.min) return { ok: false, promo: p, message: `Minimal belanja ${rp(p.min)} untuk memakai ${c}.` };
    let d = p.type === 'percent' ? Math.floor(ctx.subtotal * p.value / 100) : p.value;
    d = Math.min(d, p.max || d, ctx.subtotal);
    return { ok: true, promo: p, discount: d, message: `${c} terpasang, hemat ${rp(d)}.` };
  },
  /* Promo yang cocok dengan layanan (untuk chip saran). */
  suggestions(ctx) {
    return PROMOS.filter(p => this.inScope(p, ctx) && !(p.firstOnly && ctx.isFirst === false));
  }
};

