export async function GET() {
  const swCode = `
// v0 Service Worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic fetch handler
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
  return;
});
`

  return new Response(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  })
}
