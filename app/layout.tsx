"use client";

import { useEffect } from "react";
import { Montserrat } from "next/font/google";
import { Provider } from "react-redux";
import { useDispatch } from "react-redux";
import { store } from "@/store/store";
import { loginSuccess } from "@/store/userSlice";
import "./globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch(loginSuccess(user));
        } catch (error) {
          console.error('Ошибка парсинга пользователя:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, [dispatch]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <Provider store={store}>
          <AuthInitializer />
          {children}
        </Provider>
      </body>
    </html>
  );
}