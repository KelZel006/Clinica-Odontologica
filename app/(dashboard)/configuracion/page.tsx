'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Building2, CreditCard, Monitor, Bell } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><Settings className="w-6 h-6 text-[#1B2E6B]" /> Configuración</h1>
        <p className="text-sm text-muted-foreground">Parámetros generales del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-5 h-5 text-[#2563EB]" /> Datos de la Clínica</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Nombre:</strong> Dr. Elías Renato Chirinos</p>
            <p><strong>Especialidad:</strong> Cirujano Dentista e Implantantólogo</p>
            <p><strong>Moneda:</strong> Lempiras (Lps)</p>
            <p className="text-xs text-muted-foreground mt-2">Módulo preparado para configuración avanzada</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#2563EB]" /> Métodos de Pago</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>• Efectivo</p>
            <p>• Transferencia bancaria</p>
            <p>• Tarjeta</p>
            <p>• Depósito bancario</p>
            <p className="text-xs text-muted-foreground mt-2">Métodos configurables desde administración</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="w-5 h-5 text-[#2563EB]" /> Consultorios</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">Gestión de consultorios disponible para configuración</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-5 h-5 text-[#2563EB]" /> Notificaciones</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">Preparado para integración con WhatsApp y automatizaciones futuras</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
