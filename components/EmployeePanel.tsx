"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, Coffee, CoffeeIcon, History, Power, Menu, X, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ApiService } from "@/services/apiService"
import type { TimeRecord } from "@/lib/supabase"
import Image from "next/image"
import PWAStatusIndicator from "./PWAStatusIndicator"

type EmployeeStatus = "fuera" | "dentro" | "en_pausa"

export default function EmployeePanel() {
  const { user, logout } = useAuth()
  const [status, setStatus] = useState<EmployeeStatus>("fuera")
  const [lastAction, setLastAction] = useState<TimeRecord | null>(null)
  const [recentRecords, setRecentRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (user?.employee) {
      loadEmployeeData()
    }
  }, [user])

  const loadEmployeeData = async () => {
    if (!user?.employee) return

    try {
      const records = await ApiService.getTimeRecords({
        employeeId: user.employee.id,
      })

      setRecentRecords(records.slice(0, 10))

      if (records.length > 0) {
        const latest = records[0]
        setLastAction(latest)

        switch (latest.action_type) {
          case "entrada":
            setStatus("dentro")
            break
          case "salida":
            setStatus("fuera")
            break
          case "inicio_pausa":
            setStatus("en_pausa")
            break
          case "fin_pausa":
            setStatus("dentro")
            break
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del empleado:", error)
      setMessage("Error al cargar los datos. Recarga la página.")
    }
  }

  const handleAction = async (actionType: "entrada" | "salida" | "inicio_pausa" | "fin_pausa") => {
    if (!user?.employee) return

    setLoading(true)
    setMessage("")

    try {
      await ApiService.createTimeRecordWithLocation({
        employee_id: user.employee.id,
        action_type: actionType,
        work_center_id: user.employee.work_center_id,
      })

      setMessage(`${getActionLabel(actionType)} registrado correctamente`)
      await loadEmployeeData()

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error al registrar acción:", error)
      setMessage(`Error al registrar ${getActionLabel(actionType).toLowerCase()}. Inténtalo de nuevo.`)
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (action: string) => {
    const labels = {
      entrada: "Entrada",
      salida: "Salida",
      inicio_pausa: "Inicio de Pausa",
      fin_pausa: "Fin de Pausa",
    }
    return labels[action as keyof typeof labels] || action
  }

  const getStatusBadge = () => {
    const statusConfig = {
      fuera: {
        label: "Fuera",
        icon: LogOut,
        className: "bg-primary-100 text-primary-500 border-primary-200",
      },
      dentro: {
        label: "Dentro",
        icon: LogIn,
        className: "bg-green-100 text-green-700 border-green-200",
      },
      en_pausa: {
        label: "En Pausa",
        icon: Coffee,
        className: "bg-orange-100 text-orange-700 border-orange-200",
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border ${config.className} flex-shrink-0`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="whitespace-nowrap">{config.label}</span>
      </div>
    )
  }

  const getAvailableActions = () => {
    switch (status) {
      case "fuera":
        return ["entrada"]
      case "dentro":
        return ["salida", "inicio_pausa"]
      case "en_pausa":
        return ["fin_pausa"]
      default:
        return []
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("es-ES"),
      time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const getCurrentTime = () => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      date: now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
    }
  }

  if (!user?.employee) return null

  const currentTime = getCurrentTime()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 font-sans">
      {/* Mobile Header - Optimizado */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Image
              src="/favicon.png"
              alt="MiTicaje"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-elegant-900 truncate">MiTicaje</h1>
              <p className="text-xs text-elegant-700 font-medium truncate">Panel de Fichaje</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <PWAStatusIndicator />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden text-elegant-700 hover:text-elegant-900 p-2"
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="hidden sm:flex border-primary-200 text-elegant-900 hover:bg-primary-50 font-medium text-sm px-3 py-2"
            >
              <Power className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Cerrar Sesión</span>
              <span className="md:hidden">Salir</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Optimizado */}
        {showMobileMenu && (
          <div className="border-t border-primary-100 bg-white/95 backdrop-blur-sm p-3 sm:hidden">
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-semibold text-elegant-900 truncate">{user.employee.name}</p>
                <p className="text-elegant-700 font-medium truncate">{user.employee.employee_id_internal}</p>
              </div>
              <PWAStatusIndicator />
              <Button
                variant="outline"
                onClick={logout}
                className="w-full border-primary-200 text-elegant-900 hover:bg-primary-50 font-medium"
              >
                <Power className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Welcome Card - Optimizado */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="hidden sm:block text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-elegant-900 truncate">
                  ¡Hola, {user.employee.name}!
                </h2>
                <p className="text-elegant-700 font-medium truncate">ID: {user.employee.employee_id_internal}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-elegant-900">{currentTime.time}</p>
                  <p className="text-xs sm:text-sm text-elegant-700 capitalize font-medium truncate max-w-full">
                    {currentTime.date}
                  </p>
                </div>
                {getStatusBadge()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Optimizado */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg text-elegant-900 font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span>Registrar Fichaje</span>
              </div>
              <Badge
                variant="outline"
                className="text-xs border-green-200 text-green-700 bg-green-50 self-start sm:self-auto"
              >
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                GPS Automático
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {lastAction && (
              <div className="bg-primary-50 rounded-lg p-3 sm:p-4 text-sm border border-primary-100">
                <div className="space-y-3">
                  {/* Header de última acción */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-elegant-900 text-sm">Última acción:</p>
                      <p className="text-elegant-700 font-medium text-base">{getActionLabel(lastAction.action_type)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-elegant-900 text-lg">
                        {formatDateTime(lastAction.timestamp).time}
                      </p>
                      <p className="text-elegant-700 font-medium text-xs">
                        {formatDateTime(lastAction.timestamp).date}
                      </p>
                    </div>
                  </div>

                  {/* Dirección en línea separada */}
                  {lastAction.address && (
                    <div className="bg-white/50 rounded p-2 border border-primary-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-elegant-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-elegant-600 font-medium mb-1">Ubicación registrada:</p>
                          <p
                            className="text-xs text-elegant-700 leading-relaxed break-words hyphens-auto"
                            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                          >
                            {lastAction.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {message && (
              <div
                className={`text-sm p-3 sm:p-4 rounded-lg font-semibold break-words ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {getAvailableActions().map((action) => {
                const actionConfig = {
                  entrada: {
                    label: "ENTRADA",
                    icon: LogIn,
                    className: "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl",
                    description: "Iniciar jornada laboral",
                  },
                  salida: {
                    label: "SALIDA",
                    icon: LogOut,
                    className: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
                    description: "Finalizar jornada laboral",
                  },
                  inicio_pausa: {
                    label: "INICIO PAUSA",
                    icon: Coffee,
                    className: "bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl",
                    description: "Comenzar descanso",
                  },
                  fin_pausa: {
                    label: "FIN PAUSA",
                    icon: CoffeeIcon,
                    className: "bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl",
                    description: "Terminar descanso",
                  },
                }

                const config = actionConfig[action as keyof typeof actionConfig]
                const Icon = config.icon

                return (
                  <Button
                    key={action}
                    onClick={() => handleAction(action as any)}
                    disabled={loading}
                    className={`h-16 sm:h-20 md:h-24 flex flex-col gap-1 sm:gap-2 text-sm sm:text-base font-bold transition-all duration-200 ${
                      loading ? "opacity-50 cursor-not-allowed" : config.className
                    }`}
                  >
                    {loading ? (
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm font-semibold">Registrando...</span>
                      </div>
                    ) : (
                      <>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                        <div className="text-center">
                          <div className="font-bold text-xs sm:text-sm leading-tight">{config.label}</div>
                          <div className="text-xs opacity-90 font-medium leading-tight hidden sm:block">
                            {config.description}
                          </div>
                        </div>
                      </>
                    )}
                  </Button>
                )
              })}
            </div>

            <div className="text-center text-xs text-elegant-600 bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="font-medium">La ubicación se registra automáticamente con cada fichaje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Records - Optimizado */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-elegant-900 font-semibold min-w-0">
                <History className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="truncate">Fichajes Recientes</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs border-primary-200 text-elegant-900 hover:bg-primary-50 font-medium flex-shrink-0"
              >
                {showHistory ? "Ocultar" : "Ver Todo"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showHistory ? recentRecords : recentRecords.slice(0, 5)).map((record) => {
                const { date, time } = formatDateTime(record.timestamp)
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-3 border-b border-primary-100 last:border-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-elegant-900 text-sm truncate">
                          {getActionLabel(record.action_type)}
                        </p>
                        <p className="text-xs text-elegant-700 font-medium">{date}</p>
                        {record.address && (
                          <p className="text-xs text-elegant-600 truncate max-w-full" title={record.address}>
                            📍 {record.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-sm text-elegant-900">{time}</p>
                      <div className="flex gap-1 justify-end mt-1 flex-wrap">
                        {record.is_edited_by_admin && (
                          <Badge variant="outline" className="text-xs border-primary-200 text-elegant-700 font-medium">
                            Editado
                          </Badge>
                        )}
                        {record.latitude && record.longitude && (
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700 font-medium">
                            <MapPin className="h-2 w-2 mr-1" />
                            GPS
                          </Badge>
                        )}
                        {record.location_error && (
                          <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 font-medium">
                            Sin GPS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {recentRecords.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-elegant-700">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium">No hay fichajes registrados</p>
                  <p className="text-xs font-medium">Registra tu primera entrada para comenzar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
