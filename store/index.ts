import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { authApi } from "@/store/api/auth-api"
import { itemsApi } from "@/store/api/items-api"
import { clientsApi } from "@/store/api/clients-api"
import { usersApi } from "@/store/api/users-api"
import authReducer from "@/store/slices/auth-slice"
import tenantReducer from "@/store/slices/tenant-slice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tenant: tenantReducer,
        [authApi.reducerPath]: authApi.reducer,
        [itemsApi.reducerPath]: itemsApi.reducer,
        [clientsApi.reducerPath]: clientsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            itemsApi.middleware,
            clientsApi.middleware,
            usersApi.middleware
        ),
})

setupListeners(store.dispatch)

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
