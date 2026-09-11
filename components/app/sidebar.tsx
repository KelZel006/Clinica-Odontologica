'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope,
  DollarSign, UserCog, Settings, LogOut, Menu, X, ChevronDown
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/citas', label: 'Citas', icon: CalendarDays },
  { href: '/tratamientos', label: 'Tratamientos', icon: Stethoscope },
  { href: '/finanzas', label: 'Finanzas', icon: DollarSign },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const userName = session?.user?.name ?? 'Usuario'
  const userRole = session?.user?.role ?? ''

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    recepcionista: 'Recepcionista',
    odontologo: 'Odontólogo',
    asistente: 'Asistente',
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1B2E6B] text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full bg-[#1B2E6B] text-white z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-contain rounded" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Dr. Elías Chirinos</p>
              <p className="text-[10px] text-white/60 truncate">Cirujano Dentista</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-white/50 truncate">{roleLabels[userRole] ?? userRole}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ redirectTo: '/login' })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Collapse toggle - desktop */}
        <button
          className="hidden lg:flex items-center justify-center p-2 border-t border-white/10 text-white/50 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', collapsed ? 'rotate-[-90deg]' : 'rotate-90')} />
        </button>
      </aside>
    </>
  )
}
