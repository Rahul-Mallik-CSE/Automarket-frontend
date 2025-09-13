/** @format */

import baseApi from "../api/baseAPI";

const userAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<any, void>({
      query: () => ({
        url: `/auth/profile/`,
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/profile/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Profile", "Auth"],
    }),
  }),
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userAPI;

export default userAPI;
