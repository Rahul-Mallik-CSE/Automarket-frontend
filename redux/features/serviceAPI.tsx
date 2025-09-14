/** @format */

import baseApi from "../api/baseAPI";

const serviceAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit service request
    requestService: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/request-service/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const { useRequestServiceMutation } = serviceAPI;

export default serviceAPI;
