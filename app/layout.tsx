// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { MainNav } from "@/components/navigation/main-nav";
import { Footer } from "@/components/footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
