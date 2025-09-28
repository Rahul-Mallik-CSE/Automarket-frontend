/** @format */

"use client";

import React from "react";
import { ResetPasswordComponent } from "@/components/auth/reset-password";

export default function ResetPasswordTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordComponent />
      </div>
    </div>
  );
}
