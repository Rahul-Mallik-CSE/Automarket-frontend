/** @format */

import { configureStore } from "@reduxjs/toolkit";
import baseApi from "./api/baseAPI";
import { userReducer } from "@/hooks/userAuth";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
