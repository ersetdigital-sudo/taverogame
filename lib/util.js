import { SITE } from './data';
import { ppobIcon } from './icons';

/* js/util.js */
/* util.js — helper kecil */
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const rp = n => 'Rp' + Math.round(n || 0).toLocaleString('id-ID');
export const delay = ms => new Promise(r => setTimeout(r, ms));
export const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

export function fmtDate(ts) {
  const d = new Date(ts);
  const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const jam = String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0');
  return tgl + ', ' + jam;
}

export function maskId(v) {
  v = String(v || '');
  if (v.includes('@')) {
    const [l, d] = v.split('@');
    return (l.slice(0, 2) + '•'.repeat(Math.max(2, l.length - 2))) + '@' + d;
  }
  if (v.length <= 4) return v.slice(0, 1) + '•'.repeat(Math.max(1, v.length - 1));
  return v.slice(0, 3) + '•'.repeat(v.length - 5) + v.slice(-2);
}
export function maskName(n) { return String(n).split(' ').map(w => w[0] + '•'.repeat(Math.max(2, w.length - 1))).join(' '); }

let titleSeq = 0;
export function setTitle(t) {
  const text = t ? t + ' — ' + SITE.name : SITE.name + ' — Bayar Tagihan, Isi Pulsa, Top Up Game';
  document.title = text;
  /* Metadata Next.js bisa menimpa title sekali setelah hidrasi pada deep link. */
  const seq = ++titleSeq;
  [0, 120, 400, 1200].forEach(ms => setTimeout(() => {
    if (seq === titleSeq && document.title !== text) document.title = text;
  }, ms));
}

export function parseQuery(s) {
  const o = {}; new URLSearchParams(s || '').forEach((v, k) => { o[k] = v; }); return o;
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    try {
      const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok;
    } catch (e2) { return false; }
  }
}

/* Operator seluler dari awalan nomor. */
const OPERATORS = [
  ['Telkomsel', ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853']],
  ['Indosat', ['0814', '0815', '0816', '0855', '0856', '0857', '0858']],
  ['XL', ['0817', '0818', '0819', '0859', '0877', '0878']],
  ['Axis', ['0831', '0832', '0833', '0838']],
  ['Tri', ['0895', '0896', '0897', '0898', '0899']],
  ['Smartfren', ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889']]
];
export function normPhone(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('62')) d = '0' + d.slice(2);
  return d;
}
export function detectOperator(v) {
  const d = normPhone(v);
  if (d.length < 4) return '';
  const hit = OPERATORS.find(o => o[1].includes(d.slice(0, 4)));
  return hit ? hit[0] : '';
}

/* Validasi satu field berdasarkan definisi di data.js. Mengembalikan pesan error atau ''. */
export function validateField(f, raw) {
  const val = String(raw == null ? '' : raw).trim();
  if (!val) return f.type === 'select' ? `Pilih ${f.label.toLowerCase()}.` : `${f.label} wajib diisi.`;
  if (f.type === 'select') return f.options.includes(val) ? '' : `Pilihan ${f.label.toLowerCase()} tidak valid.`;
  if (f.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val) ? '' : 'Format email belum benar, contoh nama@email.com.';
  if (f.type === 'phone') {
    const d = normPhone(val);
    if (!/^08\d{8,11}$/.test(d)) return 'Nomor HP harus diawali 08 atau +62, panjang 10–13 digit.';
    if (f.operator && !detectOperator(d)) return 'Awalan nomor tidak dikenali sebagai operator seluler.';
    return '';
  }
  if (f.digits && !/^\d+$/.test(val)) return `${f.label} hanya boleh berisi angka.`;
  if (f.min && val.length < f.min) return `${f.label} minimal ${f.min} karakter.`;
  if (f.max && val.length > f.max) return `${f.label} maksimal ${f.max} karakter.`;
  if (f.pattern && !new RegExp(f.pattern).test(val)) return f.msg || `${f.label} belum sesuai format.`;
  return '';
}

export function statusClass(s) {
  return ({ 'Menunggu Pembayaran': 'warn', 'Diproses': 'info', 'Berhasil': 'ok', 'Gagal': 'bad', 'Dibatalkan': 'mute' })[s] || 'mute';
}
export function statusBadge(s) { return `<span class="badge badge--${statusClass(s)}">${esc(s)}</span>`; }

export function svcIconHTML(svc, cls) {
  if (svc.kind === 'game') return `<img class="${cls || 'svc-cover'}" src="${svc.cover}" alt="" width="64" height="64" loading="lazy">`;
  return `<span class="${cls || 'svc-ico'} svc-ico" style="--c:${svc.color};--ink:${svc.ink}">${ppobIcon(svc.icon)}</span>`;
}

