"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/lib/supabase"

interface User {
  id: string
  type: "admin" | "employee"
  email?: string
  employee?: Employee
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginAdmin: (email: string, password: string) => Promise<boolean>
  loginEmployee: (employeeId: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("miticaje_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)

    // Escuchar cambios en la autenticación de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        localStorage.removeItem("miticaje_user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de login admin:", error)
        return false
      }

      if (data.user) {
        const adminUser: User = {
          id: data.user.id,
          type: "admin",
          email: data.user.email,
        }
        setUser(adminUser)
        localStorage.setItem("miticaje_user", JSON.stringify(adminUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Error en loginAdmin:", error)
      return false
    }
  }

  const loginEmployee = async (employeeId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_id_internal", employeeId)
        .eq("is_active", true)
        .single()

      if (error || !data) {
        console.error("Error al verificar empleado:", error)
        return false
      }

      const employeeUser: User = {
        id: data.id,
        type: "employee",
        employee: data,
      }
      setUser(employeeUser)
      localStorage.setItem("miticaje_user", JSON.stringify(employeeUser))

      return true
    } catch (error) {
      console.error("Error en loginEmployee:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem("miticaje_user")
    } catch (error) {
      console.error("Error en logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAdmin,
        loginEmployee,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
