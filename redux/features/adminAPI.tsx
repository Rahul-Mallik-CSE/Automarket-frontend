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
  }),
});

export const { useGetDashboardStatsQuery } = adminAPI;

export default adminAPI;
