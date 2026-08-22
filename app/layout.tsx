import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Long Run — Small Game Lab",
  description: "A five-chapter arcade adventure starring Mara Vale.",
  applicationName: "The Long Run",
  appleWebApp: { capable: true, title: "The Long Run", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: "cover", themeColor: "#08090b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-dvh overscroll-none bg-[#08090b]">{children}</body></html>;
}
