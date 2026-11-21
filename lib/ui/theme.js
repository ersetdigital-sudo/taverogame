import { Store } from '../store';
import { $$ } from '../util';
import { ui } from '../icons';
import { Toast } from './toast';

/* js/ui/theme.js */
/* theme.js — terang / gelap / ikut sistem */
export const Theme = {
  KEY: 'tv.theme', ORDER: ['light', 'dark', 'system'], LABEL: { light: 'Terang', dark: 'Gelap', system: 'Ikut sistem' },
  mq: null,
  get() { const m = Store.get(this.KEY, 'system'); return this.ORDER.includes(m) ? m : 'system'; },
  apply() {
    const m = this.get();
    const dark = m === 'dark' || (m === 'system' && this.mq && this.mq.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute('content', dark ? '#070B16' : '#F4F6FB');
    $$('[data-theme-btn]').forEach(b => {
      b.innerHTML = ui(m === 'light' ? 'sun' : m === 'dark' ? 'moon' : 'auto');
      b.setAttribute('aria-label', 'Tema: ' + this.LABEL[m] + '. Ketuk untuk mengganti.');
      b.title = 'Tema: ' + this.LABEL[m];
    });
  },
  cycle() {
    const m = this.get(); const n = this.ORDER[(this.ORDER.indexOf(m) + 1) % 3];
    Store.set(this.KEY, n); this.apply(); Toast.show('Tema: ' + this.LABEL[n]);
  },
  init() {
    this.mq = window.matchMedia('(prefers-color-scheme: dark)');
    this.apply();
    const h = () => { if (this.get() === 'system') this.apply(); };
    this.mq.addEventListener ? this.mq.addEventListener('change', h) : this.mq.addListener(h);
    document.addEventListener('click', e => { if (e.target.closest('[data-theme-btn]')) this.cycle(); });
  }
};

