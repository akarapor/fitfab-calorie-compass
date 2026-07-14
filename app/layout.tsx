import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const title = "FitFab Calorie Compass — คำนวณ BMR และ TDEE";
  const description = "โปรแกรมจาก FitFab สำหรับคำนวณ BMR, TDEE และเป้าพลังงานรายบุคคล พร้อมคำแนะนำการกินและออกกำลังกายที่นำไปใช้ได้จริง";
  return {
    metadataBase: base,
    title,
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: new URL("/og-fitfab.png", base), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [new URL("/og-fitfab.png", base)] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
