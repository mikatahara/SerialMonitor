// sw.js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './main.js',        // JS
        './icons/icon-192.png',
        './icons/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

window.addEventListener("DOMContentLoaded", () => {
  // スタンドアロンモード（PWA）かどうかを確認
  if (matchMedia("(display-mode: standalone)").matches) {
    window.resizeTo(1024, 768); // 幅1024px、高さ768pxに設定
  }
});
