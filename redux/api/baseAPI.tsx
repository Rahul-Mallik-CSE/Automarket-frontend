/** @format */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        // If we have a token set it in the headers
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }

      return headers;
    },
  }),

  tagTypes: [
    "Profile",
    "Privacy",
    "AboutUs",
    "Auth",
    "Contact",
    "Review",
    "Service",
    "SellItem",
  ],
  endpoints: () => ({}),
});

export default baseApi;
