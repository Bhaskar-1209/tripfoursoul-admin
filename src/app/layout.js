import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AdminRequestBlocker from "@/components/AdminRequestBlocker";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TripForSoul Admin",
  description: "Admin Panel for TripForSoul",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <AdminRequestBlocker />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#059669", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
