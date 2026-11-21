import { $, $$, esc } from '../util';
import { ui } from '../icons';

/* js/ui/sheet.js */
/* sheet.js — dialog/bottom-sheet: focus-trap, Esc, kunci scroll, kembalikan fokus. */
export const Sheet = {
  _open: 0,
  FOCUSABLE: 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',

  /* opts: {title, body(html), actions:[{label,value,kind}], variant, label, onMount(el, close)} → Promise<value|undefined> */
  show(opts) {
    return new Promise(resolve => {
      const prev = document.activeElement;
      const ov = document.createElement('div');
      ov.className = 'sheet-ov' + (opts.variant ? ' sheet-ov--' + opts.variant : '');
      const tid = 'sh-' + Math.random().toString(36).slice(2, 7);
      const acts = (opts.actions || []).map((a, i) => `<button type="button" class="btn btn--${a.kind || 'ghost'}" data-i="${i}">${esc(a.label)}</button>`).join('');
      ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" ${opts.title ? `aria-labelledby="${tid}"` : `aria-label="${esc(opts.label || 'Dialog')}"`}>
        ${opts.title ? `<div class="sheet__head"><h2 id="${tid}">${esc(opts.title)}</h2><button type="button" class="icon-btn" data-close aria-label="Tutup">${ui('x')}</button></div>` : ''}
        <div class="sheet__body">${opts.body || ''}</div>
        ${acts ? `<div class="sheet__foot">${acts}</div>` : ''}</div>`;
      $('#sheet-root').appendChild(ov);
      const dlg = $('.sheet', ov);
      if (this._open++ === 0) document.body.classList.add('lock');
      let done = false;
      const close = val => {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey, true);
        ov.classList.remove('is-open');
        setTimeout(() => ov.remove(), 200);
        if (--this._open === 0) document.body.classList.remove('lock');
        if (prev && prev.focus && document.contains(prev)) prev.focus();
        resolve(val);
      };
      const onKey = e => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(undefined); return; }
        if (e.key !== 'Tab') return;
        const f = $$(this.FOCUSABLE, dlg).filter(x => x.offsetParent !== null);
        if (!f.length) { e.preventDefault(); return; }
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!dlg.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', onKey, true);
      ov.addEventListener('mousedown', e => { if (e.target === ov) close(undefined); });
      ov.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) return close(undefined);
        const b = e.target.closest('[data-i]');
        if (b) close(opts.actions[+b.dataset.i].value);
      });
      if (opts.onMount) opts.onMount(dlg, close);
      /* setTimeout, bukan requestAnimationFrame (rAF terjeda di tab latar) */
      setTimeout(() => {
        ov.classList.add('is-open');
        const auto = $('[data-autofocus]', dlg) || $$(this.FOCUSABLE, dlg).filter(x => !x.hasAttribute('data-close'))[0] || $('[data-close]', dlg) || dlg;
        if (auto === dlg) dlg.setAttribute('tabindex', '-1');
        auto.focus();
      }, 10);
    });
  },

  confirm({ title, message, ok, cancel, danger }) {
    return this.show({
      title, body: `<p class="sheet__msg">${esc(message)}</p>`,
      actions: [{ label: cancel || 'Batal', value: false, kind: 'ghost' }, { label: ok || 'Ya', value: true, kind: danger ? 'danger' : 'accent' }]
    }).then(v => v === true);
  }
};

