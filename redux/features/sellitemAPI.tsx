/** @format */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/redux/api/baseAPI";

// Create a separate API for public endpoints that don't require authentication
export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      // Explicitly don't add Authorization header for public endpoints
      console.log("Public API base URL:", process.env.NEXT_PUBLIC_API_URL);
      return headers;
    },
  }),
  tagTypes: ["PublicSubmission"],
  endpoints: () => ({}),
});

// Types based on the demo data structure
export interface ProductImage {
  id?: number;
  image: string;
  is_primary: boolean;
  order: number;
}

export interface Product {
  id?: number;
  title: string;
  description: string;
  condition: string;
  defects: string;
  estimated_value?: string;
  listing_status?: string;
  images: ProductImage[];
  created_at?: string;
}

export interface SubmissionRequest {
  full_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  pickup_address: string;
  privacy_policy_accepted: boolean;
  products: {
    title: string;
    description: string;
    condition: string;
    defects: string;
    uploaded_images: string[];
  }[];
}

export interface SubmissionResponse {
  id: number;
  batch_status: string;
  full_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  pickup_address: string;
  privacy_policy_accepted: boolean;
  total_items: number;
  total_estimated_value: string;
  products: Product[];
  created_at: string;
}

export interface GetSubmissionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SubmissionResponse[];
}

export const sellItemAPI = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit multiple items for sale
    submitItems: builder.mutation<SubmissionResponse, SubmissionRequest>({
      query: (submissionData) => ({
        url: "/submissions/",
        method: "POST",
        body: submissionData,
      }),
      invalidatesTags: ["PublicSubmission"],
    }),
  }),
  overrideExisting: false,
});

export const { useSubmitItemsMutation } = sellItemAPI;
