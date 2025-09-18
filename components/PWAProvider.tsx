"use client"

import type React from "react"

import { useEffect } from "react"

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verificar si estamos en un entorno que soporta PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      console.log("PWA features available")
    }
  }, [])

  return <>{children}</>
}
