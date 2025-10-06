/** @format */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PenLine, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/userAuth";
import {
  useGetDashboardStatsQuery,
  useGetAdminActivitiesQuery,
  useUpdateProductPriceMutation,
  useUpdateProductStatusMutation,
  type Product,
} from "@/redux/features/adminAPI";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Simple types
interface ItemSubmission {
  id: string;
  item_name: string;
  item_description: string;
  item_issues: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: "pending" | "approved" | "rejected" | "listed";
  ebay_status: string | null; // Primary field for eBay listing status
  submission_date: string;
  image_url: string | string[] | null;
  estimated_price: number | null;
  item_condition: string;
  ebay_listing_id: string | null;
  listed_on_ebay: boolean | null;
}

// Demo data for preview with multiple images
const DEMO_SUBMISSIONS: ItemSubmission[] = [
  {
    id: "1",
    item_name: "iPhone 14 Pro Max",
    item_description:
      "Excellent condition iPhone 14 Pro Max, 256GB, Space Black. Minor scratches on the back but screen is perfect.",
    item_issues: "Small scratch on back camera",
    full_name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    status: "approved",
    ebay_status: "listed",
    submission_date: "2024-01-15T10:30:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=iPhone+Front",
      "/placeholder.svg?height=300&width=300&text=iPhone+Back",
      "/placeholder.svg?height=300&width=300&text=iPhone+Side",
    ],
    estimated_price: 899,
    item_condition: "Excellent",
    ebay_listing_id: "123456789",
    listed_on_ebay: true,
  },
  {
    id: "2",
    item_name: "MacBook Air M2",
    item_description:
      "2022 MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Used for light work, excellent performance.",
    item_issues: null,
    full_name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    status: "pending",
    ebay_status: null,
    submission_date: "2024-01-14T14:20:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=MacBook+Closed",
      "/placeholder.svg?height=300&width=300&text=MacBook+Open",
      "/placeholder.svg?height=300&width=300&text=MacBook+Keyboard",
      "/placeholder.svg?height=300&width=300&text=MacBook+Ports",
    ],
    estimated_price: 1099,
    item_condition: "Like New",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "3",
    item_name: "iPad Pro 12.9 inch",
    item_description:
      "iPad Pro with Apple Pencil and Magic Keyboard. Perfect for creative work and productivity.",
    item_issues: "Minor wear on corners",
    full_name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, Chicago, IL 60601",
    status: "approved",
    ebay_status: "processing",
    submission_date: "2024-01-13T09:15:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=iPad+Front",
      "/placeholder.svg?height=300&width=300&text=iPad+Accessories",
    ],
    estimated_price: 799,
    item_condition: "Good",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "4",
    item_name: "Sony WH-1000XM4 Headphones",
    item_description:
      "Premium noise-canceling headphones in excellent condition. Includes original case and cables.",
    item_issues: null,
    full_name: "Emily Chen",
    email: "emily.chen@email.com",
    phone: "+1 (555) 321-0987",
    address: "321 Elm St, Seattle, WA 98101",
    status: "rejected",
    ebay_status: null,
    submission_date: "2024-01-12T16:45:00Z",
    image_url: "/placeholder.svg?height=300&width=300&text=Sony+Headphones", // Single image
    estimated_price: 249,
    item_condition: "Excellent",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "5",
    item_name: "Nintendo Switch OLED",
    item_description:
      "Nintendo Switch OLED model with Joy-Con controllers. Includes dock and all original accessories.",
    item_issues: "Joy-Con drift on left controller",
    full_name: "Alex Rodriguez",
    email: "alex.r@email.com",
    phone: "+1 (555) 654-3210",
    address: "654 Maple Dr, Austin, TX 73301",
    status: "approved",
    ebay_status: "unlisted",
    submission_date: "2024-01-11T11:30:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=Switch+Console",
      "/placeholder.svg?height=300&width=300&text=Switch+Dock",
      "/placeholder.svg?height=300&width=300&text=Joy+Cons",
      "/placeholder.svg?height=300&width=300&text=Switch+Screen",
      "/placeholder.svg?height=300&width=300&text=Accessories",
    ],
    estimated_price: 299,
    item_condition: "Good",
    ebay_listing_id: "987654321",
    listed_on_ebay: false,
  },
];
import { ToastContainer, toast } from "react-toastify";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ItemSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const { user, profile, logout } = useAuth();

  // Fetch dashboard stats from API
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery();

  // Fetch admin activities/products from API
  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useGetAdminActivitiesQuery({
    page: 1,
    page_size: 20,
  });

  // Update product price mutation
  const [updateProductPrice, { isLoading: isPriceUpdating }] =
    useUpdateProductPriceMutation();

  // Update product status mutation
  const [updateProductStatus, { isLoading: isStatusUpdating }] =
    useUpdateProductStatusMutation();

  // Check if we're in preview mode (no environment variables)
  useEffect(() => {
    const hasSupabaseConfig =
      typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_SUPABASE_URL &&
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasSupabaseConfig) {
      setIsPreviewMode(true);
      setIsAuthenticated(true); // Auto-authenticate in preview
      setSubmissions(DEMO_SUBMISSIONS);
      setLoading(false);
    }
  }, []);

  // Check authentication on mount (only in production)
  useEffect(() => {
    if (isPreviewMode) return;

    if (typeof window !== "undefined") {
      const authStatus = localStorage.getItem("adminAuthenticated");
      if (authStatus === "true") {
        setIsAuthenticated(true);
      }
    }
  }, [isPreviewMode]);

  // Handle password authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2923939") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("adminAuthenticated", "true");
      }
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuthenticated");
    }
  };

  // Helper function to check if item is listed on eBay
  const isListedOnEbay = (item: ItemSubmission): boolean => {
    return (
      item.ebay_status === "listed" ||
      item.ebay_status === "active" ||
      item.ebay_status === "processing"
    );
  };

  // Helper function to get eBay status display
  const getEbayStatusDisplay = (item: ItemSubmission): string => {
    if (!item.ebay_status) return "Not Listed";
    return item.ebay_status.charAt(0).toUpperCase() + item.ebay_status.slice(1);
  };

  // Fetch submissions (only in production)
  useEffect(() => {
    if (!isAuthenticated || isPreviewMode) return;

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import to avoid build errors in preview
        const { createClient } = await import("@supabase/supabase-js");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase configuration");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error: fetchError } = await supabase
          .from("sell_items")
          .select("*")
          .order("submission_date", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setSubmissions(data || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch submissions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [isAuthenticated, isPreviewMode]);

  // Update submission status
  const updateStatus = async (
    id: number,
    newStatus: "pending" | "approved" | "rejected" | "listed"
  ) => {
    if (isPreviewMode) {
      // Demo mode - just update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === String(id) ? { ...item, status: newStatus } : item
        )
      );
      return;
    }

    try {
      setActionLoading(id);

      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase configuration");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("sell_items")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === String(id) ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast(
        "Failed to update status: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle approve action
  const handleApprove = async (productId: number) => {
    try {
      setActionLoading(productId);

      const result = await updateProductStatus({
        id: productId,
        action: "approve",
      }).unwrap();

      // Refetch activities to get updated data
      refetchActivities();

      toast(`Product approved successfully! ${result.message}`);
    } catch (err: any) {
      console.error("Error approving product:", err);

      let errorMessage = "Failed to approve product";
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast(`Failed to approve: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject action
  const handleReject = async (productId: number) => {
    try {
      setActionLoading(productId);

      const result = await updateProductStatus({
        id: productId,
        action: "reject",
      }).unwrap();

      // Refetch activities to get updated data
      refetchActivities();

      toast(`Product rejected successfully! ${result.message}`);
    } catch (err: any) {
      console.error("Error rejecting product:", err);

      let errorMessage = "Failed to reject product";
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast(`Failed to reject: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle list on platform action
  const handleListOnPlatform = async (product: Product) => {
    // Use final_listing_price if available, otherwise use final_price
    const priceToUse =
      product.price.final_listing_price || product.price.final_price;

    if (!priceToUse) {
      toast("Please set a final price before listing the product");
      return;
    }

    try {
      setActionLoading(product.id);

      const result = await updateProductStatus({
        id: product.id,
        action: "list",
        final_price: priceToUse.toString(),
      }).unwrap();

      // Refetch activities to get updated data
      refetchActivities();

      toast(`Product listed successfully! ${result.message}`);
    } catch (err: any) {
      console.error("Error listing product:", err);

      let errorMessage = "Failed to list product";
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast(`Failed to list: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unlist action
  const handleUnlist = async (productId: number) => {
    try {
      setActionLoading(productId);

      const result = await updateProductStatus({
        id: productId,
        action: "unlist",
      }).unwrap();

      // Refetch activities to get updated data
      refetchActivities();

      toast(`Product unlisted successfully! ${result.message}`);
    } catch (err: any) {
      console.error("Error unlisting product:", err);

      let errorMessage = "Failed to unlist product";
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast(`Failed to unlist: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete action (for rejected, sold, or removed products)
  const handleDelete = async (productId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(productId);

      // Call your delete API endpoint here
      // For now, we'll just show an toast
      toast(
        "Delete functionality will be implemented with the delete API endpoint"
      );

      // Refetch activities to get updated data
      // refetchActivities();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast("Failed to delete product");
    } finally {
      setActionLoading(null);
    }
  };

  // Open price edit modal
  const handleEditPrice = (product: Product) => {
    setEditingProduct(product);
    setNewPrice(
      product.price.final_listing_price?.toString() ||
        product.price.final_price.toString()
    );
    setAdminNotes("");
    setShowPriceEditModal(true);
  };

  // Handle price update submission
  const handlePriceUpdate = async () => {
    if (!editingProduct || !newPrice) {
      toast("Please enter a valid price");
      return;
    }

    // Validate price is a positive number
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast("Please enter a valid positive price");
      return;
    }

    try {
      console.log("Updating price for product:", {
        id: editingProduct.id,
        final_price: newPrice,
      });

      const result = await updateProductPrice({
        id: editingProduct.id,
        final_price: newPrice,
      }).unwrap();

      console.log("Price update response:", result);

      // Close modal and reset state
      setShowPriceEditModal(false);
      setEditingProduct(null);
      setNewPrice("");
      setAdminNotes("");

      // Refetch activities to get updated data
      refetchActivities();

      toast(`Price updated successfully! ${result.message}`);
    } catch (err: any) {
      console.error("Error updating price:", err);

      // Enhanced error handling
      let errorMessage = "Failed to update price";

      if (err?.data) {
        // If there's a data property, try to extract error details
        if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.error) {
          errorMessage = err.data.error;
        } else if (err.data.message) {
          errorMessage = err.data.message;
        } else if (typeof err.data === "string") {
          errorMessage = err.data;
        } else {
          errorMessage = JSON.stringify(err.data);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast(`Failed to update price: ${errorMessage}`);
    }
  };

  // Parse image URLs from various formats
  const parseImageUrls = (imageData: string | string[] | null): string[] => {
    if (!imageData) return [];

    if (Array.isArray(imageData)) {
      return imageData.filter((url) => url && url.trim());
    }

    if (typeof imageData === "string") {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          return parsed.filter((url) => url && url.trim());
        }
        return [imageData].filter((url) => url && url.trim());
      } catch {
        // If not JSON, check if it's comma-separated
        if (imageData.includes(",")) {
          return imageData
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url);
        }
        return [imageData].filter((url) => url && url.trim());
      }
    }

    return [];
  };

  // Get first image URL for table display
  const getFirstImageUrl = (imageData: string | string[] | null): string => {
    const urls = parseImageUrls(imageData);
    return urls.length > 0
      ? urls[0]
      : "/placeholder.svg?height=80&width=80&text=No+Image";
  };

  // Get image count for display
  const getImageCount = (imageData: string | string[] | null): number => {
    return parseImageUrls(imageData).length;
  };

  // Get status badge style
  const getStatusStyle = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      listed: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return (
      styles[status as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  // Get eBay status badge style
  const getEbayStatusStyle = (ebayStatus: string | null) => {
    if (!ebayStatus) return "bg-gray-100 text-gray-800 border-gray-300";

    const styles = {
      listed: "bg-green-100 text-green-800 border-green-300",
      active: "bg-green-100 text-green-800 border-green-300",
      processing: "bg-orange-100 text-orange-800 border-orange-300",
      unlisted: "bg-red-100 text-red-800 border-red-300",
      ended: "bg-yellow-100 text-yellow-800 border-yellow-300",
      sold: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return (
      styles[ebayStatus.toLowerCase() as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <ToastContainer />
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            {isPreviewMode && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Preview Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">
              {dashboardStats?.total_products || submissions.length} total
              submissions
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-10 w-10 rounded-full hover:bg-gray-700"
                >
                  <User className="h-8 w-8 text-white font-bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      {profile?.full_name || user.full_name || user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>
                      Sign out
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/sign-in">Sign In</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {statsLoading ? (
            // Loading skeleton for stats
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full p-3 mr-4 animate-pulse">
                    <div className="w-6 h-6"></div>
                  </div>
                  <div>
                    <div className="bg-gray-300 h-4 w-20 rounded animate-pulse mb-2"></div>
                    <div className="bg-gray-300 h-6 w-12 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : statsError ? (
            // Error state
            <div className="col-span-5 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Failed to load dashboard stats</p>
            </div>
          ) : (
            // Real stats data or fallback to demo data
            [
              {
                label: "Total Products",
                count: dashboardStats?.total_products || submissions.length,
                color: "bg-blue-600",
              },
              {
                label: "Pending Review",
                count:
                  dashboardStats?.pending_products ||
                  submissions.filter((s) => s.status === "pending").length,
                color: "bg-yellow-600",
              },
              {
                label: "Approved",
                count:
                  dashboardStats?.approved_products ||
                  submissions.filter((s) => s.status === "approved").length,
                color: "bg-green-600",
              },
              {
                label: "Listed Products",
                count:
                  dashboardStats?.listed_products ||
                  submissions.filter((s) => isListedOnEbay(s)).length,
                color: "bg-purple-600",
              },
              {
                label: "Not Listed",
                count:
                  dashboardStats?.not_listed_products ||
                  submissions.filter((s) => !isListedOnEbay(s)).length,
                color: "bg-gray-600",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-full p-3 mr-4`}>
                    <div className="w-6 h-6 text-white font-bold flex items-center justify-center">
                      {stat.count}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Product Submissions</h2>
          </div>

          {activitiesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : activitiesError ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error loading products</p>
              <button
                onClick={() => refetchActivities()}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : !activitiesData?.data?.products ||
            activitiesData.data.products.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No products found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activitiesData.data.products.map((product) => {
                    // Get primary image
                    const primaryImage =
                      product.item.images.find((img) => img.is_primary) ||
                      product.item.images[0];

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        {/* Primary Image */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <img
                              src={
                                primaryImage?.url ||
                                "/placeholder.svg?height=80&width=80&text=No+Image"
                              }
                              alt={product.item.title}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder.svg?height=80&width=80&text=Error";
                              }}
                            />
                            {product.item.images.length > 1 && (
                              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {product.item.images.length}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Item Info */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {product.item.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate mt-1">
                              {product.item.description.length > 50
                                ? product.item.description.substring(0, 50) +
                                  "..."
                                : product.item.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Condition: {product.item.condition}
                            </div>
                            {product.item.defects &&
                              product.item.defects !== "None" && (
                                <div className="text-xs text-red-600 mt-1 truncate">
                                  Issues: {product.item.defects}
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.customer.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {product.customer.phone}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              product.status.current === "PENDING"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : product.status.current === "APPROVED"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : product.status.current === "LISTED"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : product.status.current === "EBAY_SOLD" ||
                                        product.status.current === "AMAZON_SOLD"
                                      ? "bg-purple-100 text-purple-800 border-purple-300"
                                      : "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                          >
                            {product.status.display}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-medium text-blue-600">
                            Listed Price: $
                            {product.price.final_price.toFixed(2)}{" "}
                            {/* price edit button */}
                            <Button
                              onClick={() => handleEditPrice(product)}
                              className="h-6 w-6 bg-transparent hover:bg-gray-200 text-black"
                            >
                              <PenLine />
                            </Button>
                          </div>
                          <div className="text-xs text-gray-900">
                            Estimated: $
                            {product.price.estimated_value.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Range: ${product.price.min_range.toFixed(2)} - $
                            {product.price.max_range.toFixed(2)}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {new Date(
                              product.date.created_at
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Pickup:{" "}
                            {new Date(
                              product.customer.pickup_date
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 flex-wrap">
                            {/* Status-based action buttons */}
                            {product.status.current === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                >
                                  {actionLoading === product.id
                                    ? "Loading..."
                                    : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleReject(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === product.id
                                    ? "Loading..."
                                    : "Reject"}
                                </button>
                              </>
                            )}

                            {product.status.current === "REJECTED" && (
                              <button
                                disabled={true}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                {actionLoading === product.id
                                  ? "Loading..."
                                  : "Rejected"}
                              </button>
                            )}

                            {product.status.current === "APPROVED" && (
                              <button
                                onClick={() => handleListOnPlatform(product)}
                                disabled={actionLoading === product.id}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                {actionLoading === product.id
                                  ? "Loading..."
                                  : "List on Platform"}
                              </button>
                            )}

                            {product.status.current === "LISTED" && (
                              <button
                                onClick={() => handleUnlist(product.id)}
                                disabled={actionLoading === product.id}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:opacity-50"
                              >
                                {actionLoading === product.id
                                  ? "Loading..."
                                  : "Unlist"}
                              </button>
                            )}

                            {product.status.current === "EBAY_SOLD" && (
                              <>
                                <button
                                  disabled={true}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs opacity-50 cursor-not-allowed"
                                >
                                  Listed on eBay
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === product.id
                                    ? "Loading..."
                                    : "Delete"}
                                </button>
                              </>
                            )}

                            {product.status.current === "AMAZON_SOLD" && (
                              <>
                                <button
                                  disabled={true}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs opacity-50 cursor-not-allowed"
                                >
                                  Listed on Amazon
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  disabled={actionLoading === product.id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === product.id
                                    ? "Loading..."
                                    : "Delete"}
                                </button>
                              </>
                            )}

                            {product.status.current === "REMOVED" && (
                              <button
                                onClick={() => handleListOnPlatform(product)}
                                disabled={actionLoading === product.id}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                {actionLoading === product.id
                                  ? "Loading..."
                                  : "List on Platform"}
                              </button>
                            )}

                            {/* View Details button - always shown */}
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setSelectedImageIndex(0); // Reset to first image
                              }}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product Details Modal with Image Gallery */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">
                  {selectedProduct.item.title}
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {(() => {
                    const images = selectedProduct.item.images || [];
                    if (images.length === 0) {
                      return (
                        <Image
                          src="/placeholder.svg?height=400&width=400&text=No+Image"
                          alt={selectedProduct.item.title}
                          width={400}
                          height={400}
                          className="rounded-lg object-cover w-full"
                        />
                      );
                    }

                    // Sort images by order, with primary image first if no order specified
                    const sortedImages = [...images].sort((a, b) => {
                      if (a.is_primary && !b.is_primary) return -1;
                      if (!a.is_primary && b.is_primary) return 1;
                      return a.order - b.order;
                    });

                    return (
                      <>
                        {/* Main Image */}
                        <div className="relative">
                          <Image
                            src={
                              sortedImages[selectedImageIndex]?.url ||
                              "/placeholder.svg"
                            }
                            alt={`${selectedProduct.item.title} - Image ${selectedImageIndex + 1}`}
                            width={400}
                            height={400}
                            className="rounded-lg object-cover w-full h-80"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=400&width=400&text=Image+Error";
                            }}
                          />
                          {sortedImages.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                              {selectedImageIndex + 1} / {sortedImages.length}
                            </div>
                          )}

                          {/* Navigation Arrows */}
                          {sortedImages.length > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setSelectedImageIndex(
                                    selectedImageIndex === 0
                                      ? sortedImages.length - 1
                                      : selectedImageIndex - 1
                                  )
                                }
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedImageIndex(
                                    selectedImageIndex ===
                                      sortedImages.length - 1
                                      ? 0
                                      : selectedImageIndex + 1
                                  )
                                }
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>

                        {/* Image Thumbnails */}
                        {sortedImages.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {sortedImages.map((imageObj, index) => (
                              <button
                                key={imageObj.id}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${
                                  selectedImageIndex === index
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <Image
                                  src={imageObj.url || "/placeholder.svg"}
                                  alt={`${selectedProduct.item.title} - Thumbnail ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="object-cover w-20 h-20"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/placeholder.svg?height=80&width=80&text=Error";
                                  }}
                                />
                                {imageObj.is_primary && (
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    ★
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedProduct.customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedProduct.customer.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedProduct.customer.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedProduct.customer.pickup_address}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Pickup Date:</span>{" "}
                        {new Date(
                          selectedProduct.customer.pickup_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Item Details
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Title:</span>{" "}
                        {selectedProduct.item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span>{" "}
                        {selectedProduct.item.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Condition:</span>{" "}
                        {selectedProduct.item.condition}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Defects:</span>{" "}
                        {selectedProduct.item.defects || "None reported"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Estimated Price:</span> $
                        {selectedProduct.price.estimated_value.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price Range:</span> $
                        {selectedProduct.price.min_range.toFixed(2)} - $
                        {selectedProduct.price.max_range.toFixed(2)}
                      </p>
                      {selectedProduct.price.final_listing_price && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Listed Price:</span> $
                          {selectedProduct.price.final_listing_price.toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span>{" "}
                        {selectedProduct.status.display}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Images:</span>{" "}
                        {selectedProduct.item.images?.length || 0} photo(s)
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(
                          selectedProduct.date.created_at
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Updated:</span>{" "}
                        {new Date(
                          selectedProduct.date.updated_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* eBay listing info could be added here if available in API response */}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedProduct.item.description}
                </p>
              </div>

              {/* Issues */}
              {selectedProduct.item.defects &&
                selectedProduct.item.defects !== "None" && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">
                      Known Issues
                    </h4>
                    <p className="text-sm text-red-600 whitespace-pre-wrap bg-red-50 p-4 rounded-lg border border-red-200">
                      {selectedProduct.item.defects}
                    </p>
                  </div>
                )}
            </div>

            {/* Modal Actions */}
          </div>
        </div>
      )}

      {/* Price Edit Dialog */}
      <Dialog open={showPriceEditModal} onOpenChange={setShowPriceEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product Price</DialogTitle>
            <DialogDescription>
              Update the final listing price for this product. The price will be
              used when listing on platforms.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {editingProduct.item.title}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Estimated:</span>
                    <span className="ml-2 font-medium">
                      ${editingProduct.price.estimated_value.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Range:</span>
                    <span className="ml-2 font-medium">
                      ${editingProduct.price.min_range.toFixed(2)} - $
                      {editingProduct.price.max_range.toFixed(2)}
                    </span>
                  </div>
                </div>
                {editingProduct.price.final_listing_price && (
                  <div className="text-xs">
                    <span className="text-blue-600">Current Listed Price:</span>
                    <span className="ml-2 font-medium text-blue-700">
                      ${editingProduct.price.final_listing_price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">New Final Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter new price"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Recommended range: $
                  {editingProduct.price.min_range.toFixed(2)} - $
                  {editingProduct.price.max_range.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPriceEditModal(false)}
              disabled={isPriceUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePriceUpdate}
              disabled={isPriceUpdating || !newPrice}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isPriceUpdating ? "Updating..." : "Update Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
