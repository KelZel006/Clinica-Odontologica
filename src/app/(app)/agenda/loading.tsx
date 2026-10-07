export default function CargandoAgenda() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="Cargando la agenda">
      <div className="border-b border-linea px-4 pt-5 pb-3 sm:px-6">
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex-1 px-4 pt-3 sm:pl-20">
        <div className="h-[36rem] animate-pulse rounded-md border border-linea bg-superficie" />
      </div>
    </div>
  );
}
