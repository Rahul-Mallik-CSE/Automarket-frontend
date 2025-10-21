/** @format */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// List of endpoints that should NOT include authentication
const publicEndpoints = [
  "/auth/login/",
  "/auth/register/",
  "/auth/otp/create/",
  "/auth/otp/verify/",
  "/auth/password-reset/request/",
  "/auth/reset/otp-verify/",
  "/auth/password-reset/confirm/",
];

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { endpoint, getState }) => {
    // Check if this is a public endpoint that doesn't need auth
    const url = (endpoint as any)?.url || "";
    const isPublicEndpoint = publicEndpoints.some((publicUrl) =>
      url.includes(publicUrl)
    );

    // Only add token for non-public endpoints
    if (!isPublicEndpoint && typeof window !== "undefined") {
      // Get token from cookies instead of localStorage
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };

      const token = getCookie("access_token");

      // If we have a token set it in the headers
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});

// Custom base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error and have a refresh token, try to refresh
  if (result.error && result.error.status === 401) {
    if (typeof window !== "undefined") {
      // Helper function to get cookie value
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };

      // Helper function to set cookie
      const setCookie = (name: string, value: string, expires: Date) => {
        const isSecureContext =
          window.location.protocol === "https:" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const secureFlag = isSecureContext ? "; secure" : "";
        const sameSiteFlag = isSecureContext
          ? "; samesite=strict"
          : "; samesite=lax";
        document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}${secureFlag}${sameSiteFlag}`;
      };

      const refreshToken = getCookie("refresh_token");

      // Check if this is a token expiration error (not invalid credentials)
      const errorData = result.error.data as any;
      const isTokenExpired =
        errorData?.code === "token_not_valid" ||
        errorData?.detail?.includes("expired");

      if (refreshToken && isTokenExpired) {
        // Try to refresh the token
        const refreshResult = await baseQuery(
          {
            url: "/auth/token/refresh/",
            method: "POST",
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Store the new tokens in cookies
          const data = refreshResult.data as any;
          const now = new Date();
          const accessExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day

          setCookie("access_token", data.access, accessExpires);

          // If a new refresh token is provided, update it
          if (data.refresh) {
            const refreshExpires = new Date(
              now.getTime() + 30 * 24 * 60 * 60 * 1000
            ); // +30 days
            setCookie("refresh_token", data.refresh, refreshExpires);
          }

          // Retry the original request with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, clear auth cookies and redirect to login
          const expireDate = "Thu, 01 Jan 1970 00:00:01 GMT";
          document.cookie = `access_token=; path=/; expires=${expireDate};`;
          document.cookie = `refresh_token=; path=/; expires=${expireDate};`;
          document.cookie = `user=; path=/; expires=${expireDate};`;
          document.cookie = `profile=; path=/; expires=${expireDate};`;
          document.cookie = `user_role=; path=/; expires=${expireDate};`;

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Profile",
    "Privacy",
    "AboutUs",
    "Auth",
    "Contact",
    "Review",
    "Service",
    "SellItem",
    "AdminStats",
    "AdminActivities",
  ],
  endpoints: () => ({}),
});

export default baseApi;
