// DNI hondureño: 13 dígitos. Se guarda sin guiones (0801199012345) y se muestra
// como 0801-1990-12345. La base de datos rechaza cualquier otro formato.

/** Acepta "0801-1990-12345" o "0801199012345"; devuelve los 13 dígitos o null. */
export function normalizarDNI(valor: string) {
  const digitos = valor.replace(/[\s-]/g, "");
  return /^\d{13}$/.test(digitos) ? digitos : null;
}

/** 0801199012345 → 0801-1990-12345. */
export function mostrarDNI(dni: string) {
  const m = /^(\d{4})(\d{4})(\d{5})$/.exec(dni);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : dni;
}
