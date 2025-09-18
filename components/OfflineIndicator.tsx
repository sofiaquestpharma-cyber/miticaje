"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useOfflineSync } from "@/hooks/useOfflineSync"

interface OfflineIndicatorProps {
  compact?: boolean
}

export default function OfflineIndicator({ compact = false }: OfflineIndicatorProps) {
  const { syncStatus, syncPendingRecords } = useOfflineSync()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs ${
            syncStatus.isOnline
              ? "border-green-200 text-green-700 bg-green-50"
              : "border-red-200 text-red-700 bg-red-50"
          }`}
        >
          {syncStatus.isOnline ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">En línea</span>
              <span className="sm:hidden">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Sin conexión</span>
              <span className="sm:hidden">Offline</span>
            </>
          )}
        </Badge>

        {syncStatus.pendingCount > 0 && (
          <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            {syncStatus.pendingCount} pendientes
          </Badge>
        )}

        {syncStatus.isSyncing && (
          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Sincronizando
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="border-l-4 border-l-primary-400">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold text-elegant-900">
                {syncStatus.isOnline ? "Conectado" : "Modo Offline"}
              </span>
            </div>
            {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
              <Button
                onClick={syncPendingRecords}
                disabled={syncStatus.isSyncing}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {syncStatus.isSyncing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Sincronizando
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sincronizar
                  </>
                )}
              </Button>
            )}
          </div>

          {!syncStatus.isOnline && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Trabajando sin conexión</span>
              </div>
              <p className="text-xs text-amber-600">
                Los fichajes se guardan localmente y se sincronizarán automáticamente al recuperar la conexión.
              </p>
            </div>
          )}

          {syncStatus.pendingCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {syncStatus.pendingCount} fichaje{syncStatus.pendingCount > 1 ? "s" : ""} pendiente
                  {syncStatus.pendingCount > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                {syncStatus.isOnline
                  ? "Se sincronizarán automáticamente en breve"
                  : "Se sincronizarán al recuperar la conexión"}
              </p>
            </div>
          )}

          {syncStatus.lastSyncTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Última sincronización</span>
              </div>
              <p className="text-xs text-green-600">{syncStatus.lastSyncTime.toLocaleString("es-ES")}</p>
            </div>
          )}

          {syncStatus.syncError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium text-sm">Error de sincronización</span>
              </div>
              <p className="text-xs text-red-600">{syncStatus.syncError}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
