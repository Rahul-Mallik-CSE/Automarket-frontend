/** @format */

import baseApi from "../api/baseAPI";

// Types for admin API responses
export interface AdminDashboardStats {
  total_products: number;
  pending_products: number;
  approved_products: number;
  listed_products: number;
  not_listed_products: number;
  sold_products: number;
  total_revenue: number;
}

export interface ProductImage {
  id: number;
  is_primary: boolean;
  order: number;
  url: string;
}

export interface ProductItem {
  title: string;
  description: string;
  condition: string;
  defects: string;
  ebay_listing_id: string | null;
  amazon_listing_id: string | null;
  images: ProductImage[];
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  pickup_date: string;
  pickup_address: string;
}

export interface ProductStatus {
  current: string;
  display: string;
  updated_at: string;
}

export interface ProductPrice {
  estimated_value: number;
  final_price: number;
  final_listing_price: number | null;
  sold_price: number | null;
  min_range: number;
  max_range: number;
}

export interface ProductDate {
  created_at: string;
  updated_at: string;
  sold_at: string | null;
  pickup_date: string;
}

export interface ProductAction {
  action: string;
  label: string;
  button_class: string;
  platform?: string;
}

export interface ProductActions {
  available_actions: ProductAction[];
  endpoint: string;
}

export interface Product {
  id: number;
  item: ProductItem;
  customer: Customer;
  status: ProductStatus;
  price: ProductPrice;
  date: ProductDate;
  actions: ProductActions;
}

export interface AdminActivitiesResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total_count: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    status_summary: Record<string, { count: number; label: string }>;
    filters_applied: {
      status: string | null;
      search: string | null;
      date_from: string | null;
      date_to: string | null;
    };
  };
}

const adminAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard stats
    getDashboardStats: builder.query<AdminDashboardStats, void>({
      query: () => ({
        url: `/admin/dashboard/stats/`,
        method: "GET",
      }),
      providesTags: ["AdminStats"],
    }),

    // Get admin activities/products
    getAdminActivities: builder.query<
      AdminActivitiesResponse,
      {
        page?: number;
        page_size?: number;
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
      }
    >({
      query: (params) => ({
        url: `/admin/dashboard/activities/`,
        method: "GET",
        params,
      }),
      providesTags: ["AdminActivities"],
    }),

    // Update product price
    updateProductPrice: builder.mutation<
      {
        success: boolean;
        message: string;
        product: {
          id: number;
          title: string;
          estimated_value: number;
          final_price: string;
          updated_at: string;
        };
      },
      {
        id: number;
        final_price: string;
      }
    >({
      query: ({ id, final_price }) => ({
        url: `/admin/products/${id}/update-price/`,
        method: "POST",
        body: {
          final_price: final_price, // Keep as string, backend expects string
        },
      }),
      invalidatesTags: ["AdminActivities", "AdminStats"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAdminActivitiesQuery,
  useUpdateProductPriceMutation,
} = adminAPI;

export default adminAPI;
