"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Edit, Building, MapPin, Phone, Mail } from "lucide-react"
import { ApiService } from "@/services/apiService"
import type { WorkCenter } from "@/lib/supabase"

interface WorkCenterManagementProps {
  workCenters: WorkCenter[]
  onDataChange: () => void
}

export default function WorkCenterManagement({ workCenters, onDataChange }: WorkCenterManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<WorkCenter | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: "",
    is_active: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      postal_code: "",
      phone: "",
      email: "",
      is_active: true,
    })
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await ApiService.createWorkCenter(formData)
      setShowAddDialog(false)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al crear centro de trabajo:", error)
      alert("Error al crear centro de trabajo.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCenter || !formData.name.trim()) return

    setLoading(true)
    try {
      await ApiService.updateWorkCenter(selectedCenter.id, formData)
      setShowEditDialog(false)
      setSelectedCenter(null)
      resetForm()
      onDataChange()
    } catch (error) {
      console.error("Error al actualizar centro de trabajo:", error)
      alert("Error al actualizar centro de trabajo.")
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (center: WorkCenter) => {
    setSelectedCenter(center)
    setFormData({
      name: center.name,
      address: center.address || "",
      city: center.city || "",
      postal_code: center.postal_code || "",
      phone: center.phone || "",
      email: center.email || "",
      is_active: center.is_active,
    })
    setShowEditDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centros de Trabajo</h2>
          <p className="text-gray-600">Gestiona las diferentes sedes y ubicaciones</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Centro
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workCenters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{workCenters.filter((c) => c.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros Inactivos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{workCenters.filter((c) => !c.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Centros de Trabajo</CardTitle>
          <CardDescription>Todos los centros registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workCenters.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary-500" />
                      {center.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      {center.address && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{center.address}</span>
                        </div>
                      )}
                      {center.city && (
                        <p className="text-sm text-gray-500">
                          {center.city} {center.postal_code}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      {center.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{center.phone}</span>
                        </div>
                      )}
                      {center.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{center.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={center.is_active ? "default" : "secondary"}>
                      {center.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(center.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(center)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {workCenters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay centros de trabajo registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Centro de Trabajo</DialogTitle>
            <DialogDescription>Registra un nuevo centro de trabajo o sede</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nombre del Centro *</Label>
              <Input
                id="add-name"
                placeholder="Ej: Sede Madrid, Oficina Barcelona"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-city">Ciudad</Label>
              <Input
                id="add-city"
                placeholder="Ej: Madrid"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-address">Dirección</Label>
              <Input
                id="add-address"
                placeholder="Ej: Calle Mayor 123"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-postal">Código Postal</Label>
              <Input
                id="add-postal"
                placeholder="Ej: 28001"
                value={formData.postal_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Teléfono</Label>
              <Input
                id="add-phone"
                placeholder="Ej: +34 91 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="Ej: madrid@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="add-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="add-active">Centro Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? "Creando..." : "Crear Centro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Centro de Trabajo</DialogTitle>
            <DialogDescription>Modifica los datos del centro de trabajo</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Centro *</Label>
              <Input
                id="edit-name"
                placeholder="Ej: Sede Madrid, Oficina Barcelona"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ciudad</Label>
              <Input
                id="edit-city"
                placeholder="Ej: Madrid"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                placeholder="Ej: Calle Mayor 123"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal">Código Postal</Label>
              <Input
                id="edit-postal"
                placeholder="Ej: 28001"
                value={formData.postal_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                placeholder="Ej: +34 91 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Ej: madrid@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-active">Centro Activo</Label>
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
