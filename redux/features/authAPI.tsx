/** @format */

import baseApi from "../api/baseAPI";

const authAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Registration endpoint
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/register/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // OTP creation endpoint
    createOtp: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/otp/create/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // OTP verification endpoint
    verifyOtp: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/otp/verify/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Existing endpoints
    updatePassword: builder.mutation({
      query: (data) => ({
        url: `auth/change-password`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    forgetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/forgot-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `/auth/verify-email`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/login/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useCreateOtpMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useUpdatePasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useForgetPasswordMutation,
} = authAPI;

export default authAPI;
