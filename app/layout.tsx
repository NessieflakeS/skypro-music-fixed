import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import StoreProvider from "@/components/providers/StoreProvider/StoreProvider";
import AuthInitializer from "@/components/providers/AuthInitializer/AuthInitializer";
import AppLayout from "@/components/layout/AppLayout/Layout";
import "./globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Music App",
  description: "Слушайте музыку онлайн",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <StoreProvider>
          <AuthInitializer />
          <AppLayout>
            {children}
          </AppLayout>
        </StoreProvider>
      </body>
    </html>
  );
}