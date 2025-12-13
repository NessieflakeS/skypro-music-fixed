"use client";

import { Montserrat } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "../store/store";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}