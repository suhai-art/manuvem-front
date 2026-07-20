import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

type AuthAwareState = {
    auth: { token: string | null }
    tenant: { slug: string | null }
}

export type PaginationMeta = {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

export type PaginatedPayload<T> = {
    data: T[]
    meta: PaginationMeta
}

type SuccessEnvelope = {
    success: true
    data: unknown
    meta?: PaginationMeta
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

function isSuccessEnvelope(payload: object): payload is SuccessEnvelope {
    return (
        "success" in payload &&
        (payload as { success: unknown }).success === true &&
        "data" in payload
    )
}

function isPaginatedEnvelope(
    payload: SuccessEnvelope
): payload is SuccessEnvelope & { meta: PaginationMeta } {
    return (
        payload.meta !== undefined &&
        typeof payload.meta === "object" &&
        payload.meta !== null &&
        "current_page" in payload.meta
    )
}

export const rawBaseQuery: BaseQueryFn<
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

/**
 * Unwraps `{ success: true, data }` envelopes.
 * Paginated responses keep `{ data, meta }`.
 */
export const baseQueryWithUnwrap: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (result.error) {
        return result
    }

    const payload = result.data

    if (payload && typeof payload === "object" && isSuccessEnvelope(payload)) {
        if (isPaginatedEnvelope(payload)) {
            return {
                ...result,
                data: {
                    data: payload.data as unknown[],
                    meta: payload.meta,
                },
            }
        }

        return {
            ...result,
            data: payload.data,
        }
    }

    return result
}
