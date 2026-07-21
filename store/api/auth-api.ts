import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithUnwrap } from "@/store/api/base-query"
import { itemsApi } from "@/store/api/items-api"
import { usersApi } from "@/store/api/users-api"
import {
    logout,
    setCredentials,
    setUser,
    type AuthUser,
} from "@/store/slices/auth-slice"

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    token: string
    user?: AuthUser
}

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Auth", "Me"],
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: "/api/auth/login",
                method: "POST",
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(
                        setCredentials({
                            token: data.token,
                            user: data.user ?? null,
                        })
                    )
                } catch {}
            },
            invalidatesTags: ["Me"],
        }),

        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled
                } finally {
                    dispatch(logout())
                    dispatch(authApi.util.resetApiState())
                    dispatch(itemsApi.util.resetApiState())
                    dispatch(usersApi.util.resetApiState())
                }
            },
        }),

        me: builder.query<AuthUser, void>({
            query: () => "/api/auth/me",
            providesTags: ["Me"],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setUser(data))
                } catch {}
            },
        }),
    }),
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useMeQuery,
    useLazyMeQuery,
} = authApi
