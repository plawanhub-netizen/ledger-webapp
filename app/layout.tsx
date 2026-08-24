import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

const sansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-thai",
  display: "swap",
});

const serifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "สมุดบัญชี — รายรับรายจ่าย",
  description: "จดรายรับรายจ่ายส่วนตัว ง่าย ปลอดภัย ใช้ได้ทุกที่",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sansThai.variable} ${serifThai.variable}`}>
      <body className="font-sansThai text-ink min-h-screen">{children}</body>
    </html>
  );
}
