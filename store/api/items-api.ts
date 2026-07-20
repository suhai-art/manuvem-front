import { createApi } from "@reduxjs/toolkit/query/react"
import {
    baseQueryWithUnwrap,
    type PaginatedPayload,
} from "@/store/api/base-query"

export type Item = {
    id: string
    internal_code: string
    name: string
    description: string
    default_unit_price: string | number
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type ItemPayload = {
    internal_code: string
    name: string
    description: string
    default_unit_price: number
}

export type FindItemsParams = {
    page?: number
    per_page?: number
    query?: string
}

export type PaginatedItems = PaginatedPayload<Item>

export const itemsApi = createApi({
    reducerPath: "itemsApi",
    baseQuery: baseQueryWithUnwrap,
    tagTypes: ["Items", "Item"],
    endpoints: (builder) => ({
        findItems: builder.query<PaginatedItems, FindItemsParams | void>({
            query: (params) => ({
                url: "/api/items",
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
                              type: "Item" as const,
                              id,
                          })),
                          { type: "Items", id: "LIST" },
                      ]
                    : [{ type: "Items", id: "LIST" }],
        }),

        findItem: builder.query<Item, string>({
            query: (id) => `/api/items/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Item", id }],
        }),

        createItem: builder.mutation<Item, ItemPayload>({
            query: (body) => ({
                url: "/api/items",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Items", id: "LIST" }],
        }),

        updateItem: builder.mutation<Item, { id: string; body: ItemPayload }>({
            query: ({ id, body }) => ({
                url: `/api/items/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Items", id: "LIST" },
                { type: "Item", id },
            ],
        }),

        deleteItem: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/items/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Items", id: "LIST" },
                { type: "Item", id },
            ],
        }),

        toggleItemActive: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/api/items/${id}/toggle-active`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Items", id: "LIST" },
                { type: "Item", id },
            ],
        }),
    }),
})

export const {
    useFindItemsQuery,
    useFindItemQuery,
    useLazyFindItemQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
    useToggleItemActiveMutation,
} = itemsApi
