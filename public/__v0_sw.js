self.addEventListener("install", () => self.skipWaiting())

/* Take control of existing clients */
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))

// -- No caching logic; extend if you later need offline support --
