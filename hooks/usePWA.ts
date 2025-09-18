"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    // Registrar Service Worker con manejo de errores mejorado
    const registerSW = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // Usar el service worker estático en lugar de blob
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("Service Worker registrado exitosamente:", registration)
        } catch (error) {
          console.log("Service Worker no se pudo registrar:", error)
          // No mostrar error al usuario, simplemente continuar sin SW
        }
      }
    }

    // Manejar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Manejar cambios de conectividad
    const handleOnline = () => setIsOnline(navigator.onLine)
    const handleOffline = () => setIsOnline(navigator.onLine)

    // Inicializar estado de conexión
    setIsOnline(navigator.onLine)

    checkIfInstalled()
    registerSW()

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setIsInstallable(false)
        setIsInstalled(true)
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.log("Error durante la instalación:", error)
    }
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
  }
}
