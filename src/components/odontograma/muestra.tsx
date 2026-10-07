import { cn } from "cn";
import { CONDICIONES, type Condicion } from "./datos";

/** Muestra de color de una condición, igual a como se dibuja en el odontograma. */
export function Muestra({ condicion, className }: { condicion: Condicion; className?: string }) {
  const meta = CONDICIONES[condicion];
  if (condicion === "ausente" || condicion === "extraccion_indicada") {
    return (
      <svg viewBox="0 0 14 14" className={cn("size-3.5 shrink-0", className)} aria-hidden>
        <path d="M3 3l8 8M11 3l-8 8" stroke={condicion === "ausente" ? "#586777" : meta.color} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  }
  if (condicion === "otro") {
    return <span aria-hidden className={cn("size-3.5 shrink-0 rounded-full border-[1.5px] border-dashed", className)} style={{ borderColor: meta.color }} />;
  }
  return (
    <span
      aria-hidden
      className={cn("size-3.5 shrink-0 rounded-[3px] border", className)}
      style={{ background: meta.color, borderColor: condicion === "sano" ? "#c3cdd8" : meta.color }}
    />
  );
}
