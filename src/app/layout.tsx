import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Nav } from "@/components/layout/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B1 Deutsch — telc Exam Practice",
  description: "Practice for the telc Deutsch B1 exam",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <Nav />
          <main className="md:pl-64 pb-16 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
