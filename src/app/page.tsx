import { redirect } from "next/navigation";
import { getSesion, puede } from "@/lib/sesion";

export default async function Inicio() {
  const sesion = await getSesion();
  if (puede(sesion, "citas.ver")) redirect("/agenda");
  if (puede(sesion, "pacientes.ver")) redirect("/pacientes");
  redirect("/sin-acceso");
}
