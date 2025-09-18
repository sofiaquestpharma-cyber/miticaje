"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Shield, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"

export default function LoginScreen() {
  const [employeeId, setEmployeeId] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [error, setError] = useState("")

  const { loginEmployee, loginAdmin } = useAuth()

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId.trim()) return

    setLoading(true)
    setError("")

    try {
      const success = await loginEmployee(employeeId.trim())
      if (!success) {
        setError("ID de empleado no válido o empleado inactivo")
      }
    } catch (error) {
      setError("Error al acceder. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail.trim() || !adminPassword.trim()) return

    setLoading(true)
    setError("")

    try {
      const success = await loginAdmin(adminEmail.trim(), adminPassword)
      if (!success) {
        setError("Credenciales de administrador incorrectas")
      }
    } catch (error) {
      setError("Error al acceder. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col font-sans">
      {/* Header con logo - Optimizado */}
      <div className="flex-shrink-0 pt-6 sm:pt-8 pb-4 px-4">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="MiTicaje Logo"
                width={200}
                height={80}
                className="h-12 w-auto sm:h-16 md:h-20 max-w-full"
                priority
              />
            </div>
          </div>
          <p className="text-elegant-700 text-xs sm:text-sm md:text-base font-medium px-4 text-center">
            Sistema de Control Horario Profesional
          </p>
        </div>
      </div>

      {/* Main Content - Optimizado */}
      <div className="flex-1 flex items-center justify-center px-4 pb-6 sm:pb-8">
        <div className="w-full max-w-md">
          {!showAdminLogin ? (
            /* Employee Login - Optimizado */
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl text-elegant-900 font-semibold">
                  <div className="bg-primary-500 p-2 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-center">Acceso Empleado</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base text-elegant-700 font-medium px-2">
                  Introduce tu ID de empleado para registrar tu fichaje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <form onSubmit={handleEmployeeLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="employeeId" className="text-sm font-semibold text-elegant-900">
                      ID de Empleado
                    </Label>
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Ej: EMP001, AnaG"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                      className="text-center text-base sm:text-lg h-11 sm:h-12 border-2 border-primary-100 focus:border-primary-400 transition-colors bg-white text-elegant-900 font-medium placeholder:text-elegant-600"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium break-words">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-primary-500 transition-colors shadow-lg text-white"
                    disabled={loading || !employeeId.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">Accediendo...</span>
                      </div>
                    ) : (
                      "Acceder al Sistema"
                    )}
                  </Button>
                </form>

                <div className="space-y-4">
                  <Separator className="bg-primary-100" />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAdminLogin(true)
                      setError("")
                    }}
                    className="w-full text-elegant-700 hover:text-elegant-900 hover:bg-primary-50 font-medium text-sm sm:text-base"
                  >
                    <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                    Acceso Administrador
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Admin Login - Optimizado */
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl text-elegant-900 font-semibold">
                  <div className="bg-primary-500 p-2 rounded-full flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-center">Panel Administrativo</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base text-elegant-700 font-medium px-2">
                  Accede con tus credenciales de administrador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="adminEmail" className="text-sm font-semibold text-elegant-900">
                      Email Corporativo
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="h-11 sm:h-12 border-2 border-primary-100 focus:border-primary-400 transition-colors bg-white text-elegant-900 font-medium placeholder:text-elegant-600 text-sm sm:text-base"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="adminPassword" className="text-sm font-semibold text-elegant-900">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="h-11 sm:h-12 pr-12 border-2 border-primary-100 focus:border-primary-400 transition-colors bg-white text-elegant-900 font-medium placeholder:text-elegant-600 text-sm sm:text-base"
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 sm:h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-elegant-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-elegant-600" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium break-words">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-primary-500 transition-colors shadow-lg text-white"
                    disabled={loading || !adminEmail.trim() || !adminPassword.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">Iniciando Sesión...</span>
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>

                <div className="space-y-4">
                  <Separator className="bg-primary-100" />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAdminLogin(false)
                      setError("")
                      setAdminEmail("")
                      setAdminPassword("")
                    }}
                    className="w-full text-elegant-700 hover:text-elegant-900 hover:bg-primary-50 font-medium text-sm sm:text-base"
                  >
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    Volver a Acceso Empleado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer - Optimizado */}
      <div className="flex-shrink-0 text-center text-xs text-elegant-700 pb-4 sm:pb-6 px-4">
        <div className="space-y-1">
          <p className="font-semibold">Quest Pharma Contract Research SL</p>
          <p className="font-medium break-words">Cumple con Real Decreto-ley 8/2019 • Versión 1.0</p>
        </div>
      </div>
    </div>
  )
}
