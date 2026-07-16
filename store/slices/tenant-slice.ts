import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type TenantState = {
    slug: string | null
    hostname: string | null
}

const initialState: TenantState = {
    slug: null,
    hostname: null,
}

export function getTenantFromHostname(hostname: string): string | null {
    const envTenant = process.env.NEXT_PUBLIC_TENANT
    if (envTenant) {
        return envTenant
    }

    const host = hostname.split(":")[0]?.toLowerCase() ?? ""

    if (!host) {
        return null
    }

    const parts = host.split(".").filter(Boolean)

    const subdomain = parts[0]

    if (!subdomain || subdomain === "www") {
        return null
    }

    return subdomain
}

const tenantSlice = createSlice({
    name: "tenant",
    initialState,
    reducers: {
        setTenant(
            state,
            action: PayloadAction<{ slug: string | null; hostname: string }>
        ) {
            state.slug = action.payload.slug
            state.hostname = action.payload.hostname
        },
        clearTenant(state) {
            state.slug = null
            state.hostname = null
        },
    },
})

export const { setTenant, clearTenant } = tenantSlice.actions
export default tenantSlice.reducer
