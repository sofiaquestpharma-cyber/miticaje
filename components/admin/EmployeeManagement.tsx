"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, User, UserCheck, UserX, Building } from "lucide-react"
import { ApiService } from "@/services/apiService"
import type { Employee, WorkCenter } from "@/lib/supabase"

interface EmployeeManagementProps {
  employees: Employee[]
  workCenters: WorkCenter[]
  onDataChange: () => void
}

export default function EmployeeManagement({ employees, workCenters, onDataChange }: EmployeeManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    employee_id_internal: "",
    name: "",
    is_active: true,
    work_center_id: "default",
  })

  const resetForm = () => {
    setFormData({
      employee_id_internal: "",
      name: "",
      is_active: true,
      work_center_id: "default",
    })
  }

  const handleAdd = async () => {
    if (!formData.employee_id_internal.trim() || !formData.name.trim()) return

    setLoading(true)
    try {
      await ApiService.createEmployee({
        ...formData,
        work_center_id: formData.work_center_id === "default" ? undefined : formData.work_center_id,
      })
      setShowAddDialog(false)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al crear empleado:", error)
      alert("Error al crear empleado. Verifica que el ID no esté duplicado.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedEmployee || !formData.employee_id_internal.trim() || !formData.name.trim()) return

    setLoading(true)
    try {
      await ApiService.updateEmployee(selectedEmployee.id, {
        ...formData,
        work_center_id: formData.work_center_id === "default" ? undefined : formData.work_center_id,
      })
      setShowEditDialog(false)
      setSelectedEmployee(null)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al actualizar empleado:", error)
      alert("Error al actualizar empleado. Verifica que el ID no esté duplicado.")
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      employee_id_internal: employee.employee_id_internal,
      name: employee.name,
      is_active: employee.is_active,
      work_center_id: employee.work_center_id || "default",
    })
    setShowEditDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const getWorkCenterName = (workCenterId?: string) => {
    if (!workCenterId || workCenterId === "default") return "Sin asignar"
    const center = workCenters.find((c) => c.id === workCenterId)
    return center?.name || "Centro desconocido"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
          <p className="text-gray-600">Administra los empleados del sistema</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Empleado</DialogTitle>
              <DialogDescription>Introduce los datos del nuevo empleado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-employee-id">ID Interno</Label>
                <Input
                  id="add-employee-id"
                  placeholder="Ej: EMP001, AnaG"
                  value={formData.employee_id_internal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employee_id_internal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-employee-name">Nombre Completo</Label>
                <Input
                  id="add-employee-name"
                  placeholder="Ej: Ana García López"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-work-center">Centro de Trabajo</Label>
                <Select
                  value={formData.work_center_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, work_center_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sin asignar</SelectItem>
                    {workCenters
                      .filter((c) => c.is_active)
                      .map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} {center.city && `- ${center.city}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="add-employee-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="add-employee-active">Empleado Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={loading}>
                {loading ? "Creando..." : "Crear Empleado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employees.filter((e) => e.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{employees.filter((e) => !e.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Centros Activos</CardTitle>
            <CardDescription>Centros de trabajo activos en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{workCenters.filter((c) => c.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>Todos los empleados registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Interno</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Centro de Trabajo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employee_id_internal}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{getWorkCenterName(employee.work_center_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.is_active ? "default" : "secondary"}>
                      {employee.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(employee.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay empleados registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>Modifica los datos del empleado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-id">ID Interno</Label>
              <Input
                id="edit-employee-id"
                placeholder="Ej: EMP001, AnaG"
                value={formData.employee_id_internal}
                onChange={(e) => setFormData((prev) => ({ ...prev, employee_id_internal: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-employee-name">Nombre Completo</Label>
              <Input
                id="edit-employee-name"
                placeholder="Ej: Ana García López"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-work-center">Centro de Trabajo</Label>
              <Select
                value={formData.work_center_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, work_center_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Sin asignar</SelectItem>
                  {workCenters
                    .filter((c) => c.is_active)
                    .map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name} {center.city && `- ${center.city}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-employee-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-employee-active">Empleado Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
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
