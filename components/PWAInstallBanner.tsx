"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"
import { usePWA } from "@/hooks/usePWA"

export default function PWAInstallBanner() {
  const { isInstallable, installApp } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  // Verificar si el usuario ya dismisseó el banner anteriormente
  useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed")
    if (wasDismissed) {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    // Mostrar el banner después de un pequeño delay para mejor UX
    const timer = setTimeout(() => {
      setShowBanner(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // No mostrar si no es instalable, está dismissed, o aún no debe mostrarse
  if (!isInstallable || isDismissed || !showBanner) {
    return null
  }

  const handleInstall = async () => {
    try {
      await installApp()
    } catch (error) {
      console.log("Error al instalar:", error)
      setIsDismissed(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Recordar que el usuario dismisseó el banner
    localStorage.setItem("pwa-banner-dismissed", "true")
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-2xl border-primary-200 bg-white/95 backdrop-blur-sm md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary-500 p-2 rounded-full flex-shrink-0">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-elegant-900 text-sm">Instalar MiTicaje</h3>
            <p className="text-xs text-elegant-700 mt-1">
              Instala la app para acceso rápido desde tu pantalla de inicio
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600 text-white text-xs h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-elegant-600 hover:text-elegant-900 text-xs h-8"
              >
                Ahora no
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-elegant-600 hover:text-elegant-900 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
