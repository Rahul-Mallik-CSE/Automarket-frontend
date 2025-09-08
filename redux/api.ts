/** @format */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Example endpoint
    example: builder.query<{ message: string }, void>({
      query: () => "/check-page-loading",
    }),
  }),
});

export const { useExampleQuery } = api;
