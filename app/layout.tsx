'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from './context/CartContext';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/header';
import CustomSidebar from "@/components/sidebar";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <div className="flex flex-col w-full">
                {/* Header is always at the top */}
                <nav className="flex w-full">
                  <Header />
                </nav>
                <div className="h-[1px] w-full bg-gray-250"></div>
                {/* Sidebar and content */}
                <div className="flex flex-row flex-1">
                  <div className="bg-gray-950/10 max-h-full">
                    <CustomSidebar />
                  </div>
                  <div className="h-full w-0 dark:w-[0.5px] opacity-0 dark:opacity-100 dark:bg-black"></div>
                  <main className={`flex-1 bg-white dark:bg-black`}>
                    {children}
                  </main>
                </div>
              </div>
            </CartProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}