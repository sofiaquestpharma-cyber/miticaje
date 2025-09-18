"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Shield, Users, Clock, BarChart3, Settings, Power, Menu, Building } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ApiService } from "@/services/apiService"
import type { Employee, TimeRecord, AppSetting, EmployeeStats, WorkCenter } from "@/lib/supabase"
import EmployeeManagement from "./admin/EmployeeManagement"
import TimeRecordManagement from "./admin/TimeRecordManagement"
import Statistics from "./admin/Statistics"
import AdminSettings from "./admin/AdminSettings"
import WorkCenterManagement from "./admin/WorkCenterManagement"
import Image from "next/image"

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("timerecords")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([])
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [stats, setStats] = useState<{
    overall: { totalHours: number; totalRecords: number; activeEmployees: number }
    employees: EmployeeStats[]
  }>({
    overall: { totalHours: 0, totalRecords: 0, activeEmployees: 0 },
    employees: [],
  })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [employeesData, timeRecordsData, settingsData, workCentersData, overallStats, employeeStats] =
        await Promise.all([
          ApiService.getEmployees(),
          ApiService.getTimeRecords(),
          ApiService.getSettings(),
          ApiService.getWorkCenters(),
          ApiService.getOverallStats(),
          ApiService.getEmployeeStats(),
        ])

      setEmployees(employeesData)
      setTimeRecords(timeRecordsData)
      setSettings(settingsData)
      setWorkCenters(workCentersData)
      setStats({
        overall: overallStats,
        employees: employeeStats,
      })
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyName = () => {
    const companySetting = settings.find((s) => s.key === "company_name")
    return companySetting?.value || "Mi Empresa"
  }

  const tabsConfig = [
    { id: "timerecords", label: "Fichajes", icon: Clock, component: TimeRecordManagement },
    { id: "employees", label: "Empleados", icon: Users, component: EmployeeManagement },
    { id: "workcenters", label: "Centros", icon: Building, component: WorkCenterManagement },
    { id: "statistics", label: "Estadísticas", icon: BarChart3, component: Statistics },
    { id: "settings", label: "Configuración", icon: Settings, component: AdminSettings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-elegant-700 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 font-sans">
      {/* Mobile Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary-100 sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image src="/favicon.png" alt="MiTicaje" width={32} height={32} className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold text-elegant-900">Panel Admin</h1>
              <p className="text-xs text-elegant-700 font-medium">{getCompanyName()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1 text-xs border-primary-200 text-elegant-900 font-medium">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-elegant-700 hover:text-elegant-900">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-sm">
                <div className="space-y-6 pt-6">
                  <div className="text-center">
                    <Image
                      src="/logo.png"
                      alt="MiTicaje"
                      width={120}
                      height={48}
                      className="h-12 w-auto mx-auto mb-2"
                    />
                    <p className="text-sm text-elegant-700 font-medium">{getCompanyName()}</p>
                  </div>

                  <nav className="space-y-2">
                    {tabsConfig.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <Button
                          key={tab.id}
                          variant={activeTab === tab.id ? "default" : "ghost"}
                          className={`w-full justify-start font-medium ${
                            activeTab === tab.id
                              ? "bg-primary-500 text-white hover:bg-primary-600"
                              : "text-elegant-700 hover:text-elegant-900 hover:bg-primary-50"
                          }`}
                          onClick={() => {
                            setActiveTab(tab.id)
                            setSidebarOpen(false)
                          }}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {tab.label}
                        </Button>
                      )
                    })}
                  </nav>

                  <div className="pt-4 border-t border-primary-100">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white/90 backdrop-blur-sm border-b border-primary-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="MiTicaje" width={160} height={64} className="h-16 w-auto" />
            <div className="border-l border-primary-200 pl-4">
              <h1 className="text-2xl font-bold text-elegant-900">Panel de Administración</h1>
              <p className="text-elegant-700 font-medium">{getCompanyName()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 border-primary-200 text-elegant-900 font-medium">
              <Shield className="h-4 w-4 mr-1" />
              Administrador
            </Badge>
            <Button
              variant="outline"
              onClick={logout}
              className="border-primary-200 text-elegant-900 hover:bg-primary-50 font-medium"
            >
              <Power className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <TabsList className="hidden lg:grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-sm border border-primary-100">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary-500 data-[state=active]:text-white text-elegant-700 font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Mobile Tab Indicator */}
          <div className="lg:hidden bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-primary-100">
            <div className="flex items-center gap-2">
              {(() => {
                const currentTab = tabsConfig.find((tab) => tab.id === activeTab)
                const Icon = currentTab?.icon || Clock
                return (
                  <>
                    <Icon className="h-5 w-5 text-primary-400" />
                    <span className="font-semibold text-elegant-900">{currentTab?.label}</span>
                  </>
                )
              })()}
            </div>
          </div>

          <TabsContent value="timerecords">
            <TimeRecordManagement
              timeRecords={timeRecords}
              employees={employees}
              workCenters={workCenters}
              onDataChange={loadData}
            />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement employees={employees} workCenters={workCenters} onDataChange={loadData} />
          </TabsContent>

          <TabsContent value="workcenters">
            <WorkCenterManagement workCenters={workCenters} onDataChange={loadData} />
          </TabsContent>

          <TabsContent value="statistics">
            <Statistics stats={stats} workCenters={workCenters} onRefresh={loadData} />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings settings={settings} onDataChange={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
