import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
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
      {/* Inline script prevents flash of wrong theme before hydration */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('kiima-theme');
              if (t === 'dark') document.documentElement.setAttribute('data-theme','dark');
            } catch(e){}
          })();
        `}} />
      </head>
      <body className={plusJakartaSans.variable}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
