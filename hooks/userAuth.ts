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
  isLoading: true,
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
      // Check localStorage for existing auth data
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          const storedProfile = localStorage.getItem("profile");
          const accessToken = localStorage.getItem("access_token");

          if (storedUser && accessToken) {
            state.user = JSON.parse(storedUser);
            state.isAuthenticated = true;
          }
          if (storedProfile) {
            state.profile = JSON.parse(storedProfile);
          }
        } catch (error) {
          console.error("Failed to parse stored auth data:", error);
          // Clear corrupted data
          localStorage.removeItem("user");
          localStorage.removeItem("profile");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
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

  // Initialize auth on first load
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();

      if (result?.success && result?.data) {
        // Store tokens and user data
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("refresh_token", result.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("profile", JSON.stringify(result.data.profile));

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
    // Clear local storage and state (no API call needed)
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
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
