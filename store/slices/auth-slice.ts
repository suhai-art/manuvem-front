import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

const TOKEN_KEY = "auth_token"

export type AuthUser = {
    id: string | number
    email: string
    name?: string
    role?: string
    status?: string
    tenant: string
    [key: string]: unknown
}

type AuthState = {
    token: string | null
    user: AuthUser | null
    hydrated: boolean
}

const initialState: AuthState = {
    token: null,
    user: null,
    hydrated: false,
}

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
}

export function persistToken(token: string | null) {
    if (typeof window === "undefined") return
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials(
            state,
            action: PayloadAction<{ token: string; user?: AuthUser | null }>
        ) {
            state.token = action.payload.token
            state.user = action.payload.user ?? state.user
            persistToken(action.payload.token)
        },
        setUser(state, action: PayloadAction<AuthUser | null>) {
            state.user = action.payload
        },
        hydrateAuth(state, action: PayloadAction<{ token: string | null }>) {
            state.token = action.payload.token
            state.hydrated = true
        },
        logout(state) {
            state.token = null
            state.user = null
            persistToken(null)
        },
    },
})

export const { setCredentials, setUser, hydrateAuth, logout } =
    authSlice.actions
export default authSlice.reducer
