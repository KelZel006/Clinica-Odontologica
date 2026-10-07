import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Clínica Dr. Elías Chirinos", template: "%s · Clínica Dr. Elías Chirinos" },
  description: "Sistema interno de la clínica odontológica del Dr. Elías Renato Chirinos.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b3157",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-HN" className={`${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
