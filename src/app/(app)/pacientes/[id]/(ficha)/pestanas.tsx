"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

export function Pestanas({ pacienteId }: { pacienteId: string }) {
  const pathname = usePathname();
  const base = `/pacientes/${pacienteId}`;
  const items = [
    { href: base, etiqueta: "Ficha" },
    { href: `${base}/odontograma`, etiqueta: "Odontograma" },
    { href: `${base}/notas`, etiqueta: "Notas clínicas" },
    { href: `${base}/archivos`, etiqueta: "Archivos" },
  ];

  return (
    <nav aria-label="Secciones del paciente" className="overflow-x-auto border-b border-linea px-4 sm:px-6">
      <ul className="flex gap-1">
        {items.map((item) => {
          const activo = item.href === base ? pathname === base : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center px-3 text-sm whitespace-nowrap text-grafito-suave transition-colors hover:text-grafito",
                  activo && "font-semibold text-marino after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-marino",
                )}
              >
                {item.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
