import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Employee {
  id: string
  employee_id_internal: string
  name: string
  is_active: boolean
  work_center_id?: string
  created_at: string
  updated_at: string
  work_centers?: WorkCenter
}

export interface TimeRecord {
  id: string
  employee_id: string
  action_type: "entrada" | "salida" | "inicio_pausa" | "fin_pausa"
  timestamp: string
  is_edited_by_admin: boolean
  admin_justification?: string
  admin_editor_id?: string
  edit_timestamp?: string
  created_at: string
  updated_at: string
  // Campos de geolocalización
  latitude?: number
  longitude?: number
  accuracy?: number
  address?: string
  location_timestamp?: string
  location_error?: string
  // Campo de centro de trabajo
  work_center_id?: string
  employees?: Employee
  work_centers?: WorkCenter
}

export interface AppSetting {
  key: string
  value: string
  description?: string
}

export interface EmployeeStats {
  employee_id: string
  employee_name: string
  total_hours: number
  total_records: number
}

export interface AuthorizedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  radius_meters: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LocationValidation {
  isValid: boolean
  distance?: number
  nearestLocation?: AuthorizedLocation
  message: string
}

export interface WorkCenter {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  latitude?: number
  longitude?: number
  is_active: boolean
  created_at: string
  updated_at: string
}
