import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";

// Select nativo: en tablet y teléfono abre el selector del sistema, y funciona dentro de
// formularios de Server Actions sin estado en el cliente.
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-input bg-superficie pr-9 pl-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-grafito-suave"
      />
    </div>
  );
}

export { NativeSelect };
