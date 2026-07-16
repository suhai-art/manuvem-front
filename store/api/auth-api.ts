import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
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

type ApiEnvelope<T = unknown> = {
    data: T
}

type AuthAwareState = {
    auth: { token: string | null }
    tenant: { slug: string | null }
}

function getApiBaseUrl(tenant: string | null): string {
    const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL ?? "https"
    const host = process.env.NEXT_PUBLIC_API_HOST ?? ""

    if (!host) {
        return ""
    }

    if (tenant) {
        return `${protocol}://${tenant}.${host}`
    }

    return `${protocol}://${host}`
}

const rawBaseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const state = api.getState() as AuthAwareState
    const tenant = state.tenant.slug

    return fetchBaseQuery({
        baseUrl: getApiBaseUrl(tenant),
        prepareHeaders: (headers) => {
            const token = state.auth.token

            if (token) {
                headers.set("Authorization", `Bearer ${token}`)
            }

            headers.set("Accept", "application/json")
            return headers
        },
    })(args, api, extraOptions)
}

const baseQueryWithUnwrap: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (result.error) {
        return result
    }

    const payload = result.data

    if (payload && typeof payload === "object" && "data" in payload) {
        return {
            ...result,
            data: (payload as ApiEnvelope).data,
        }
    }

    return result
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
