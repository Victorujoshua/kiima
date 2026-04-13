import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kiima — Send love, support dreams",
  description: "Gift your favourite creators. Support pools. Give in love.",
  openGraph: {
    siteName: "Kiima",
    title: "Kiima — Send love, support dreams",
    description: "Gift your favourite creators. Support pools. Give in love.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
