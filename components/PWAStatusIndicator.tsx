import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Clock, RefreshCw } from "lucide-react"
import { useOfflineSync } from "@/hooks/useOfflineSync"

export default function PWAStatusIndicator() {
  const { syncStatus } = useOfflineSync()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        variant="outline"
        className={`text-xs ${
          syncStatus.isOnline ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"
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
