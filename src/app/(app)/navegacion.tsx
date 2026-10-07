"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDaysIcon, ClipboardListIcon, LogOutIcon, UsersIcon, WalletIcon, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { cerrarSesion } from "@/app/login/actions";

export type ItemNav = { href: string; etiqueta: string; icono: "agenda" | "pacientes" | "finanzas" | "tratamientos"; aviso?: number };

const ICONOS: Record<ItemNav["icono"], LucideIcon> = {
  agenda: CalendarDaysIcon,
  pacientes: UsersIcon,
  finanzas: WalletIcon,
  tratamientos: ClipboardListIcon,
};

function activo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

const ROLES: Record<string, string> = {
  administrador: "Administración",
  doctor: "Doctor",
  recepcion: "Recepción",
  contabilidad: "Contabilidad",
};

export function BarraLateral({ items, nombre, rol }: { items: ItemNav[]; nombre: string; rol: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-marino text-white md:flex">
      <Link href="/" className="flex items-center gap-3 px-5 pt-6 pb-8">
        <Image src="/marca-blanca.png" alt="" width={607} height={436} priority className="h-auto w-12 shrink-0" />
        <span>
          <span className="block text-[0.95rem] leading-tight font-semibold">Dr. Elías Chirinos</span>
          <span className="mt-0.5 block text-[0.8125rem] text-marino-texto">Clínica odontológica</span>
        </span>
      </Link>

      <nav aria-label="Principal" className="flex-1 px-3">
        <ul className="grid gap-0.5">
          {items.map((item) => {
            const Icono = ICONOS[item.icono];
            const esActivo = activo(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={esActivo ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-[0.9375rem] text-marino-texto transition-colors hover:bg-marino-claro hover:text-white",
                    esActivo && "bg-white text-marino hover:bg-white hover:text-marino",
                  )}
                >
                  <Icono className="size-[18px]" aria-hidden />
                  <span className="flex-1">{item.etiqueta}</span>
                  {item.aviso ? (
                    <span
                      className="cifras min-w-6 rounded-full bg-rojo px-1.5 text-center text-xs leading-5 font-semibold text-white"
                      aria-label={`${item.aviso} pendientes`}
                    >
                      {item.aviso}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium">{nombre}</p>
        <p className="text-[0.8125rem] text-marino-texto">{rol ? ROLES[rol] ?? rol : "Sin rol asignado"}</p>
        <form action={cerrarSesion} className="mt-3">
          <button
            type="submit"
            className="-ml-2 inline-flex h-8 items-center gap-2 rounded-md px-2 text-[0.8125rem] text-marino-texto transition-colors hover:bg-marino-claro hover:text-white"
          >
            <LogOutIcon className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

export function BarraSuperiorMovil({ nombre }: { nombre: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-marino px-4 text-white md:hidden">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/marca-blanca.png" alt="" width={607} height={436} className="h-auto w-9" />
        <span className="text-[0.95rem] font-semibold">Dr. Elías Chirinos</span>
      </Link>
      <form action={cerrarSesion}>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-[0.8125rem] text-marino-texto hover:bg-marino-claro hover:text-white"
          aria-label={`Cerrar sesión de ${nombre}`}
        >
          <LogOutIcon className="size-4" aria-hidden />
          Salir
        </button>
      </form>
    </header>
  );
}

export function NavegacionInferior({ items }: { items: ItemNav[] }) {
  const pathname = usePathname();
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-superficie pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icono = ICONOS[item.icono];
          const esActivo = activo(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={esActivo ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-xs text-grafito-suave",
                  esActivo && "font-semibold text-marino",
                )}
              >
                <span className="relative">
                  <Icono className="size-5" aria-hidden />
                  {item.aviso ? (
                    <span className="cifras absolute -top-1.5 -right-3 min-w-5 rounded-full bg-rojo px-1 text-center text-[0.6875rem] leading-[18px] font-semibold text-white">
                      {item.aviso}
                    </span>
                  ) : null}
                </span>
                {item.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
