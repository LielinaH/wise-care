import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wise Care: Mental Health Care Navigation Platform",
  description: "Find the right path to mental health support - structured intake, care route guidance, and clinician preparation briefs.",
  icons: {
    icon: "/favicon.png",
  },
};

import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
