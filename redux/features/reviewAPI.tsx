/** @format */

import baseApi from "../api/baseAPI";

const reviewAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit review
    submitReview: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/submit-review/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Review"],
    }),

    // Get all reviews (if you have a GET endpoint in the future)
    getReviews: builder.query<any, void>({
      query: () => ({
        url: `/auth/reviews/`,
        method: "GET",
      }),
      providesTags: ["Review"],
    }),
  }),
});

export const { useSubmitReviewMutation, useGetReviewsQuery } = reviewAPI;

export default reviewAPI;
