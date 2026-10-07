import { Label } from "@/components/ui/label";

/** Etiqueta + control + ayuda o error, con el espaciado de todos los formularios. */
export function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  opcional,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[0.8125rem] text-grafito">
        {etiqueta}
        {opcional && <span className="font-normal text-grafito-suave">(opcional)</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] text-rojo">
          {error}
        </p>
      ) : ayuda ? (
        <p className="mt-1.5 text-[0.8125rem] text-grafito-suave">{ayuda}</p>
      ) : null}
    </div>
  );
}
