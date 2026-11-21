import './globals.css';

export const metadata = {
  title: 'Tavero Games — Top Up Game, Pulsa & Tagihan',
  description:
    'Isi pulsa, bayar tagihan, beli token PLN, saldo e-wallet, voucher digital, dan top up game di Tavero Games.',
  openGraph: {
    type: 'website',
    siteName: 'Tavero Games',
    title: 'Tavero Games — Top Up Game, Pulsa & Tagihan',
    description:
      'Pulsa, tagihan, token listrik, e-wallet, voucher digital, dan top up game dalam satu tempat.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const THEME_INIT = `(function () {
  try {
    var m = 'system';
    var raw = localStorage.getItem('tv.theme');
    if (raw) m = JSON.parse(raw);
    var dark = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F4F6FB" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iNiIgeTE9IjQiIHgyPSI0NCIgeTI9IjQ2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzVCNzlGRiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzIyMzZDOSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgcng9IjE0IiBmaWxsPSJ1cmwoI2cpIi8+PHBhdGggZD0iTTExIDEzaDI2djhIMjl2MTRhNCA0IDAgMCAxLTQgNGgtMmE0IDQgMCAwIDEtNC00VjIxaC04eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zMyAyOWw1IDUtNSA1eiIgZmlsbD0iI0M2RjI0RSIvPjwvc3ZnPg==" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
