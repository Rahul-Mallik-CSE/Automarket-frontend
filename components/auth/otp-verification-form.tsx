/** @format */

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationFormProps {
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
  onVerifyOtp: (data: { email: string; otp: string }) => Promise<void>;
  onResendOtp?: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function OTPVerificationForm({
  email,
  onVerifySuccess,
  onBack,
  onVerifyOtp,
  onResendOtp,
  isLoading = false,
  error = "",
}: OTPVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return;
    }

    try {
      await onVerifyOtp({ email, otp });
      onVerifySuccess();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleResendOtp = async () => {
    if (!onResendOtp || !canResend) return;

    setIsResending(true);
    try {
      await onResendOtp(email);
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtp(""); // Clear current OTP
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
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

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-center block">
              Enter verification code
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
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

          {/* Timer and Resend */}
          <div className="text-center space-y-2">
            {!canResend ? (
              <p className="text-sm text-muted-foreground">
                Code expires in{" "}
                <span className="font-mono font-medium text-foreground">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                {onResendOtp && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="p-0 h-auto"
                  >
                    {isResending ? "Sending..." : "Resend verification code"}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
