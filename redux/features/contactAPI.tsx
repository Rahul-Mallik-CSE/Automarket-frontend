/** @format */

import baseApi from "../api/baseAPI";

const contactAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit contact form
    submitContact: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/submit-contact/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const { useSubmitContactMutation } = contactAPI;

export default contactAPI;
