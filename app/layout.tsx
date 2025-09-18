import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "MiTicaje - Sistema de Control Horario",
  description: "Sistema de fichaje horario conforme al Real Decreto-ley 8/2019",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MiTicaje",
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#18517A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MiTicaje" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="MiTicaje" />
        <meta name="msapplication-TileColor" content="#18517A" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Permitir rotación solo en tablets */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const isTablet = () => {
                  const userAgent = navigator.userAgent.toLowerCase();
                  const isTabletUA = /tablet|ipad|playbook|silk/i.test(userAgent);
                  const isLargeScreen = window.screen.width >= 768 && window.screen.width <= 1024;
                  const isTouchDevice = 'ontouchstart' in window;
                  return isTabletUA || (isLargeScreen && isTouchDevice);
                };
                
                if (!isTablet()) {
                  // Para móviles, mantener orientación portrait
                  const viewport = document.querySelector('meta[name="viewport"]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, orientation=portrait');
                  }
                }
              })();
            `,
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
