import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Small Game Lab — Small games. Big distribution.",
  description: "Independent game studio building tiny games with obsessive execution.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}