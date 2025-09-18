"use client"

import { useState, useEffect, useCallback } from "react"

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
}

export interface GeolocationError {
  code: number
  message: string
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationData | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported("geolocation" in navigator)
  }, [])

  // Detectar si es tablet
  const isTablet = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isTabletUA = /tablet|ipad|playbook|silk/i.test(userAgent)
    const isLargeScreen = window.screen.width >= 768 && window.screen.width <= 1024
    const isTouchDevice = "ontouchstart" in window

    return isTabletUA || (isLargeScreen && isTouchDevice)
  }, [])

  const getCurrentLocation = useCallback(
    (options?: PositionOptions): Promise<GeolocationData> => {
      return new Promise((resolve, reject) => {
        if (!isSupported) {
          const error = { code: 0, message: "Geolocalización no soportada en este dispositivo" }
          setError(error)
          reject(error)
          return
        }

        setLoading(true)
        setError(null)

        // Configuración especial para tablets
        const tabletOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 30000, // Más tiempo para tablets
          maximumAge: 300000, // Cache más largo para tablets (5 minutos)
        }

        const mobileOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000, // Cache por 1 minuto
        }

        const finalOptions = {
          ...(isTablet() ? tabletOptions : mobileOptions),
          ...options,
        }

        console.log(`Solicitando ubicación - Dispositivo: ${isTablet() ? "Tablet" : "Otro"}, Opciones:`, finalOptions)

        // Para tablets, intentar múltiples veces si falla
        const attemptGeolocation = (attempt = 1) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              console.log(`Ubicación obtenida en intento ${attempt}:`, position)

              const locationData: GeolocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              }

              // Intentar obtener la dirección usando reverse geocoding
              try {
                const address = await reverseGeocode(locationData.latitude, locationData.longitude)
                locationData.address = address
              } catch (geocodeError) {
                console.log("No se pudo obtener la dirección:", geocodeError)
              }

              setLocation(locationData)
              setLoading(false)
              resolve(locationData)
            },
            (error) => {
              console.error(`Error en intento ${attempt}:`, error)

              // Para tablets, reintentar hasta 3 veces
              if (isTablet() && attempt < 3) {
                console.log(`Reintentando geolocalización en tablet (intento ${attempt + 1}/3)`)
                setTimeout(() => attemptGeolocation(attempt + 1), 2000)
                return
              }

              const geolocationError: GeolocationError = {
                code: error.code,
                message: getGeolocationErrorMessage(error.code, isTablet()),
              }
              setError(geolocationError)
              setLoading(false)
              reject(geolocationError)
            },
            finalOptions,
          )
        }

        attemptGeolocation()
      })
    },
    [isSupported, isTablet],
  )

  const watchLocation = useCallback(
    (callback: (location: GeolocationData) => void, options?: PositionOptions) => {
      if (!isSupported) return null

      // Configuración especial para tablets
      const tabletOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 120000, // Cache más largo para tablets
      }

      const mobileOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }

      const finalOptions = {
        ...(isTablet() ? tabletOptions : mobileOptions),
        ...options,
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          try {
            const address = await reverseGeocode(locationData.latitude, locationData.longitude)
            locationData.address = address
          } catch (geocodeError) {
            console.log("No se pudo obtener la dirección:", geocodeError)
          }

          setLocation(locationData)
          callback(locationData)
        },
        (error) => {
          const geolocationError: GeolocationError = {
            code: error.code,
            message: getGeolocationErrorMessage(error.code, isTablet()),
          }
          setError(geolocationError)
        },
        finalOptions,
      )

      return watchId
    },
    [isSupported, isTablet],
  )

  const clearWatch = useCallback(
    (watchId: number) => {
      if (isSupported) {
        navigator.geolocation.clearWatch(watchId)
      }
    },
    [isSupported],
  )

  return {
    location,
    error,
    loading,
    isSupported,
    isTablet: isTablet(),
    getCurrentLocation,
    watchLocation,
    clearWatch,
  }
}

// Función para reverse geocoding usando una API gratuita
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Usando Nominatim (OpenStreetMap) - API gratuita
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MiTicaje-App/1.0",
        },
      },
    )

    if (!response.ok) throw new Error("Error en la respuesta de geocoding")

    const data = await response.json()
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    // Fallback: devolver coordenadas
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

function getGeolocationErrorMessage(code: number, isTablet: boolean): string {
  const tabletSuffix = isTablet ? " (Tablet detectada - verifica permisos de ubicación)" : ""

  switch (code) {
    case 1:
      return `Acceso a la ubicación denegado por el usuario${tabletSuffix}`
    case 2:
      return `Ubicación no disponible${tabletSuffix}`
    case 3:
      return `Tiempo de espera agotado al obtener la ubicación${tabletSuffix}`
    default:
      return `Error desconocido al obtener la ubicación${tabletSuffix}`
  }
}
