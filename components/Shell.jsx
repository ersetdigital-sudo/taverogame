'use client';

import { useEffect } from 'react';
import { boot } from '@/lib/app';

export default function Shell() {
  useEffect(() => {
    boot();
  }, []);

  return (
    <>
      <a className="skip" id="skip" href="#view">Lewati ke konten</a>
      <div className="shell">
        <div className="col">
          <header className="topbar" id="topbar"></header>
          <main id="view" tabIndex={-1}></main>
          <footer className="site-footer" id="site-footer"></footer>
        </div>
      </div>
      <nav className="tabbar" id="tabbar" aria-label="Menu bawah"></nav>
      <div id="toasts" className="toasts" aria-live="polite"></div>
      <div id="sheet-root"></div>
      <noscript>
        <p style={{ padding: 24, fontFamily: 'sans-serif' }}>
          Situs ini membutuhkan JavaScript agar dapat dipakai.
        </p>
      </noscript>
    </>
  );
}
