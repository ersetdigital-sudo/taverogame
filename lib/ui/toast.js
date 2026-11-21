import { $, esc } from '../util';
import { ui } from '../icons';

/* js/ui/toast.js */
/* toast.js */
export const Toast = {
  show(msg, type) {
    const box = $('#toasts'); if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast toast--' + (type || 'ok');
    t.innerHTML = (type === 'err' ? ui('alert', 18) : ui('check', 18)) + '<span>' + esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(() => t.classList.add('is-in'), 10);
    setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 250); }, 3200);
  }
};

