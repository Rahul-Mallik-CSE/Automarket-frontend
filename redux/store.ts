/** @format */

import { configureStore } from "@reduxjs/toolkit";
import baseApi from "./api/baseAPI";
import { userReducer } from "@/hooks/userAuth";
import { publicApi } from "./features/sellitemAPI";

// Import API endpoints to ensure they're registered
import "./features/sellitemAPI";
import "./features/adminAPI";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, publicApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
