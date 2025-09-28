/** @format */

import type React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireAdmin={true}>{children}</ProtectedRoute>;
}
