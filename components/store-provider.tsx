"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "@/store"
import { useAppDispatch } from "@/store/hooks"
import { getStoredToken, hydrateAuth } from "@/store/slices/auth-slice"
import { getTenantFromHostname, setTenant } from "@/store/slices/tenant-slice"

function StoreBootstrap({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const hostname = window.location.hostname
        const slug = getTenantFromHostname(hostname)

        dispatch(
            setTenant({
                slug,
                hostname,
            })
        )
        dispatch(hydrateAuth({ token: getStoredToken() }))
        document.title = slug ? `${slug} | Manuvem` : "Manuvem"
    }, [dispatch])

    return children
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <StoreBootstrap>{children}</StoreBootstrap>
        </Provider>
    )
}
