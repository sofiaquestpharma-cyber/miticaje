import { supabase } from "@/lib/supabase"
import type { Employee, TimeRecord, AppSetting, EmployeeStats, AuthorizedLocation, WorkCenter } from "@/lib/supabase"
import type { GeolocationData } from "@/hooks/useGeolocation"

// Extender la interfaz EmployeeStats para incluir centro de trabajo
interface ExtendedEmployeeStats extends EmployeeStats {
  work_center_id?: string
  work_center_name?: string
}

export class ApiService {
  // Empleados
  static async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        work_centers (
          id,
          name,
          city
        )
      `)
      .order("name")

    if (error) throw error
    return data || []
  }

  static async createEmployee(employee: Omit<Employee, "id" | "created_at" | "updated_at">): Promise<Employee> {
    const { data, error } = await supabase.from("employees").insert(employee).select().single()

    if (error) throw error
    return data
  }

  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from("employees")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Centros de trabajo
  static async getWorkCenters(): Promise<WorkCenter[]> {
    const { data, error } = await supabase.from("work_centers").select("*").order("name")

    if (error) throw error
    return data || []
  }

  static async createWorkCenter(center: Omit<WorkCenter, "id" | "created_at" | "updated_at">): Promise<WorkCenter> {
    const { data, error } = await supabase.from("work_centers").insert(center).select().single()

    if (error) throw error
    return data
  }

  static async updateWorkCenter(id: string, updates: Partial<WorkCenter>): Promise<WorkCenter> {
    const { data, error } = await supabase
      .from("work_centers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Registros de tiempo con geolocalización automática
  static async getTimeRecords(filters?: {
    employeeId?: string
    startDate?: string
    endDate?: string
    actionType?: string
    workCenterId?: string
  }): Promise<TimeRecord[]> {
    console.log("Obteniendo registros con filtros:", filters)

    let query = supabase
      .from("time_records")
      .select(`
        *,
        employees (
          id,
          employee_id_internal,
          name
        ),
        work_centers (
          id,
          name,
          city
        )
      `)
      .order("created_at", { ascending: false })

    if (filters?.employeeId) {
      query = query.eq("employee_id", filters.employeeId)
    }

    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate)
    }

    if (filters?.actionType) {
      query = query.eq("action_type", filters.actionType)
    }

    if (filters?.workCenterId) {
      query = query.eq("work_center_id", filters.workCenterId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al obtener registros:", error)
      throw error
    }

    console.log("Registros obtenidos:", data?.length || 0)
    return data || []
  }

  // Crear registro con captura automática de ubicación
  static async createTimeRecordWithLocation(record: {
    employee_id: string
    action_type: "entrada" | "salida" | "inicio_pausa" | "fin_pausa"
    admin_justification?: string
    work_center_id?: string
  }): Promise<TimeRecord> {
    console.log("Creando registro con captura automática de ubicación:", record)

    const timestamp = new Date().toISOString()

    const recordData: any = {
      employee_id: record.employee_id,
      action_type: record.action_type,
      timestamp: timestamp,
      admin_justification: record.admin_justification || null,
      is_edited_by_admin: !!record.admin_justification,
      work_center_id: record.work_center_id,
    }

    // Intentar obtener ubicación automáticamente
    try {
      const location = await this.getCurrentLocation()
      if (location) {
        recordData.latitude = location.latitude
        recordData.longitude = location.longitude
        recordData.accuracy = location.accuracy
        recordData.address = location.address
        recordData.location_timestamp = new Date(location.timestamp).toISOString()
        console.log("Ubicación capturada automáticamente:", location)
      }
    } catch (error) {
      console.log("No se pudo obtener ubicación automáticamente:", error)
      recordData.location_error = "No se pudo obtener ubicación"
    }

    const { data, error } = await supabase
      .from("time_records")
      .insert(recordData)
      .select(`
        *,
        employees (
          id,
          employee_id_internal,
          name
        ),
        work_centers (
          id,
          name,
          city
        )
      `)
      .single()

    if (error) {
      console.error("Error al crear registro:", error)
      throw error
    }

    console.log("Registro creado exitosamente:", data)
    return data
  }

  // Función para obtener ubicación actual de forma automática
  private static getCurrentLocation(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          // Intentar obtener la dirección
          try {
            const address = await this.reverseGeocode(locationData.latitude, locationData.longitude)
            locationData.address = address
          } catch (geocodeError) {
            console.log("No se pudo obtener la dirección:", geocodeError)
          }

          resolve(locationData)
        },
        (error) => {
          reject(new Error(`Error de geolocalización: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache por 1 minuto
        },
      )
    })
  }

  // Reverse geocoding simplificado
  private static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
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
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  static async createTimeRecord(record: {
    employee_id: string
    action_type: "entrada" | "salida" | "inicio_pausa" | "fin_pausa"
    timestamp: string
    admin_justification?: string
    location?: GeolocationData
    work_center_id?: string
  }): Promise<TimeRecord> {
    console.log("Creando registro con ubicación:", record)

    const recordData: any = {
      employee_id: record.employee_id,
      action_type: record.action_type,
      timestamp: record.timestamp,
      admin_justification: record.admin_justification || null,
      is_edited_by_admin: !!record.admin_justification,
      work_center_id: record.work_center_id,
    }

    // Añadir datos de geolocalización si están disponibles
    if (record.location) {
      recordData.latitude = record.location.latitude
      recordData.longitude = record.location.longitude
      recordData.accuracy = record.location.accuracy
      recordData.address = record.location.address
      recordData.location_timestamp = new Date(record.location.timestamp).toISOString()
    }

    const { data, error } = await supabase
      .from("time_records")
      .insert(recordData)
      .select(`
        *,
        employees (
          id,
          employee_id_internal,
          name
        ),
        work_centers (
          id,
          name,
          city
        )
      `)
      .single()

    if (error) {
      console.error("Error al crear registro:", error)
      throw error
    }

    console.log("Registro creado exitosamente:", data)
    return data
  }

  static async updateTimeRecord(
    id: string,
    updates: Partial<TimeRecord>,
    adminJustification: string,
    adminId: string,
  ): Promise<TimeRecord> {
    const { data, error } = await supabase
      .from("time_records")
      .update({
        ...updates,
        is_edited_by_admin: true,
        admin_justification: adminJustification,
        admin_editor_id: adminId,
        edit_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Ubicaciones autorizadas (mantenemos para admin pero no las usamos para validación)
  static async getAuthorizedLocations(): Promise<AuthorizedLocation[]> {
    try {
      const { data, error } = await supabase
        .from("authorized_locations")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error al obtener ubicaciones autorizadas:", error)
        if (error.message.includes("does not exist")) {
          console.log("Tabla authorized_locations no existe, devolviendo array vacío")
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error en getAuthorizedLocations:", error)
      return []
    }
  }

  static async createAuthorizedLocation(
    location: Omit<AuthorizedLocation, "id" | "created_at" | "updated_at">,
  ): Promise<AuthorizedLocation> {
    const { data, error } = await supabase.from("authorized_locations").insert(location).select().single()

    if (error) throw error
    return data
  }

  static async updateAuthorizedLocation(id: string, updates: Partial<AuthorizedLocation>): Promise<AuthorizedLocation> {
    const { data, error } = await supabase
      .from("authorized_locations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Configuración
  static async getSettings(): Promise<AppSetting[]> {
    const { data, error } = await supabase.from("app_settings").select("*")

    if (error) throw error
    return data || []
  }

  static async updateSetting(key: string, value: string): Promise<AppSetting> {
    const { data, error } = await supabase.from("app_settings").upsert({ key, value }).select().single()

    if (error) throw error
    return data
  }

  // Estadísticas
  static async getOverallStats(
    startDate?: string,
    endDate?: string,
    workCenterId?: string,
  ): Promise<{
    totalHours: number
    totalRecords: number
    activeEmployees: number
  }> {
    let query = supabase.from("time_records").select(`
      *,
      employees(*),
      work_centers(*)
    `)

    if (startDate) {
      query = query.gte("timestamp", startDate)
    }

    if (endDate) {
      query = query.lte("timestamp", endDate)
    }

    if (workCenterId) {
      query = query.eq("work_center_id", workCenterId)
    }

    const { data, error } = await query

    if (error) throw error

    const records = data || []
    const employeeIds = new Set(records.map((r) => r.employee_id))

    // Calcular horas totales (simplificado)
    const totalHours = this.calculateTotalHours(records)

    return {
      totalHours,
      totalRecords: records.length,
      activeEmployees: employeeIds.size,
    }
  }

  static async getEmployeeStats(
    startDate?: string,
    endDate?: string,
    workCenterId?: string,
  ): Promise<ExtendedEmployeeStats[]> {
    let query = supabase.from("time_records").select(`
      *,
      employees(
        id,
        employee_id_internal,
        name,
        work_center_id,
        work_centers(
          id,
          name,
          city
        )
      )
    `)

    if (startDate) {
      query = query.gte("timestamp", startDate)
    }

    if (endDate) {
      query = query.lte("timestamp", endDate)
    }

    if (workCenterId) {
      query = query.eq("work_center_id", workCenterId)
    }

    const { data, error } = await query

    if (error) throw error

    const records = data || []
    const employeeStats = new Map<string, ExtendedEmployeeStats>()

    records.forEach((record) => {
      if (!record.employees) return

      const employeeId = record.employee_id
      if (!employeeStats.has(employeeId)) {
        employeeStats.set(employeeId, {
          employee_id: record.employees.employee_id_internal,
          employee_name: record.employees.name,
          total_hours: 0,
          total_records: 0,
          work_center_id: record.employees.work_center_id,
          work_center_name: record.employees.work_centers?.name || "Sin asignar",
        })
      }

      const stats = employeeStats.get(employeeId)!
      stats.total_records++
    })

    // Calcular horas por empleado
    for (const [employeeId, stats] of employeeStats) {
      const employeeRecords = records.filter((r) => r.employee_id === employeeId)
      stats.total_hours = this.calculateTotalHours(employeeRecords)
    }

    return Array.from(employeeStats.values())
  }

  private static calculateTotalHours(records: TimeRecord[]): number {
    // Implementación simplificada del cálculo de horas
    const groupedByEmployee = records.reduce(
      (acc, record) => {
        if (!acc[record.employee_id]) {
          acc[record.employee_id] = []
        }
        acc[record.employee_id].push(record)
        return acc
      },
      {} as Record<string, TimeRecord[]>,
    )

    let totalHours = 0

    Object.values(groupedByEmployee).forEach((employeeRecords) => {
      employeeRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      let currentEntry: Date | null = null
      let pauseStart: Date | null = null
      let dailyHours = 0

      employeeRecords.forEach((record) => {
        const timestamp = new Date(record.timestamp)

        switch (record.action_type) {
          case "entrada":
            currentEntry = timestamp
            break
          case "salida":
            if (currentEntry) {
              dailyHours += (timestamp.getTime() - currentEntry.getTime()) / (1000 * 60 * 60)
              currentEntry = null
            }
            break
          case "inicio_pausa":
            if (currentEntry) {
              dailyHours += (timestamp.getTime() - currentEntry.getTime()) / (1000 * 60 * 60)
              pauseStart = timestamp
            }
            break
          case "fin_pausa":
            if (pauseStart) {
              currentEntry = timestamp
              pauseStart = null
            }
            break
        }
      })

      totalHours += dailyHours
    })

    return Math.round(totalHours * 100) / 100
  }
}
