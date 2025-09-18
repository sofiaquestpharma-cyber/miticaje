"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginScreen from "@/components/LoginScreen"
import EmployeePanel from "@/components/EmployeePanel"
import AdminPanel from "@/components/AdminPanel"
import PWAInstallBanner from "@/components/PWAInstallBanner"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!user && <LoginScreen />}
      {user?.type === "employee" && <EmployeePanel />}
      {user?.type === "admin" && <AdminPanel />}
      <PWAInstallBanner />
    </>
  )
}
