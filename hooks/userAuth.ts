/** @format */

"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useLoginMutation } from "@/redux/features/authAPI";
import { RootState } from "@/redux/store";

// Define User type based on your API response
export type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
};

export type Profile = {
  id: number;
  user: number;
  full_name: string;
  email: string;
  profile_picture: string | null;
  phone_number: string | null;
  address: string | null;
  joined_date: string;
};

export interface UserState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initial state
const initialState: UserState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false, // Changed to false to prevent hydration mismatch
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User; profile: Profile }>
    ) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    initializeAuth: (state) => {
      // Check cookies for existing auth data
      if (typeof window !== "undefined") {
        try {
          // Helper function to get cookie value
          const getCookie = (name: string): string | null => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
              return parts.pop()?.split(";").shift() || null;
            }
            return null;
          };

          const storedUser = getCookie("user");
          const storedProfile = getCookie("profile");
          const accessToken = getCookie("access_token");

          if (storedUser && accessToken) {
            state.user = JSON.parse(decodeURIComponent(storedUser));
            state.isAuthenticated = true;
          }
          if (storedProfile) {
            state.profile = JSON.parse(decodeURIComponent(storedProfile));
          }
        } catch (error) {
          console.error(
            "Failed to parse stored auth data from cookies:",
            error
          );
          // Clear corrupted cookies
          const expireDate = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
          document.cookie = `user=; path=/; ${expireDate};`;
          document.cookie = `profile=; path=/; ${expireDate};`;
          document.cookie = `access_token=; path=/; ${expireDate};`;
          document.cookie = `refresh_token=; path=/; ${expireDate};`;
        }
        state.isLoading = false;
      }
    },
  },
});

// Export actions
export const { setUser, clearUser, setLoading, initializeAuth } =
  userSlice.actions;
export const userReducer = userSlice.reducer;

// Custom hook for authentication
export function useAuth() {
  const dispatch = useDispatch();
  const { user, profile, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  // Initialize auth on first load (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    try {
      // Clear any existing cookies before attempting login
      if (typeof window !== "undefined") {
        const expireDate = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie = `access_token=; path=/; ${expireDate};`;
        document.cookie = `refresh_token=; path=/; ${expireDate};`;
        document.cookie = `user=; path=/; ${expireDate};`;
        document.cookie = `profile=; path=/; ${expireDate};`;
        document.cookie = `user_role=; path=/; ${expireDate};`;
      }

      const result = await loginMutation({ email, password }).unwrap();

      if (result?.success && result?.data) {
        // Store tokens and user data in cookies only
        if (typeof window !== "undefined") {
          // Determine if we're in a secure context (HTTPS or localhost)
          const isSecureContext =
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

          // Set cookies with conditional secure flag
          const secureFlag = isSecureContext ? "; secure" : "";
          const sameSiteFlag = isSecureContext
            ? "; samesite=strict"
            : "; samesite=lax";

          // Compute expires dates
          const now = new Date();
          const accessExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
          const refreshExpires = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          ); // +30 days

          const accessExpiresStr = `; expires=${accessExpires.toUTCString()}`;
          const refreshExpiresStr = `; expires=${refreshExpires.toUTCString()}`;

          // Encode user and profile data for cookie storage
          const userEncoded = encodeURIComponent(
            JSON.stringify(result.data.user)
          );
          const profileEncoded = encodeURIComponent(
            JSON.stringify(result.data.profile)
          );

          // Set cookies (access token expires in 1 day)
          document.cookie =
            `access_token=${result.data.access_token}; path=/` +
            accessExpiresStr +
            secureFlag +
            sameSiteFlag;
          document.cookie =
            `refresh_token=${result.data.refresh_token}; path=/` +
            refreshExpiresStr +
            secureFlag +
            sameSiteFlag;
          document.cookie =
            `user_role=${result.data.user.role}; path=/` +
            accessExpiresStr +
            secureFlag +
            sameSiteFlag;
          document.cookie =
            `user=${userEncoded}; path=/` +
            accessExpiresStr +
            secureFlag +
            sameSiteFlag;
          document.cookie =
            `profile=${profileEncoded}; path=/` +
            accessExpiresStr +
            secureFlag +
            sameSiteFlag;
        }

        // Update Redux state
        dispatch(
          setUser({
            user: result.data.user,
            profile: result.data.profile,
          })
        );
      } else {
        throw new Error(result?.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error?.data?.message || error?.message || "Login failed");
    }
  };

  const logout = () => {
    // Clear cookies only (no localStorage)
    if (typeof window !== "undefined") {
      // Clear cookies for all possible configurations
      const expireDate = "expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Clear without secure flag
      document.cookie = `access_token=; path=/; ${expireDate};`;
      document.cookie = `refresh_token=; path=/; ${expireDate};`;
      document.cookie = `user_role=; path=/; ${expireDate};`;
      document.cookie = `user=; path=/; ${expireDate};`;
      document.cookie = `profile=; path=/; ${expireDate};`;

      // Also clear with secure flag in case they were set with it
      document.cookie = `access_token=; path=/; secure; ${expireDate};`;
      document.cookie = `refresh_token=; path=/; secure; ${expireDate};`;
      document.cookie = `user_role=; path=/; secure; ${expireDate};`;
      document.cookie = `user=; path=/; secure; ${expireDate};`;
      document.cookie = `profile=; path=/; secure; ${expireDate};`;
    }

    dispatch(clearUser());
  };

  return {
    user,
    profile,
    isAuthenticated,
    loading: isLoading || isLoggingIn,
    signIn,
    logout,
  };
}
