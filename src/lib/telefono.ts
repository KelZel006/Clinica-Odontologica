// Teléfonos hondureños de 8 dígitos, guardados como +504XXXXXXXX (igual que en la base de datos,
// que rechaza cualquier otro formato).

/** Normaliza lo que escribe recepción: "9999-8888", "+504 9999 8888", "50499998888". */
export function normalizarTelefono(valor: string) {
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length === 11 && digitos.startsWith("504")) digitos = digitos.slice(3);
  return digitos.length === 8 ? `+504${digitos}` : null;
}

/** +50499998888 → 9999-8888. */
export function mostrarTelefono(e164: string) {
  const m = /^\+504(\d{4})(\d{4})$/.exec(e164);
  return m ? `${m[1]}-${m[2]}` : e164;
}

export function enlaceWhatsApp(e164: string) {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}
