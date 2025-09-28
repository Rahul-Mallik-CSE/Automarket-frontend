/** @format */

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/userAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallbackUrl = "/auth/sign-in",
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setRedirecting(true);
      router.push(fallbackUrl);
    } else if (
      !loading &&
      isAuthenticated &&
      requireAdmin &&
      user?.role !== "admin"
    ) {
      setRedirecting(true);
      router.push("/"); // Redirect non-admin users to home
    }
  }, [isAuthenticated, loading, router, requireAdmin, user?.role, fallbackUrl]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading...
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Please wait while we verify your authentication
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Redirecting...
            </h3>
            <p className="text-sm text-gray-600 text-center">
              You will be redirected to the sign-in page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized message for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Lock className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              You need to be signed in to access this page
            </p>
            <Button onClick={() => router.push(fallbackUrl)} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show insufficient permissions for admin-required routes
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ShieldAlert className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Insufficient Permissions
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              You don't have the required permissions to access this page
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
