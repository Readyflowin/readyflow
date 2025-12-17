import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 👇 UPDATED IMPORTS: Your existing Header/Footer
import { SiteHeader } from "@/components/ui/layout/SiteHeader";
import { SiteFooter } from "@/components/ui/layout/SiteFooter";

// 👇 NEW: Import the Auth Provider we just created
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReadyFlow Tools",
  description: "Tools generally used by developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* FIX: Added 'suppressHydrationWarning' */}
      <body className={inter.className} suppressHydrationWarning>
        
        {/* 👇 WRAP EVERYTHING IN AUTH PROVIDER */}
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            {/* Header */}
            <SiteHeader />
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <SiteFooter />
          </div>
        </AuthProvider>
        
      </body>
    </html>
  );
}