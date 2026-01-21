import { Montserrat } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Skypro.Music",
  description: "Музыкальный сервис",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}