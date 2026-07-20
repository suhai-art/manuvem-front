import { createApi } from "@reduxjs/toolkit/query/react"
import {
    baseQueryWithUnwrap,
    type PaginatedPayload,
} from "@/store/api/base-query"

export type Client = {
    id: string
    name: string
    document: string
    created_at: string
    updated_at: string
}

export type ClientPayload = {
    name: string
    document: string
}

export type FindClientParams = {
    page?: number
    per_page?: number
    query?: string
}

export type PaginatedClient = PaginatedPayload<Client>

export const clientsApi = createApi({
    reducerPath: "clientsApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Clients", "Client"],
    endpoints: (builder) => ({
        findClients: builder.query<PaginatedClient, FindClientParams | void>({
            query: (params) => ({
                url: "/api/clients",
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
                              type: "Client" as const,
                              id,
                          })),
                          { type: "Client", id: "LIST" },
                      ]
                    : [{ type: "Client", id: "LIST" }],
        }),

        findClient: builder.query<Client, string>({
            query: (id) => `/api/clients/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Client", id }],
        }),

        createClient: builder.mutation<Client, ClientPayload>({
            query: (body) => ({
                url: "/api/clients",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Client", id: "LIST" }],
        }),

        updateClient: builder.mutation<
            Client,
            { id: string; body: ClientPayload }
        >({
            query: ({ id, body }) => ({
                url: `/api/clients/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Clients", id: "LIST" },
                { type: "Client", id },
            ],
        }),

        deleteClient: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/clients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Clients", id: "LIST" },
                { type: "Client", id },
            ],
        }),

        toggleClientActive: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/clients/${id}/toggle-active`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Clients", id: "LIST" },
                { type: "Client", id },
            ],
        }),
    }),
})

export const {
    useFindClientsQuery,
    useFindClientQuery,
    useLazyFindClientQuery,
    useCreateClientMutation,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useToggleClientActiveMutation,
} = clientsApi
