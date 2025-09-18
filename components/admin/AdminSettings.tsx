"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Building, Clock, Save } from "lucide-react"
import { ApiService } from "@/services/apiService"
import type { AppSetting } from "@/lib/supabase"

interface AdminSettingsProps {
  settings: AppSetting[]
  onDataChange: () => void
}

export default function AdminSettings({ settings, onDataChange }: AdminSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState(() => {
    const companyName = settings.find((s) => s.key === "company_name")?.value || ""
    const workdayHours = settings.find((s) => s.key === "standard_workday_hours")?.value || "8"

    return {
      company_name: companyName,
      standard_workday_hours: workdayHours,
    }
  })

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      await Promise.all([
        ApiService.updateSetting("company_name", formData.company_name),
        ApiService.updateSetting("standard_workday_hours", formData.standard_workday_hours),
      ])

      setMessage("Configuración guardada correctamente")
      onDataChange()
    } catch (error) {
      setMessage("Error al guardar la configuración")
      console.error("Error al guardar configuración:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-600">Ajusta la configuración general del sistema</p>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>Configura los datos básicos de tu empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input
              id="company-name"
              placeholder="Ej: Mi Empresa S.L."
              value={formData.company_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
            />
            <p className="text-sm text-gray-500">Este nombre aparecerá en los informes y documentos generados</p>
          </div>
        </CardContent>
      </Card>

      {/* Work Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración Laboral
          </CardTitle>
          <CardDescription>Define los parámetros de la jornada laboral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workday-hours">Jornada Laboral Estándar (horas)</Label>
            <Input
              id="workday-hours"
              type="number"
              min="1"
              max="24"
              step="0.5"
              placeholder="8"
              value={formData.standard_workday_hours}
              onChange={(e) => setFormData((prev) => ({ ...prev, standard_workday_hours: e.target.value }))}
            />
            <p className="text-sm text-gray-500">
              Número de horas de la jornada laboral estándar para cálculos y estadísticas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Versión del Sistema:</p>
              <p className="font-medium">MiTicaje v1.0</p>
            </div>
            <div>
              <p className="text-gray-600">Base de Datos:</p>
              <p className="font-medium">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-gray-600">Última Actualización:</p>
              <p className="font-medium">{new Date().toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <p className="text-gray-600">Normativa:</p>
              <p className="font-medium">Real Decreto-ley 8/2019</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {message && (
            <div
              className={`text-sm p-3 rounded ${
                message.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>

      {/* Legal Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Aviso Legal</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            Este sistema de control horario cumple con los requisitos establecidos en el Real Decreto-ley 8/2019, de 8
            de marzo, de medidas urgentes de protección social y de lucha contra la precariedad laboral en la jornada de
            trabajo.
          </p>
          <p>
            Los datos de fichaje se conservan durante un período mínimo de cuatro años y están disponibles para los
            trabajadores, sus representantes y la Inspección de Trabajo.
          </p>
          <p>
            Para más información sobre el tratamiento de datos personales, consulte la política de privacidad de su
            empresa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
