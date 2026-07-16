import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Provider } from "react-redux"
import { store } from "@/store"

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
})

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

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
                <Provider store={store}>
                    <ThemeProvider>{children}</ThemeProvider>
                </Provider>
            </body>
        </html>
    )
}
