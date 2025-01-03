import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header";
import SessionProvider from "@/components/sessionProvider";
import { ThemeProvider } from "next-themes";
import CustomSidebar from "@/components/sidebar";
import { CartProvider } from "@/context/useCart";
const inter = localFont({
  src: "./fonts/Inter_Regular.ttf",
  variable: "--font-inter",
  display: 'swap',
  weight: "400",
});

export const metadata: Metadata = {
  title: "Compute App",
  description: "GPU renting and AI model serving platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable}`}
    >
      <body
        className={`
          font-sans 
          antialiased
        `}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>

            {/* <SidebarProvider> */}
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
                  <div className="h-full w-0  dark:w-[0.5px] opacity-0 dark:opacity-100 dark:bg-black"></div>
                  <main className={`flex-1 bg-white dark:bg-black`}>
                    {children}
                  </main>
                  <div>
                  </div>
                </div>
              </div>
            {/* </SidebarProvider> */}
            </CartProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}