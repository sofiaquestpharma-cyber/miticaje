const CACHE_NAME = "miticaje-v1.0.0"
const urlsToCache = ["/", "/manifest.json", "/favicon.png", "/logo.png"]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Eliminando cache antiguo:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Interceptar peticiones de red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - devolver respuesta
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Verificar si recibimos una respuesta válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // IMPORTANTE: Clonar la respuesta
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Manejar notificaciones push (para futuras funcionalidades)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva notificación de MiTicaje",
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver detalles",
        icon: "/favicon.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/favicon.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("MiTicaje", options))
})

// Manejar clics en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
