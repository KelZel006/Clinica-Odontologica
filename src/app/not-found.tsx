import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <main className="flex min-h-[60dvh] flex-1 items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">No encontramos esta página</h1>
        <p className="mt-2 text-sm text-grafito-suave">
          Puede que el enlace esté incompleto o que el registro ya no exista.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
          Ir a la agenda
        </Link>
      </div>
    </main>
  );
}
