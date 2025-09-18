"use client"

import { useEffect, useState } from "react"

export function useDeviceOrientation() {
  const [isTablet, setIsTablet] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    // Detectar si es tablet
    const detectTablet = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isTabletUA = /tablet|ipad|playbook|silk/i.test(userAgent)
      const isLargeScreen = window.screen.width >= 768 && window.screen.width <= 1024
      const isTouchDevice = "ontouchstart" in window

      return isTabletUA || (isLargeScreen && isTouchDevice)
    }

    const updateOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setOrientation(isLandscape ? "landscape" : "portrait")
    }

    const tablet = detectTablet()
    setIsTablet(tablet)
    updateOrientation()

    // Solo para tablets, permitir rotación libre
    if (tablet) {
      // Remover restricciones de orientación para tablets
      if ("screen" in window && "orientation" in window.screen) {
        try {
          // Intentar desbloquear orientación en tablets
          if ("unlock" in window.screen.orientation) {
            window.screen.orientation.unlock().catch(() => {
              console.log("No se pudo desbloquear la orientación automáticamente")
            })
          }
        } catch (error) {
          console.log("API de orientación no disponible")
        }
      }
    }

    // Escuchar cambios de orientación
    const handleOrientationChange = () => {
      updateOrientation()
    }

    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  return {
    isTablet,
    orientation,
    allowRotation: isTablet, // Solo tablets pueden rotar
  }
}
