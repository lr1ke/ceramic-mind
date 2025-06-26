self.addEventListener("install", () => self.skipWaiting())

// 2. Activate - control all clients
self.addEventListener("activate", (evt) => evt.waitUntil(self.clients.claim()))

// 3. No runtime caching; extend later if you need offline support.
