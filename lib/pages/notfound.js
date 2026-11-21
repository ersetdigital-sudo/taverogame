import { setTitle } from '../util';
import { ui } from '../icons';

export function PageNotFound(view) {
  setTitle('Halaman tidak ditemukan');
  view.innerHTML = `<div class="wrap empty"><div class="empty__ico">${ui('search', 32)}</div><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p><div class="empty__act"><a class="btn btn--accent" href="#/">Ke Beranda</a><a class="btn btn--ghost" href="#/bayar">Lihat Layanan</a></div></div>`;
}
