// Teléfonos en formato E.164 (+50499998888), igual que en la tabla pacientes.

/** Normaliza lo que escribe recepción: "9999-8888", "+504 9999 8888", "50499998888". */
export function normalizarTelefono(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 8) return `+504${digitos}`;
  if (digitos.length === 11 && digitos.startsWith("504")) return `+${digitos}`;
  if (valor.trim().startsWith("+") && digitos.length >= 8) return `+${digitos}`;
  return null;
}

/** +50499998888 → 9999-8888 (o el número completo si es extranjero). */
export function mostrarTelefono(e164: string) {
  const m = /^\+504(\d{4})(\d{4})$/.exec(e164);
  return m ? `${m[1]}-${m[2]}` : e164;
}

export function enlaceWhatsApp(e164: string) {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}
