/** @format */

"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  useRequestPasswordResetMutation,
  useVerifyResetOtpMutation,
  useConfirmPasswordResetMutation,
} from "@/redux/features/authAPI";

type ResetPasswordStep = "request" | "verify" | "reset" | "complete";

export function ResetPasswordComponent() {
  const router = useRouter();

  // API mutations
  const [requestPasswordReset, { isLoading: isRequestingReset }] =
    useRequestPasswordResetMutation();
  const [verifyResetOtp, { isLoading: isVerifyingOtp }] =
    useVerifyResetOtpMutation();
  const [confirmPasswordReset, { isLoading: isConfirming }] =
    useConfirmPasswordResetMutation();

  // State management
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      await requestPasswordReset({ email }).unwrap();
      setSuccess("OTP sent to your email successfully!");
      setCurrentStep("verify");
    } catch (error: any) {
      setError(error?.data?.message || "Failed to send reset email");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await verifyResetOtp({ email, otp }).unwrap();
      setSuccess("OTP verified successfully!");
      setCurrentStep("reset");
    } catch (error: any) {
      setError(error?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      await confirmPasswordReset({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap();
      setSuccess("Password reset successfully!");
      setCurrentStep("complete");
    } catch (error: any) {
      setError(error?.data?.message || "Failed to reset password");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setOtp("");

    try {
      await requestPasswordReset({ email }).unwrap();
      setSuccess("New OTP sent to your email!");
    } catch (error: any) {
      setError(error?.data?.message || "Failed to resend OTP");
    }
  };

  // Step 1: Request Reset
  if (currentStep === "request") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you an OTP to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isRequestingReset}
            >
              {isRequestingReset ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Step 2: Verify OTP
  if (currentStep === "verify") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Enter verification code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isVerifyingOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResendOtp}
                disabled={isRequestingReset}
                className="p-0 h-auto"
              >
                {isRequestingReset ? "Sending..." : "Resend OTP"}
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifyingOtp || otp.length !== 6}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setCurrentStep("request")}
                disabled={isVerifyingOtp}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Reset Password
  if (currentStep === "reset") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Set New Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password for {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p>
                Password must be at least 9 characters long and contain at least
                one uppercase letter, one lowercase letter, and one number.
              </p>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isConfirming}>
                {isConfirming ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setCurrentStep("verify")}
                disabled={isConfirming}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to OTP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Complete
  if (currentStep === "complete") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
          <CardDescription>
            Your password has been successfully reset. You can now sign in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/sign-in")}
          >
            Continue to Sign In
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Don't have an account? Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
