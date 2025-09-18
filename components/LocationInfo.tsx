"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, RefreshCw, AlertTriangle, CheckCircle, Tablet } from "lucide-react"
import { useGeolocation, type GeolocationData } from "@/hooks/useGeolocation"

interface LocationInfoProps {
  onLocationUpdate?: (location: GeolocationData | null) => void
  showRefreshButton?: boolean
  compact?: boolean
}

export default function LocationInfo({
  onLocationUpdate,
  showRefreshButton = true,
  compact = false,
}: LocationInfoProps) {
  const { location, error, loading, isSupported, isTablet, getCurrentLocation } = useGeolocation()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (location) {
      setLastUpdate(new Date())
      onLocationUpdate?.(location)
    }
  }, [location, onLocationUpdate])

  useEffect(() => {
    if (error) {
      onLocationUpdate?.(null)
    }
  }, [error, onLocationUpdate])

  const handleRefreshLocation = async () => {
    try {
      await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: isTablet ? 30000 : 15000, // Más tiempo para tablets
        maximumAge: 0, // Forzar nueva lectura
      })
    } catch (err) {
      console.error("Error al actualizar ubicación:", err)
    }
  }

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 10) return "Muy alta"
    if (accuracy < 50) return "Alta"
    if (accuracy < 100) return "Media"
    return "Baja"
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 10) return "text-green-600 bg-green-50 border-green-200"
    if (accuracy < 50) return "text-blue-600 bg-blue-50 border-blue-200"
    if (accuracy < 100) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  if (!isSupported) {
    return (
      <Card className={compact ? "border-amber-200 bg-amber-50" : ""}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Geolocalización no disponible</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Indicador de dispositivo tablet */}
        {isTablet && (
          <div className="flex items-center gap-2 text-blue-600">
            <Tablet className="h-4 w-4" />
            <span className="text-xs font-medium">Tablet detectada</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              {isTablet ? "Obteniendo ubicación (puede tardar más en tablet)..." : "Obteniendo ubicación..."}
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{error.message}</span>
            </div>
            {isTablet && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                💡 <strong>Consejo para tablet:</strong> Asegúrate de que los permisos de ubicación estén activados en
                la configuración del navegador.
              </div>
            )}
          </div>
        )}

        {location && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Ubicación obtenida</span>
              {isTablet && <Tablet className="h-3 w-3" />}
            </div>
            <div className="text-xs text-gray-600">
              <p className="truncate">
                {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </p>
              <p>
                Precisión: {formatAccuracy(location.accuracy)} ({location.accuracy.toFixed(0)}m)
              </p>
            </div>
          </div>
        )}

        {showRefreshButton && (
          <Button
            onClick={handleRefreshLocation}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {loading ? (isTablet ? "Obteniendo (tablet)..." : "Obteniendo...") : "Actualizar Ubicación"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-primary-500" />
          Información de Ubicación
          {isTablet && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
              <Tablet className="h-3 w-3 mr-1" />
              Tablet
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              {isTablet
                ? "Obteniendo ubicación precisa (puede tardar más en tablet)..."
                : "Obteniendo ubicación precisa..."}
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Error de Ubicación</span>
              </div>
              <p className="text-sm text-red-600">{error.message}</p>
            </div>

            {isTablet && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Tablet className="h-4 w-4" />
                  <span className="font-medium text-sm">Solución para Tablet</span>
                </div>
                <div className="text-sm text-amber-600 space-y-1">
                  <p>• Verifica que los permisos de ubicación estén activados</p>
                  <p>• Asegúrate de tener conexión a internet</p>
                  <p>• Intenta reiniciar la aplicación</p>
                  <p>• Comprueba la configuración de privacidad del navegador</p>
                </div>
              </div>
            )}
          </div>
        )}

        {location && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Ubicación Confirmada</span>
                {isTablet && <Tablet className="h-4 w-4" />}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Dirección:</span>
                  <p className="text-gray-600 mt-1">{location.address || "Dirección no disponible"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Latitud:</span>
                    <p className="font-mono text-gray-600">{location.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Longitud:</span>
                    <p className="font-mono text-gray-600">{location.longitude.toFixed(6)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 text-xs">Precisión:</span>
                  <Badge variant="outline" className={`text-xs ${getAccuracyColor(location.accuracy)}`}>
                    {formatAccuracy(location.accuracy)} ({location.accuracy.toFixed(0)}m)
                  </Badge>
                </div>

                {lastUpdate && (
                  <div className="text-xs text-gray-500">Actualizado: {lastUpdate.toLocaleTimeString("es-ES")}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showRefreshButton && (
          <Button onClick={handleRefreshLocation} disabled={loading} variant="outline" className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            {loading
              ? isTablet
                ? "Obteniendo Ubicación (Tablet)..."
                : "Obteniendo Ubicación..."
              : "Actualizar Ubicación"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
