import { createApi } from "@reduxjs/toolkit/query/react"
import {
    baseQueryWithUnwrap,
    type PaginatedPayload,
} from "@/store/api/base-query"

export type Role = {
    id: number
    name: string
    guard_name: string
    permissions: Permission[]
    created_at: string
    updated_at: string
}

export type Permission = {
    id: number
    name: string
}

export type RolePayload = {
    name: string
    guard_name?: string
    permission: number[]
}

export type FindRolesParams = {
    page?: number
    per_page?: number
    query?: string
}

export type PaginatedRoles = PaginatedPayload<Role>

export type FormOptions = {
    permissions: Permission[]
}

export const rolesApi = createApi({
    reducerPath: "rolesApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Roles", "Role"],
    endpoints: (builder) => ({
        findRoles: builder.query<PaginatedRoles, FindRolesParams | void>({
            query: (params) => ({
                url: "/api/roles",
                params: {
                    page: params?.page ?? 1,
                    per_page: params?.per_page ?? 15,
                    ...(params?.query ? { query: params.query } : {}),
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ id }) => ({
                              type: "Role" as const,
                              id,
                          })),
                          { type: "Roles", id: "LIST" },
                      ]
                    : [{ type: "Roles", id: "LIST" }],
        }),

        findRole: builder.query<Role, number>({
            query: (id) => `/api/roles/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Role", id }],
        }),

        createRole: builder.mutation<Role, RolePayload>({
            query: (body) => ({
                url: "/api/roles",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Roles", id: "LIST" }],
        }),

        updateRole: builder.mutation<Role, { id: number; body: RolePayload }>({
            query: ({ id, body }) => ({
                url: `/api/roles/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Roles", id: "LIST" },
                { type: "Role", id },
            ],
        }),

        deleteRole: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/api/roles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Roles", id: "LIST" },
                { type: "Role", id },
            ],
        }),

        formOptions: builder.query<FormOptions, void>({
            query: () => ({
                url: "/api/roles/form-options",
                method: "GET",
            }),
        }),
    }),
})

export const {
    useFindRolesQuery,
    useFindRoleQuery,
    useLazyFindRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useFormOptionsQuery,
} = rolesApi
