const fmt = new Intl.NumberFormat("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const lempiras = (monto: number) => `L ${fmt.format(monto)}`;
