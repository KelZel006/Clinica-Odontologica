import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

/** Encabezado de página: título, contexto opcional y acciones a la derecha. */
export function Encabezado({
  titulo,
  detalle,
  volver,
  children,
}: {
  titulo: React.ReactNode;
  detalle?: React.ReactNode;
  volver?: { href: string; etiqueta: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-linea px-4 pt-5 pb-4 sm:px-6">
      {volver && (
        <Link
          href={volver.href}
          className="-ml-1 mb-2 inline-flex items-center gap-1 text-[0.8125rem] text-grafito-suave hover:text-grafito"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          {volver.etiqueta}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-balance sm:text-2xl">{titulo}</h1>
          {detalle && <div className="mt-1 text-[0.8125rem] text-grafito-suave">{detalle}</div>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
