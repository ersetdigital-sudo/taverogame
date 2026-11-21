/* store.js — preferensi lokal (tema). Transaksi tidak disimpan di perangkat. */
const hasStorage = typeof localStorage !== 'undefined';

if (hasStorage) {
  try {
    localStorage.removeItem('tv.orders');
    localStorage.removeItem('tv.mockdb');
  } catch (e) { /* storage diblokir */ }
}

export const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } }
};

/* Pesanan hanya hidup di memori selama sesi; backend pemilik lookup sebenarnya. */
let orders = [];

export const Tx = {
  all() { return [...orders].sort((a, b) => b.createdAt - a.createdAt); },
  get(id) {
    const key = String(id || '').toUpperCase();
    return orders.find(o => o.id === key) || null;
  },
  upsert(o) {
    const i = orders.findIndex(x => x.id === o.id);
    if (i >= 0) orders[i] = o; else orders.push(o);
    return o;
  },
  clear() { orders = []; },
  hasUsed() { return orders.some(o => o.status !== 'Dibatalkan' && o.status !== 'Gagal'); }
};
