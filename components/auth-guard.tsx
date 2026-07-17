"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useMeQuery } from "@/store/api/auth-api"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/auth-slice"
import { getSafeRedirect } from "@/lib/auth-redirect"
import { AppSidebar } from "@/components/app-sidebar"
import { PathBreadcrumb } from "@/components/path-breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const PUBLIC_PATHS = ["/login"]

function isPublicPathname(pathname: string) {
    return PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { token, user, hydrated } = useAppSelector((state) => state.auth)
    const isPublicPath = isPublicPathname(pathname)

    const { data, isLoading, isFetching, isError, isUninitialized } =
        useMeQuery(undefined, {
            skip: !hydrated || !token,
        })

    const currentUser = user ?? data ?? null
    const isCheckingSession =
        Boolean(token) &&
        !currentUser &&
        !isError &&
        (isLoading || isFetching || isUninitialized)

    useEffect(() => {
        if (!hydrated) return

        if (isPublicPath) {
            if (!token || isCheckingSession) return

            if (currentUser) {
                const params = new URLSearchParams(window.location.search)
                const redirect = getSafeRedirect(params.get("redirect"))
                router.replace(redirect ?? "/dashboard")
            }
            return
        }

        if (isCheckingSession) return

        if (!token || isError || !currentUser) {
            if (token && (isError || !currentUser)) {
                dispatch(logout())
            }

            const search = window.location.search.slice(1)
            const returnTo = search ? `${pathname}?${search}` : pathname
            router.replace(`/login?redirect=${encodeURIComponent(returnTo)}`)
        }
    }, [
        hydrated,
        isCheckingSession,
        isPublicPath,
        token,
        currentUser,
        isError,
        pathname,
        router,
        dispatch,
    ])

    if (isPublicPath) {
        return children
    }

    if (!hydrated || isCheckingSession) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    if (!token || isError || !currentUser) {
        return null
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <PathBreadcrumb />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
