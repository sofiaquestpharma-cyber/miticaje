"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Download, Printer, Filter, Clock, MapPin, AlertTriangle, Building } from "lucide-react"
import { ApiService } from "@/services/apiService"
import type { Employee, TimeRecord, WorkCenter } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface TimeRecordManagementProps {
  timeRecords: TimeRecord[]
  employees: Employee[]
  workCenters: WorkCenter[]
  onDataChange: () => void
}

export default function TimeRecordManagement({
  timeRecords,
  employees,
  workCenters,
  onDataChange,
}: TimeRecordManagementProps) {
  const { user } = useAuth()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    actionType: "",
    workCenterId: "",
  })
  const [formData, setFormData] = useState({
    employee_id: "",
    action_type: "entrada" as "entrada" | "salida" | "inicio_pausa" | "fin_pausa",
    date: "",
    time: "",
    justification: "",
    work_center_id: "",
  })

  const resetForm = () => {
    setFormData({
      employee_id: "",
      action_type: "entrada",
      date: "",
      time: "",
      justification: "",
      work_center_id: "",
    })
  }

  const handleAdd = async () => {
    if (!formData.employee_id || !formData.date || !formData.time || !formData.justification.trim()) return

    setLoading(true)
    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString()

      await ApiService.createTimeRecord({
        employee_id: formData.employee_id,
        action_type: formData.action_type,
        timestamp,
        admin_justification: formData.justification,
        work_center_id: formData.work_center_id || undefined,
      })

      setShowAddDialog(false)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al crear fichaje:", error)
      alert("Error al crear fichaje.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedRecord || !formData.date || !formData.time || !formData.justification.trim()) return

    setLoading(true)
    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString()

      await ApiService.updateTimeRecord(
        selectedRecord.id,
        {
          action_type: formData.action_type,
          timestamp,
          work_center_id: formData.work_center_id || undefined,
        },
        formData.justification,
        user?.id || "",
      )

      setShowEditDialog(false)
      setSelectedRecord(null)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al actualizar fichaje:", error)
      alert("Error al actualizar fichaje.")
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (record: TimeRecord) => {
    setSelectedRecord(record)
    const date = new Date(record.timestamp)
    setFormData({
      employee_id: record.employee_id,
      action_type: record.action_type,
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().slice(0, 5),
      justification: "",
      work_center_id: record.work_center_id || "",
    })
    setShowEditDialog(true)
  }

  const exportToCSV = () => {
    const filteredRecords = getFilteredRecords()
    const csvContent = [
      [
        "ID Empleado",
        "Nombre",
        "Centro",
        "Acción",
        "Fecha",
        "Hora",
        "Latitud",
        "Longitud",
        "Dirección",
        "Precisión GPS",
        "Editado por Admin",
        "Justificación",
      ].join(","),
      ...filteredRecords.map((record) =>
        [
          record.employees?.employee_id_internal || "",
          record.employees?.name || "",
          getWorkCenterName(record.work_center_id),
          getActionLabel(record.action_type),
          new Date(record.timestamp).toLocaleDateString("es-ES"),
          new Date(record.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          record.latitude || "",
          record.longitude || "",
          record.address || "",
          record.accuracy ? `${record.accuracy.toFixed(0)}m` : "",
          record.is_edited_by_admin ? "Sí" : "No",
          record.admin_justification || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `fichajes_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printRecords = () => {
    const filteredRecords = getFilteredRecords()
    const printContent = `
    <html>
      <head>
        <title>Registros de Fichajes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .location { font-size: 10px; color: #666; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>Registros de Fichajes</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString("es-ES")}</p>
        <p>Total de registros: ${filteredRecords.length}</p>
        <table>
          <thead>
            <tr>
              <th>ID Empleado</th>
              <th>Nombre</th>
              <th>Centro</th>
              <th>Acción</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Ubicación GPS</th>
              <th class="center">Editado</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords
              .map(
                (record) => `
              <tr>
                <td>${record.employees?.employee_id_internal || ""}</td>
                <td>${record.employees?.name || ""}</td>
                <td>${getWorkCenterName(record.work_center_id)}</td>
                <td>${getActionLabel(record.action_type)}</td>
                <td>${new Date(record.timestamp).toLocaleDateString("es-ES")}</td>
                <td>${new Date(record.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td>
                <td class="location">
                  ${
                    record.latitude && record.longitude
                      ? `📍 GPS: ${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}<br/>
                       ${record.address ? `Dirección: ${record.address}<br/>` : ""}
                       Precisión: ${record.accuracy ? `${record.accuracy.toFixed(0)}m` : "N/A"}`
                      : record.location_error
                        ? "⚠️ Sin GPS (Error de ubicación)"
                        : "❌ Ubicación no disponible"
                  }
                </td>
                <td class="center">${record.is_edited_by_admin ? "Sí" : "No"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 10px; color: #666;">
          <p><strong>Leyenda:</strong></p>
          <p>📍 GPS registrado correctamente | ⚠️ Error al obtener GPS | ❌ GPS no disponible</p>
          <p>Sistema de Control Horario - MiTicaje v1.0</p>
        </div>
      </body>
    </html>
  `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getFilteredRecords = () => {
    return timeRecords.filter((record) => {
      // Filtro por empleado
      if (filters.employeeId && filters.employeeId !== "all" && record.employee_id !== filters.employeeId) return false
      
      // Filtro por fecha de inicio
      if (filters.startDate && new Date(record.timestamp) < new Date(filters.startDate)) return false
      
      // Filtro por fecha de fin
      if (filters.endDate && new Date(record.timestamp) > new Date(filters.endDate)) return false
      
      // Filtro por tipo de acción
      if (filters.actionType && filters.actionType !== "all" && record.action_type !== filters.actionType) return false
      
      // Filtro por centro de trabajo
      if (filters.workCenterId && filters.workCenterId !== "all" && record.work_center_id !== filters.workCenterId) return false
      
      return true
    })
  }

  const getActionLabel = (action: string) => {
    const labels = {
      entrada: "Entrada",
      salida: "Salida",
      inicio_pausa: "Inicio Pausa",
      fin_pausa: "Fin Pausa",
    }
    return labels[action as keyof typeof labels] || action
  }

  const getWorkCenterName = (workCenterId?: string) => {
    if (!workCenterId) return "Sin asignar"
    const center = workCenters.find((c) => c.id === workCenterId)
    return center?.name || "Centro desconocido"
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("es-ES"),
      time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const filteredRecords = getFilteredRecords()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Optimizado */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Fichajes</h2>
          <p className="text-sm sm:text-base text-gray-600">Administra los registros de tiempo de los empleados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto text-sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={printRecords} className="w-full sm:w-auto text-sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Fichaje
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters - Optimizado */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilters({
                  employeeId: "",
                  startDate: "",
                  endDate: "",
                  actionType: "",
                  workCenterId: "",
                })}
                className="text-xs"
              >
                Limpiar Filtros
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Empleado</Label>
              <Select
                value={filters.employeeId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <span className="truncate">
                        {employee.name} ({employee.employee_id_internal})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Centro</Label>
              <Select
                value={filters.workCenterId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, workCenterId: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los centros</SelectItem>
                  {workCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      <span className="truncate">{center.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Desde</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Hasta</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Acción</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="inicio_pausa">Inicio Pausa</SelectItem>
                  <SelectItem value="fin_pausa">Fin Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table - Optimizado */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Registros de Fichajes</CardTitle>
          <CardDescription className="text-sm">{filteredRecords.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile View */}
          <div className="block sm:hidden">
            <div className="space-y-3 p-4">
              {filteredRecords.map((record) => {
                const { date, time } = formatDateTime(record.timestamp)
                return (
                  <Card key={record.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{record.employees?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{record.employees?.employee_id_internal}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {getActionLabel(record.action_type)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span>{date}</span>
                        <span className="font-mono font-bold">{time}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{getWorkCenterName(record.work_center_id)}</span>
                      </div>

                      {record.latitude && record.longitude ? (
                        <div className="flex items-center gap-1 text-xs text-green-700">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">GPS: {record.address || "Ubicación registrada"}</span>
                        </div>
                      ) : record.location_error ? (
                        <div className="flex items-center gap-1 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                          <span>Sin GPS</span>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between">
                        {record.is_edited_by_admin && (
                          <Badge variant="secondary" className="text-xs">
                            Editado por Admin
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(record)} className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Empleado</TableHead>
                  <TableHead className="min-w-[100px]">Centro</TableHead>
                  <TableHead className="min-w-[80px]">Acción</TableHead>
                  <TableHead className="min-w-[80px]">Fecha</TableHead>
                  <TableHead className="min-w-[60px]">Hora</TableHead>
                  <TableHead className="min-w-[80px]">Estado</TableHead>
                  <TableHead className="min-w-[150px] hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead className="min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const { date, time } = formatDateTime(record.timestamp)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="min-w-0">
                        <div>
                          <p className="font-medium text-sm truncate">{record.employees?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{record.employees?.employee_id_internal}</p>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm truncate">{getWorkCenterName(record.work_center_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getActionLabel(record.action_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{date}</TableCell>
                      <TableCell className="font-mono text-sm">{time}</TableCell>
                      <TableCell>
                        {record.is_edited_by_admin && (
                          <Badge variant="secondary" className="text-xs">
                            Editado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell min-w-0">
                        <div className="space-y-1">
                          {record.latitude && record.longitude ? (
                            <>
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3 text-green-600 flex-shrink-0" />
                                <span className="text-green-700 font-medium">GPS</span>
                              </div>
                              {record.address && (
                                <p className="text-xs text-gray-600 truncate max-w-[150px]" title={record.address}>
                                  {record.address}
                                </p>
                              )}
                            </>
                          ) : record.location_error ? (
                            <div className="flex items-center gap-1 text-xs">
                              <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
                              <span className="text-amber-700 font-medium">Sin GPS</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-500 font-medium">N/A</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(record)} className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500 p-4">
              <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay fichajes que coincidan con los filtros</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog - Optimizado */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Añadir Fichaje Manual</DialogTitle>
            <DialogDescription className="text-sm">Registra un fichaje manual para un empleado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1">
            <div className="space-y-2">
              <Label className="text-sm">Empleado</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, employee_id: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.is_active)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <span className="truncate">
                          {employee.name} ({employee.employee_id_internal})
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Centro de Trabajo</Label>
              <Select
                value={formData.work_center_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, work_center_id: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {workCenters
                    .filter((c) => c.is_active)
                    .map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        <span className="truncate">{center.name}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tipo de Acción</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, action_type: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="inicio_pausa">Inicio Pausa</SelectItem>
                  <SelectItem value="fin_pausa">Fin Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Justificación (Obligatoria)</Label>
              <Textarea
                placeholder="Ej: Olvido de fichaje, incidencia técnica..."
                value={formData.justification}
                onChange={(e) => setFormData((prev) => ({ ...prev, justification: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? "Creando..." : "Crear Fichaje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Optimizado */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Fichaje</DialogTitle>
            <DialogDescription className="text-sm">Modifica los datos del fichaje seleccionado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1">
            <div className="space-y-2">
              <Label className="text-sm">Centro de Trabajo</Label>
              <Select
                value={formData.work_center_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, work_center_id: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {workCenters
                    .filter((c) => c.is_active)
                    .map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        <span className="truncate">{center.name}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tipo de Acción</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, action_type: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="inicio_pausa">Inicio Pausa</SelectItem>
                  <SelectItem value="fin_pausa">Fin Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Justificación de la Edición (Obligatoria)</Label>
              <Textarea
                placeholder="Ej: Corrección de hora incorrecta, ajuste por incidencia..."
                value={formData.justification}
                onChange={(e) => setFormData((prev) => ({ ...prev, justification: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
