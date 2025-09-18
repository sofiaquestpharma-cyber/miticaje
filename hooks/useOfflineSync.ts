"use client"

import { useState, useEffect, useCallback } from "react"
import { offlineStorage } from "@/lib/offlineStorage"
import { ApiService } from "@/services/apiService"
import type { GeolocationData } from "@/hooks/useGeolocation"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncTime: Date | null
  syncError: string | null
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    syncError: null,
  })

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineStorage.getPendingCount()
      setSyncStatus((prev) => ({ ...prev, pendingCount: count }))
    } catch (error) {
      console.error("Error al obtener registros pendientes:", error)
    }
  }, [])

  const syncPendingRecords = useCallback(async () => {
    if (!navigator.onLine || syncStatus.isSyncing) return

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      const pendingRecords = await offlineStorage.getPendingSyncRecords()
      console.log(`Sincronizando ${pendingRecords.length} registros pendientes...`)

      let syncedCount = 0
      let errorCount = 0

      for (const record of pendingRecords) {
        try {
          // Convertir el registro offline al formato esperado por la API
          const location: GeolocationData | undefined = record.latitude
            ? {
                latitude: record.latitude,
                longitude: record.longitude!,
                accuracy: record.accuracy || 0,
                timestamp: new Date(record.location_timestamp || record.timestamp).getTime(),
                address: record.address,
              }
            : undefined

          await ApiService.createTimeRecord({
            employee_id: record.employee_id,
            action_type: record.action_type,
            timestamp: record.timestamp,
            location,
          })

          await offlineStorage.markRecordAsSynced(record.id)
          syncedCount++
          console.log(`Registro ${record.id} sincronizado exitosamente`)
        } catch (error) {
          console.error(`Error al sincronizar registro ${record.id}:`, error)
          await offlineStorage.updateSyncAttempt(record.id)
          errorCount++

          // Si hay muchos intentos fallidos, marcar como error
          if (record.sync_attempts >= 3) {
            console.warn(`Registro ${record.id} falló después de 3 intentos`)
          }
        }
      }

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        syncError: errorCount > 0 ? `${errorCount} registros no se pudieron sincronizar` : null,
      }))

      console.log(`Sincronización completada: ${syncedCount} exitosos, ${errorCount} errores`)
    } catch (error) {
      console.error("Error durante la sincronización:", error)
      setSyncStatus((prev) => ({
        ...prev,
        syncError: "Error durante la sincronización",
      }))
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }))
      await updatePendingCount()
    }
  }, [syncStatus.isSyncing, updatePendingCount])

  const saveOfflineRecord = useCallback(
    async (record: {
      employee_id: string
      action_type: "entrada" | "salida" | "inicio_pausa" | "fin_pausa"
      location?: GeolocationData
      work_center_id?: string
    }) => {
      try {
        const offlineRecord = {
          employee_id: record.employee_id,
          action_type: record.action_type,
          timestamp: new Date().toISOString(),
          latitude: record.location?.latitude,
          longitude: record.location?.longitude,
          accuracy: record.location?.accuracy,
          address: record.location?.address,
          location_timestamp: record.location ? new Date(record.location.timestamp).toISOString() : undefined,
          work_center_id: record.work_center_id,
        }

        const id = await offlineStorage.saveOfflineRecord(offlineRecord)
        await updatePendingCount()
        console.log(`Registro guardado offline con ID: ${id}`)
        return id
      } catch (error) {
        console.error("Error al guardar registro offline:", error)
        throw error
      }
    },
    [updatePendingCount],
  )

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }))
      // Sincronizar automáticamente al recuperar conexión
      setTimeout(syncPendingRecords, 1000)
    }

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [syncPendingRecords])

  // Inicializar y actualizar contador al montar
  useEffect(() => {
    offlineStorage.init().then(() => {
      updatePendingCount()
    })
  }, [updatePendingCount])

  // Sincronización periódica cuando está online
  useEffect(() => {
    if (!syncStatus.isOnline) return

    const interval = setInterval(() => {
      if (syncStatus.pendingCount > 0) {
        syncPendingRecords()
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [syncStatus.isOnline, syncStatus.pendingCount, syncPendingRecords])

  return {
    syncStatus,
    saveOfflineRecord,
    syncPendingRecords,
    updatePendingCount,
  }
}
