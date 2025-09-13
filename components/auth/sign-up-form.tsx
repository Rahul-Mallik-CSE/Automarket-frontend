/** @format */

"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  useRegisterMutation,
  useCreateOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/authAPI";
import { OTPVerificationForm } from "./otp-verification-form";

export function SignUpForm() {
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [createOtp, { isLoading: isCreatingOtp }] = useCreateOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const registerData = {
        full_name: name,
        email: email,
        password: password,
        confirm_password: confirmPassword,
      };

      const result = await register(registerData).unwrap();

      if (result?.success) {
        setSuccessMessage(
          "Registration successful! Please check your email for the OTP."
        );
        setStep("otp");
      } else {
        setError(result?.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error?.data?.message || error?.message || "Failed to create account"
      );
    }
  };

  const handleVerifyOtp = async (data: { email: string; otp: string }) => {
    setError("");

    try {
      const result = await verifyOtp(data).unwrap();

      if (result?.success) {
        setSuccessMessage(
          "Email verified successfully! Redirecting to sign in..."
        );
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      } else {
        setError(
          result?.message || "OTP verification failed. Please try again."
        );
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(
        error?.data?.message || error?.message || "Failed to verify OTP"
      );
    }
  };

  const handleResendOtp = async (email: string) => {
    setError("");

    try {
      const result = await createOtp({ email }).unwrap();

      if (result?.success) {
        setSuccessMessage("New OTP sent successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(
        error?.data?.message || error?.message || "Failed to resend OTP"
      );
    }
  };

  const handleBackToSignUp = () => {
    setStep("signup");
    setError("");
    setSuccessMessage("");
  };

  const handleVerifySuccess = () => {
    setError("");
    setSuccessMessage("Email verified successfully! Redirecting to sign in...");
  };

  // Show OTP verification form
  if (step === "otp") {
    return (
      <div className="space-y-4">
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <OTPVerificationForm
          email={email}
          onVerifySuccess={handleVerifySuccess}
          onBack={handleBackToSignUp}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          isLoading={isVerifyingOtp}
          error={error}
        />
      </div>
    );
  }

  // Show registration form
  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create a BluBerry account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isRegistering}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isRegistering}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isRegistering}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isRegistering}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
