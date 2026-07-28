import { createApi } from "@reduxjs/toolkit/query/react"
import {
    baseQueryWithUnwrap,
    type PaginatedPayload,
} from "@/store/api/base-query"

export type Tenant = {
    id: string
    name: string
    domains: string[]
}

export type TenantPayload = {
    id: string
    name: string
    domains: string[]
}

export type FindTenantsParams = {
    id?: string
    query?: string
    page?: number
    per_page?: number
}

export type PaginatedTenants = PaginatedPayload<Tenant>

export const tenantsApi = createApi({
    reducerPath: "tenantsApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Tenants", "Tenant"],
    endpoints: (builder) => ({
        findTenants: builder.query<PaginatedTenants, FindTenantsParams | void>({
            query: (params) => ({
                url: "/api/tenants",
                params: {
                    id: params?.id,
                    page: params?.page ?? 1,
                    per_page: params?.per_page ?? 15,
                    ...(params?.query ? { query: params.query } : {}),
                },
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: "Tenant", id } as const)),
                          { type: "Tenants", id: "LIST" },
                      ]
                    : [{ type: "Tenants", id: "LIST" }],
        }),

        findTenant: builder.query<Tenant, string>({
            query: (id) => `/api/tenants/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Tenant", id }],
        }),

        createTenant: builder.mutation<Tenant, TenantPayload>({
            query: (body) => ({
                url: "/api/tenants",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Tenants", id: "LIST" }],
        }),

        updateTenant: builder.mutation<Tenant, { id: string; body: TenantPayload }>({
            query: ({ id, body }) => ({
                url: `/api/tenants/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Tenants", id: "LIST" },
                { type: "Tenant", id },
            ],
        }),

        deleteTenant: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/tenants/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Tenants", id: "LIST" },
                { type: "Tenant", id },
            ],
        }),
    }),
})

export const {
    useFindTenantsQuery,
    useLazyFindTenantQuery,
    useCreateTenantMutation,
    useUpdateTenantMutation,
    useDeleteTenantMutation,
} = tenantsApi
