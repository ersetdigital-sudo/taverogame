import { $, $$, parseQuery, setTitle } from './util';
import { PageHome } from './pages/home';
import { PageGames, PagePpob } from './pages/catalog';
import { PageService } from './pages/service';
import { PageTxList, PageTxDetail } from './pages/transaksi';
import { PageHelp } from './pages/help';
import { PageNotFound } from './pages/notfound';

/* js/router.js */
/* router.js — router hash. Tiap halaman: fn(view, params, query) → (opsional) fungsi cleanup. */
export const Router = {
  cleanup: null,
  routes: [
    { re: /^\/$/, nav: 'home', title: '', fn: v => PageHome(v) },
    { re: /^\/bayar$/, nav: 'bayar', title: 'Tagihan & Pulsa', fn: v => PagePpob(v) },
    { re: /^\/bayar\/([\w-]+)$/, nav: 'bayar', checkout: true, fn: (v, p, q) => PageService(v, 'ppob', p[0], q) },
    { re: /^\/topup$/, nav: 'topup', title: 'Top Up Game', fn: v => PageGames(v) },
    { re: /^\/topup\/([\w-]+)$/, nav: 'topup', checkout: true, fn: (v, p, q) => PageService(v, 'game', p[0], q) },
    { re: /^\/pesanan$/, nav: 'pesanan', title: 'Pesanan', fn: (v, p, q) => PageTxList(v, q) },
    { re: /^\/pesanan\/([\w-]+)$/, nav: 'pesanan', detail: true, title: 'Detail Pesanan', fn: (v, p) => PageTxDetail(v, p[0]) },
    { re: /^\/bantuan(?:\/(\w+))?$/, nav: 'help', title: 'Bantuan', fn: (v, p) => PageHelp(v, p[0]) }
  ],

  parse() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = raw.split('?');
    return { path: path.replace(/(.)\/$/, '$1') || '/', query: parseQuery(qs) };
  },

  go() {
    const { path, query } = this.parse();
    if (typeof this.cleanup === 'function') { try { this.cleanup(); } catch (e) { console.error(e); } }
    this.cleanup = null;
    const old = $('#view');
    const view = old.cloneNode(false);   // buang semua listener lama
    old.replaceWith(view);
    let route = null, params = [];
    for (const r of this.routes) { const m = path.match(r.re); if (m) { route = r; params = m.slice(1); break; } }
    document.body.classList.toggle('is-checkout', !!(route && route.checkout));
    document.body.classList.toggle('is-detail', !!(route && route.detail));
    setTitle(route ? route.title : 'Halaman tidak ditemukan');
    this.markNav(route ? route.nav : '');
    view.classList.add('page-in');
    try {
      this.cleanup = route ? route.fn(view, params, query) : PageNotFound(view);
    } catch (e) {
      console.error(e);
      view.innerHTML = '<div class="wrap empty"><h1>Terjadi kendala</h1><p>Halaman gagal dimuat. Muat ulang atau kembali ke beranda.</p><a class="btn btn--accent" href="#/">Ke Beranda</a></div>';
    }
    window.scrollTo(0, 0);
  },

  markNav(key) {
    $$('[data-nav]').forEach(a => {
      const on = a.dataset.nav === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  },

  start() {
    window.addEventListener('hashchange', () => this.go());
    this.go();
  }
};


