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

// Step 1: Price Estimation Types
export interface EstimateItem {
  title: string;
  description: string;
  condition: string;
  defects: string;
  uploaded_images: string[];
}

export interface EstimateRequest {
  items: EstimateItem[];
}

export interface IndividualProduct {
  temp_product_id: number;
  title: string;
  condition: string;
  estimated_value: number;
  price_range: string;
  confidence_level: string;
  image_count: number;
}

export interface EstimateResponse {
  status: string;
  message: string;
  temp_product_ids: number[];
  products_summary: {
    total_products: number;
    total_estimated_value: number;
    average_condition: string;
    highest_value_item: string;
    processing_completed: boolean;
  };
  individual_products: IndividualProduct[];
  temp_storage: {
    expires_at: string;
    expires_in_hours: number;
    storage_status: string;
  };
  next_step: {
    endpoint: string;
    method: string;
    instruction: string;
    expires_in_hours: number;
  };
}

// Step 2: Contact Submission Types
export interface ContactSubmissionRequest {
  temp_product_ids: number[];
  full_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  pickup_address: string;
  privacy_policy_accepted: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  order: number;
}

export interface SubmittedProduct {
  id: number;
  title: string;
  description: string;
  condition: string;
  defects: string;
  estimated_value: string;
  min_price_range: string;
  max_price_range: string;
  confidence: string;
  final_listing_price: string | null;
  listing_status: string;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ContactSubmissionResponse {
  status: string;
  message: string;
  submission_id: number;
  submission_data: {
    id: number;
    batch_status: string;
    full_name: string;
    email: string;
    phone: string;
    pickup_date: string;
    pickup_address: string;
    privacy_policy_accepted: boolean;
    products: SubmittedProduct[];
    total_items: number;
    total_estimated_value: number;
    created_at: string;
    updated_at: string;
  };
  summary: {
    batch_id: number;
    contact_name: string;
    email: string;
    total_items: number;
    total_estimated_value: number;
    pickup_date: string;
    batch_status: string;
    created_at: string;
  };
  next_steps: {
    admin_review: string;
    notification: string;
    tracking: string;
  };
}

export const sellItemAPI = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Get price estimates and temp product IDs
    getItemEstimates: builder.mutation<EstimateResponse, EstimateRequest>({
      query: (estimateData) => ({
        url: "/items/estimate/",
        method: "POST",
        body: estimateData,
      }),
      invalidatesTags: ["PublicSubmission"],
    }),

    // Step 2: Submit contact info with temp product IDs
    submitContactInfo: builder.mutation<
      ContactSubmissionResponse,
      ContactSubmissionRequest
    >({
      query: (contactData) => ({
        url: "/submissions/contact-only/",
        method: "POST",
        body: contactData,
      }),
      invalidatesTags: ["PublicSubmission"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetItemEstimatesMutation, useSubmitContactInfoMutation } =
  sellItemAPI;
