import { Geist_Mono, IBM_Plex_Sans } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { AuthGuard } from "@/components/auth-guard"
import { StoreProvider } from "@/components/store-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
})

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

export const metadata: Metadata = {
    title: {
        default: "Manuvem",
        template: "%s | Manuvem",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="pt-BR"
            suppressHydrationWarning
            className={cn(
                "antialiased",
                fontMono.variable,
                "font-sans",
                ibmPlexSans.variable
            )}
        >
            <body>
                <StoreProvider>
                    <ThemeProvider>
                        <AuthGuard>{children}</AuthGuard>
                    </ThemeProvider>
                </StoreProvider>
            </body>
        </html>
    )
}
