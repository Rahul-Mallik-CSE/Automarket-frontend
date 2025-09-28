/** @format */

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/userAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setRedirecting(true);
        // Redirect to sign-in with return URL
        router.push(
          `/auth/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`
        );
      } else if (user?.role !== "admin") {
        setRedirecting(true);
        // Redirect non-admin users to home with error message
        router.push("/?error=insufficient-permissions");
      }
    }
  }, [isAuthenticated, loading, router, user?.role]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-slate-600" />
            </div>
            <CardTitle className="text-xl text-slate-900">
              Admin Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Verifying Access
            </h3>
            <p className="text-sm text-slate-600 text-center">
              Please wait while we verify your admin credentials...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Redirecting...
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Taking you to the appropriate page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-900">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-red-700">
              You must be signed in to access the admin portal
            </p>
            <Button
              onClick={() => router.push("/auth/sign-in")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-orange-900">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-orange-700">
                Admin privileges required to access this area
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-orange-600">Current role:</span>
                <Badge
                  variant="outline"
                  className="text-orange-700 border-orange-300"
                >
                  {user?.role || "User"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Go Back
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin welcome message briefly before rendering content
  return (
    <div>
      {/* Optional: Add admin header/toolbar here */}
      <div className="hidden">
        <div className="bg-slate-800 text-white px-4 py-2 text-sm">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Welcome, {user?.full_name}</span>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
