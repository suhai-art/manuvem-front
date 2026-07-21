import { createApi } from "@reduxjs/toolkit/query/react"
import {
    baseQueryWithUnwrap,
    type PaginatedPayload,
} from "@/store/api/base-query"

export type User = {
    id: string
    name: string
    email: string
    role: "admin" | "user"
    status: "active" | "inactive"
}

export type UserPayload = {
    name: string
    email: string
    password?: string
    password_confirmation?: string
    role?: "admin" | "user"
    status?: "active" | "inactive"
}

export type FindUsersParams = {
    page?: number
    per_page?: number
    query?: string
}

export type PaginatedUsers = PaginatedPayload<User>

export const usersApi = createApi({
    reducerPath: "usersApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Users", "User"],
    endpoints: (builder) => ({
        findUsers: builder.query<PaginatedUsers, FindUsersParams | void>({
            query: (params) => ({
                url: "/api/users",
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
                              type: "User" as const,
                              id,
                          })),
                          { type: "Users", id: "LIST" },
                      ]
                    : [{ type: "Users", id: "LIST" }],
        }),

        findUser: builder.query<User, string>({
            query: (id) => `/api/users/${id}`,
            providesTags: (_result, _error, id) => [{ type: "User", id }],
        }),

        createUser: builder.mutation<User, UserPayload>({
            query: (body) => ({
                url: "/api/users",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        updateUser: builder.mutation<
            User,
            { id: string; body: UserPayload }
        >({
            query: ({ id, body }) => ({
                url: `/api/users/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Users", id: "LIST" },
                { type: "User", id },
            ],
        }),

        toggleUserActive: builder.mutation<User, string>({
            query: (id) => ({
                url: `/api/users/${id}/toggle-active`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Users", id: "LIST" },
                { type: "User", id },
            ],
        }),

        deleteUser: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Users", id: "LIST" },
                { type: "User", id },
            ],
        }),
    }),
})

export const {
    useFindUsersQuery,
    useFindUserQuery,
    useLazyFindUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useToggleUserActiveMutation,
    useDeleteUserMutation,
} = usersApi
