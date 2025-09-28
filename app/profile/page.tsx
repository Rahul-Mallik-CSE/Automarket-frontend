/** @format */

"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/userAuth";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/features/userAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user profile data
  const { data: profileData, isLoading, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  // Form state for editing
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
  });

  // Update form data when profile data is loaded
  React.useEffect(() => {
    if (profileData?.data?.profile) {
      setFormData({
        full_name: profileData.data.profile.full_name || "",
        phone_number: profileData.data.profile.phone_number || "",
        address: profileData.data.profile.address || "",
      });
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImageFile(null);
    setPreviewImageUrl(null);
    setError("");
    setSuccess("");
    // Reset form data to original values
    if (profileData?.data?.profile) {
      setFormData({
        full_name: profileData.data.profile.full_name || "",
        phone_number: profileData.data.profile.phone_number || "",
        address: profileData.data.profile.address || "",
      });
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const updateData = new FormData();
      updateData.append("full_name", formData.full_name);
      updateData.append("phone_number", formData.phone_number || "");
      updateData.append("address", formData.address || "");

      if (profileImageFile) {
        updateData.append("profile_picture", profileImageFile);
      }

      const result = await updateProfile(updateData).unwrap();

      if (result?.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setProfileImageFile(null);
        setPreviewImageUrl(null);
        refetch(); // Refresh profile data

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result?.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setError(
        error?.data?.message || error?.message || "Failed to update profile"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profile = profileData?.data?.profile;
  const userData = profileData?.data?.user;

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Link
        href="/admin"
        className="flex flex-row items-center text-xl mb-4 text-black hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go back to admin
      </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={previewImageUrl || profile?.profile_picture || ""}
                      alt={profile?.full_name || "Profile"}
                    />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profile?.full_name || "No Name"}
                  </h3>
                  <p className="text-muted-foreground">{userData?.email}</p>
                  {userData?.is_verified && (
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="full_name"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded-md">
                      {profile?.full_name || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="p-2 bg-muted rounded-md text-muted-foreground">
                    {userData?.email}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone_number"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded-md">
                      {profile?.phone_number || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Joined Date (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined Date
                  </Label>
                  <p className="p-2 bg-muted rounded-md text-muted-foreground">
                    {profile?.joined_date
                      ? format(new Date(profile.joined_date), "PPP")
                      : "Unknown"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter your address"
                    rows={3}
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md min-h-[80px]">
                    {profile?.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
