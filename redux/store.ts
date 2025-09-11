/** @format */

import { configureStore } from "@reduxjs/toolkit";
import baseApi from "./api/baseAPI";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
