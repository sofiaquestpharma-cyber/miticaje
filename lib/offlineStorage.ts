"use client"

interface OfflineTimeRecord {
  id: string
  employee_id: string
  action_type: "entrada" | "salida" | "inicio_pausa" | "fin_pausa"
  timestamp: string
  latitude?: number
  longitude?: number
  accuracy?: number
  address?: string
  location_timestamp?: string
  location_error?: string
  work_center_id?: string
  created_offline: boolean
  sync_attempts: number
  last_sync_attempt?: string
}

class OfflineStorageManager {
  private dbName = "MiTicajeOfflineDB"
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB no soportado"))
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store para fichajes offline
        if (!db.objectStoreNames.contains("timeRecords")) {
          const timeRecordsStore = db.createObjectStore("timeRecords", { keyPath: "id" })
          timeRecordsStore.createIndex("employee_id", "employee_id", { unique: false })
          timeRecordsStore.createIndex("timestamp", "timestamp", { unique: false })
          timeRecordsStore.createIndex("sync_status", "created_offline", { unique: false })
        }

        // Store para configuración offline
        if (!db.objectStoreNames.contains("config")) {
          db.createObjectStore("config", { keyPath: "key" })
        }
      }
    })
  }

  async saveOfflineRecord(
    record: Omit<OfflineTimeRecord, "id" | "created_offline" | "sync_attempts">,
  ): Promise<string> {
    if (!this.db) await this.init()

    const offlineRecord: OfflineTimeRecord = {
      ...record,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_offline: true,
      sync_attempts: 0,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["timeRecords"], "readwrite")
      const store = transaction.objectStore("timeRecords")
      const request = store.add(offlineRecord)

      request.onsuccess = () => resolve(offlineRecord.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineRecords(): Promise<OfflineTimeRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["timeRecords"], "readonly")
      const store = transaction.objectStore("timeRecords")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSyncRecords(): Promise<OfflineTimeRecord[]> {
    const allRecords = await this.getOfflineRecords()
    return allRecords.filter((record) => record.created_offline)
  }

  async markRecordAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["timeRecords"], "readwrite")
      const store = transaction.objectStore("timeRecords")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async updateSyncAttempt(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["timeRecords"], "readwrite")
      const store = transaction.objectStore("timeRecords")
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const record = getRequest.result
        if (record) {
          record.sync_attempts += 1
          record.last_sync_attempt = new Date().toISOString()
          const putRequest = store.put(record)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSyncedRecords(): Promise<void> {
    if (!this.db) await this.init()

    const records = await this.getOfflineRecords()
    const syncedRecords = records.filter((record) => !record.created_offline)

    for (const record of syncedRecords) {
      await this.markRecordAsSynced(record.id)
    }
  }

  async getRecordCount(): Promise<number> {
    const records = await this.getOfflineRecords()
    return records.length
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingSyncRecords()
    return pending.length
  }
}

export const offlineStorage = new OfflineStorageManager()
