import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getProjectName } from "@/infrastructure/actions/systemActions";

export async function generateMetadata(): Promise<Metadata> {
  const projectName = await getProjectName();
  return {
    title: {
      template: `%s | ${projectName}`,
      default: projectName,
    },
    description: "Sistema de gestión y monitoreo IoT premium",
  };
}

import { FilterProvider } from "@/presentation/context/FilterContext";
import { AuthProvider } from "@/presentation/context/AuthContext";
import { SensorProvider } from "@/presentation/context/SensorContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <AuthProvider>
          <FilterProvider>
            <SensorProvider>
              {children}
            </SensorProvider>
          </FilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
