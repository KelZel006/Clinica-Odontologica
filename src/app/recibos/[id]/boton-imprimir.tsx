"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonImprimir() {
  return (
    <Button onClick={() => window.print()}>
      <PrinterIcon aria-hidden />
      Imprimir o guardar en PDF
    </Button>
  );
}
