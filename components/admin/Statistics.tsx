"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Clock, Users, Activity, RefreshCw, Building } from "lucide-react"
import { ApiService } from "@/services/apiService"
import type { EmployeeStats, WorkCenter } from "@/lib/supabase"

interface StatisticsProps {
  stats: {
    overall: { totalHours: number; totalRecords: number; activeEmployees: number }
    employees: EmployeeStats[]
  }
  workCenters: WorkCenter[]
  onRefresh: () => void
}

export default function Statistics({ stats, workCenters, onRefresh }: StatisticsProps) {
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    workCenterId: "all",
  })
  const [loading, setLoading] = useState(false)
  const [filteredStats, setFilteredStats] = useState(stats)

  const applyFilters = async () => {
    setLoading(true)
    try {
      const workCenterFilter = dateFilters.workCenterId === "all" ? undefined : dateFilters.workCenterId

      const [overallStats, employeeStats] = await Promise.all([
        ApiService.getOverallStats(dateFilters.startDate, dateFilters.endDate, workCenterFilter),
        ApiService.getEmployeeStats(dateFilters.startDate, dateFilters.endDate, workCenterFilter),
      ])

      setFilteredStats({
        overall: overallStats,
        employees: employeeStats,
      })
    } catch (error) {
      console.error("Error al aplicar filtros:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setDateFilters({ startDate: "", endDate: "", workCenterId: "all" })
    setFilteredStats(stats)
  }

  const getWorkCenterName = (workCenterId?: string) => {
    if (!workCenterId || workCenterId === "all") return "Todos los centros"
    const center = workCenters.find((c) => c.id === workCenterId)
    return center?.name || "Centro desconocido"
  }

  // Calcular estadísticas por centro de trabajo
  const getWorkCenterStats = () => {
    const centerStats = new Map<
      string,
      {
        centerName: string
        totalHours: number
        totalRecords: number
        employeeCount: number
        employees: string[]
      }
    >()

    // Inicializar con todos los centros activos
    workCenters
      .filter((c) => c.is_active)
      .forEach((center) => {
        centerStats.set(center.id, {
          centerName: center.name,
          totalHours: 0,
          totalRecords: 0,
          employeeCount: 0,
          employees: [],
        })
      })

    // Agregar centro "Sin asignar" para empleados sin centro
    centerStats.set("unassigned", {
      centerName: "Sin asignar",
      totalHours: 0,
      totalRecords: 0,
      employeeCount: 0,
      employees: [],
    })

    // Procesar estadísticas de empleados
    filteredStats.employees.forEach((empStat) => {
      // Buscar el empleado para obtener su centro de trabajo
      // Nota: Necesitaríamos esta información en las estadísticas
      // Por ahora, agrupamos en "Sin asignar"
      const centerId = "unassigned" // Esto se podría mejorar con más datos

      if (centerStats.has(centerId)) {
        const centerStat = centerStats.get(centerId)!
        centerStat.totalHours += empStat.total_hours
        centerStat.totalRecords += empStat.total_records
        centerStat.employees.push(empStat.employee_name)
        centerStat.employeeCount = centerStat.employees.length
      }
    })

    return Array.from(centerStats.values()).filter((stat) => stat.totalRecords > 0)
  }

  const workCenterStats = getWorkCenterStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
          <p className="text-gray-600">Análisis de horas trabajadas y fichajes por centro</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análisis</CardTitle>
          <CardDescription>Filtra las estadísticas por fecha y centro de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="space-y-2 w-full sm:w-auto">
              <Label>Centro de Trabajo</Label>
              <Select
                value={dateFilters.workCenterId}
                onValueChange={(value) => setDateFilters((prev) => ({ ...prev, workCenterId: value }))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos los centros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los centros</SelectItem>
                  {workCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => setDateFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => setDateFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={applyFilters} disabled={loading} className="w-full sm:w-auto">
                {loading ? "Aplicando..." : "Aplicar Filtros"}
              </Button>
              <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Horas Trabajadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredStats.overall.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fichajes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filteredStats.overall.totalRecords}</div>
            <p className="text-xs text-muted-foreground">Registros de tiempo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{filteredStats.overall.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Con actividad en el período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{workCenters.filter((c) => c.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Centros de trabajo</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Center Stats */}
      {workCenterStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Estadísticas por Centro de Trabajo
            </CardTitle>
            <CardDescription>Resumen de actividad por centro en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro de Trabajo</TableHead>
                  <TableHead className="text-right">Empleados</TableHead>
                  <TableHead className="text-right">Horas Trabajadas</TableHead>
                  <TableHead className="text-right">Total Fichajes</TableHead>
                  <TableHead className="text-right">Promedio por Empleado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workCenterStats
                  .sort((a, b) => b.totalHours - a.totalHours)
                  .map((centerStat, index) => {
                    const avgHoursPerEmployee =
                      centerStat.employeeCount > 0 ? centerStat.totalHours / centerStat.employeeCount : 0

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary-500" />
                            <span className="font-medium">{centerStat.centerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{centerStat.employeeCount}</TableCell>
                        <TableCell className="text-right font-mono">{centerStat.totalHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">{centerStat.totalRecords}</TableCell>
                        <TableCell className="text-right font-mono">{avgHoursPerEmployee.toFixed(1)}h</TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Employee Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas por Empleado
          </CardTitle>
          <CardDescription>
            Horas trabajadas y fichajes por empleado en el período seleccionado
            {dateFilters.workCenterId !== "all" && ` - Centro: ${getWorkCenterName(dateFilters.workCenterId)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Empleado</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Horas Trabajadas</TableHead>
                <TableHead className="text-right">Total Fichajes</TableHead>
                <TableHead className="text-right">Promedio Diario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.employees
                .sort((a, b) => b.total_hours - a.total_hours)
                .map((employee) => {
                  // Calcular promedio diario - CORREGIDO: 2 fichajes por día (entrada/salida)
                  const daysWorked = Math.max(1, employee.total_records / 2) // Exactamente 2 fichajes por día
                  const dailyAverage = employee.total_hours / daysWorked
                  
                  // Debug: mostrar cálculos
                  console.log(`Empleado ${employee.employee_name}:`, {
                    totalHours: employee.total_hours,
                    totalRecords: employee.total_records,
                    daysWorked,
                    dailyAverage
                  })

                  return (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.employee_name}</TableCell>
                      <TableCell className="text-right font-mono">{employee.total_hours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{employee.total_records}</TableCell>
                      <TableCell className="text-right font-mono">{dailyAverage.toFixed(1)}h/día</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>

          {filteredStats.employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos de empleados en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {filteredStats.employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Período</CardTitle>
            <CardDescription>
              {dateFilters.workCenterId !== "all"
                ? `Análisis para: ${getWorkCenterName(dateFilters.workCenterId)}`
                : "Análisis global de todos los centros"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Promedio horas/empleado:</p>
                <p className="font-bold text-lg">
                  {(filteredStats.overall.totalHours / filteredStats.overall.activeEmployees).toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-gray-600">Promedio fichajes/empleado:</p>
                <p className="font-bold text-lg">
                  {Math.round(filteredStats.overall.totalRecords / filteredStats.overall.activeEmployees)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Empleado más activo:</p>
                <p className="font-bold">
                  {filteredStats.employees.reduce(
                    (max, emp) => (emp.total_hours > max.total_hours ? emp : max),
                    filteredStats.employees[0],
                  )?.employee_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Máximo horas trabajadas:</p>
                <p className="font-bold text-lg">
                  {Math.max(...filteredStats.employees.map((e) => e.total_hours)).toFixed(1)}h
                </p>
              </div>
            </div>

            {dateFilters.workCenterId !== "all" && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-2 text-primary-700">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">
                    Centro seleccionado: {getWorkCenterName(dateFilters.workCenterId)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
