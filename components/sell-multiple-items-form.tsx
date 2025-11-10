/** @format */

"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Package,
  Sparkles,
  Info,
  Calendar,
  Phone,
  Mail,
  User,
  Check,
  X,
  ImageIcon,
  Plus,
  Trash2,
  Copy,
  Wand2,
  DollarSign,
  Camera,
  Upload,
  LinkIcon,
  ExternalLink,
  ShoppingCart,
  Calculator,
  RefreshCw,
} from "lucide-react";
import ContentAnimation from "@/components/content-animation";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetItemEstimatesMutation,
  useSubmitContactInfoMutation,
} from "@/redux/features/sellitemAPI";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getEbayPriceEstimate } from "@/lib/ebay-price-estimator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

interface PhotoItem {
  id: number;
  file: File;
  base64: string;
  previewUrl: string;
  name: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  supabaseUrl?: string;
}

interface FormItem {
  id: string;
  name: string;
  description: string;
  condition: string;
  issues: string;
  photos: PhotoItem[];
  isValid: boolean;
  isExpanded: boolean;
  isLoadingSuggestion: boolean;
  nameSuggestion: string;
  imageUrlInput: string;
  imageUrl?: string;
}

interface SubmitResult {
  success: boolean;
  message: string;
  submissionId?: number;
  userEmailSent?: boolean;
}

export default function SellMultipleItemsForm() {
  const { toast } = useToast();
  const [getItemEstimates, { isLoading: isCalculatingPrices }] =
    useGetItemEstimatesMutation();
  const [
    submitContactInfo,
    { isLoading: isSubmittingAPI, error: submitError },
  ] = useSubmitContactInfoMutation();

  // Form states
  const [formStep, setFormStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Contact information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Price estimates state
  const [priceEstimates, setPriceEstimates] = useState<Record<number, any>>({});
  const [estimateResponse, setEstimateResponse] = useState<any>(null);
  const [tempProductIds, setTempProductIds] = useState<number[]>([]);

  // Items state
  const [items, setItems] = useState<FormItem[]>([
    {
      id: "item-" + Date.now(),
      name: "",
      description: "",
      condition: "",
      issues: "",
      photos: [],
      isValid: false,
      isExpanded: true,
      isLoadingSuggestion: false,
      nameSuggestion: "",
      imageUrlInput: "",
    },
  ]);

  // Additional state for UI
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Validation states
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);

  // Refs
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const formBoxRef = useRef<HTMLFormElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [itemIndexToDuplicate, setItemIndexToDuplicate] = useState<
    number | null
  >(null);
  const [duplicateCount, setDuplicateCount] = useState(1);

  // Utility functions
  const getItems = useCallback(() => items, [items]);

  const scrollToFormTop = useCallback(() => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Format phone number for display as user types
  const formatPhoneNumber = useCallback((value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Format as (123) 456-7890
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  }, []);

  // Handle phone number input change
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      setPhone(formatted);
    },
    [formatPhoneNumber]
  );

  // Format phone number for API
  const formatPhoneForApi = useCallback((phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\s+/g, "").replace(/[()-]/g, "").trim();
    if (!cleaned.startsWith("+")) {
      if (/^\d{10}$/.test(cleaned)) {
        cleaned = `+1${cleaned}`;
      } else if (/^1\d{10}$/.test(cleaned)) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }
    return cleaned;
  }, []);

  // Map condition values for API
  const mapConditionForApi = useCallback((condition: string) => {
    const conditionMap: Record<string, string> = {
      "like-new": "NEW",
      excellent: "EXCELLENT",
      good: "GOOD",
      fair: "FAIR",
      poor: "POOR",
    };
    return conditionMap[condition] || "GOOD";
  }, []);

  // Convert image to base64
  const imageToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // Validate item
  const validateItem = useCallback((item: any) => {
    if (!item) return false;
    const hasPhotos = item.photos && item.photos.length >= 1;
    const hasValidDescription = item.description?.trim();
    return (
      item.name?.trim() !== "" &&
      hasValidDescription &&
      hasPhotos &&
      item.condition !== "" &&
      item.issues?.trim() !== ""
    );
  }, []);

  // Add item
  const addItem = useCallback(() => {
    const newItem = {
      id: "item-" + Date.now(),
      name: "",
      description: "",
      condition: "",
      issues: "",
      photos: [],
      isValid: false,
      isExpanded: true,
      isLoadingSuggestion: false,
      nameSuggestion: "",
      imageUrlInput: "",
    };
    setItems([...items, newItem]);
    toast({
      title: "Item Added",
      description: "A new item has been added to your submission.",
    });
  }, [items, toast]);

  // Remove item
  const removeItem = useCallback(
    (index: number) => {
      if (items.length <= 1) {
        toast({
          title: "Cannot Remove",
          description: "You must have at least one item.",
          variant: "destructive",
        });
        return;
      }
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
      toast({
        title: "Item Removed",
        description: "The item has been removed from your submission.",
      });
    },
    [items, toast]
  );

  // Update item field
  const updateItemField = useCallback(
    (index: number, field: string, value: any) => {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      updatedItems[index].isValid = validateItem(updatedItems[index]);
      setItems(updatedItems);
    },
    [items, validateItem]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const updatedItems = [...items];
      const currentPhotos = updatedItems[index].photos || [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid File",
            description: "Please upload only image files.",
            variant: "destructive",
          });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please upload images smaller than 5MB.",
            variant: "destructive",
          });
          continue;
        }

        try {
          const base64 = await imageToBase64(file);
          const photoObj = {
            id: Date.now() + Math.random(),
            file,
            base64,
            previewUrl: URL.createObjectURL(file),
            name: file.name,
          };
          currentPhotos.push(photoObj);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          toast({
            title: "Upload Error",
            description: "Failed to process image.",
            variant: "destructive",
          });
        }
      }

      updatedItems[index].photos = currentPhotos;
      updatedItems[index].isValid = validateItem(updatedItems[index]);
      setItems(updatedItems);
    },
    [items, imageToBase64, toast, validateItem]
  );

  // Remove photo
  const removePhoto = useCallback(
    (itemIndex: number, photoIndex: number) => {
      const updatedItems = [...items];
      updatedItems[itemIndex].photos.splice(photoIndex, 1);
      updatedItems[itemIndex].isValid = validateItem(updatedItems[itemIndex]);
      setItems(updatedItems);
    },
    [items, validateItem]
  );

  // Handle condition select
  const handleConditionSelect = useCallback(
    (index: number, condition: string) => {
      updateItemField(index, "condition", condition);
    },
    [updateItemField]
  );

  // Toggle item accordion
  const toggleItemAccordion = useCallback(
    (index: number) => {
      const updatedItems = [...items];
      updatedItems[index].isExpanded = !updatedItems[index].isExpanded;
      setItems(updatedItems);
    },
    [items]
  );

  // Handle duplicate click
  const handleDuplicateClick = useCallback((index: number) => {
    setItemIndexToDuplicate(index);
    setDuplicateCount(1);
    setIsDuplicateDialogOpen(true);
  }, []);

  // Confirm duplicate
  const confirmDuplicate = useCallback(() => {
    if (itemIndexToDuplicate !== null && duplicateCount > 0) {
      const itemToDuplicate = items[itemIndexToDuplicate];
      const newItems = [];

      for (let i = 0; i < duplicateCount; i++) {
        newItems.push({
          ...itemToDuplicate,
          id: "item-" + Date.now() + "-" + i,
          isExpanded: false,
        });
      }

      setItems([...items, ...newItems]);
      toast({
        title: "Items Duplicated",
        description: `Created ${duplicateCount} ${duplicateCount === 1 ? "copy" : "copies"} of the item.`,
      });
    }
    setIsDuplicateDialogOpen(false);
    setItemIndexToDuplicate(null);
    setDuplicateCount(1);
  }, [itemIndexToDuplicate, duplicateCount, items, toast]);

  // Validation effects
  useEffect(() => {
    const allItemsValid =
      items.length > 0 && items.every((item) => validateItem(item));
    setStep1Valid(allItemsValid);
  }, [items, validateItem]);

  // Calculate price estimates for all items
  const calculatePriceEstimates = useCallback(async () => {
    // Validate that we have at least one item with required fields
    const validItems = items.filter(
      (item) =>
        item.name?.trim() &&
        item.description?.trim() &&
        item.condition &&
        item.issues?.trim() &&
        item.photos?.length > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description:
          "Please complete all item details before calculating prices.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare items data for price estimation
      const estimateItems = await Promise.all(
        validItems.map(async (item) => {
          const uploaded_images: string[] = [];

          // Convert photos to base64 strings array
          for (const photo of item.photos || []) {
            if (photo.base64) {
              uploaded_images.push(photo.base64);
            }
          }

          return {
            title: item.name || "",
            description: item.description || "",
            condition: mapConditionForApi(item.condition),
            defects: item.issues || "No issues reported",
            uploaded_images,
          };
        })
      );

      const estimateRequest = {
        items: estimateItems,
      };

      console.log("Requesting price estimates:", estimateRequest);

      // Call the price estimation API
      const result = await getItemEstimates(estimateRequest).unwrap();

      console.log("Price estimation result:", result);

      // Store the estimate response and temp product IDs
      setEstimateResponse(result);
      setTempProductIds(result.temp_product_ids);

      // Convert individual products to priceEstimates format for display
      const estimates: Record<number, any> = {};
      result.individual_products.forEach((product: any, index: number) => {
        estimates[index] = {
          price: `$${product.estimated_value}`,
          minPrice: parseFloat(
            product.price_range.split(" - ")[0].replace("$", "")
          ),
          maxPrice: parseFloat(
            product.price_range.split(" - ")[1].replace("$", "")
          ),
          source: "api_estimate",
          confidence: product.confidence_level.toLowerCase(),
          referenceCount: product.image_count,
          temp_product_id: product.temp_product_id,
        };
      });
      setPriceEstimates(estimates);

      toast({
        title: "Price Estimates Calculated!",
        description: `Total estimated value: $${result.products_summary.total_estimated_value}`,
      });
    } catch (error) {
      console.error("Error calculating price estimates:", error);
      toast({
        title: "Error",
        description: "Failed to calculate price estimates. Please try again.",
        variant: "destructive",
      });
    }
  }, [items, mapConditionForApi, getItemEstimates, toast]);

  useEffect(() => {
    setStep2Valid(
      fullName?.trim() !== "" &&
        email?.trim() !== "" &&
        email?.includes("@") &&
        phone?.trim() !== "" &&
        address?.trim() !== "" &&
        pickupDate !== "" &&
        termsAccepted
    );
  }, [fullName, email, phone, address, pickupDate, termsAccepted]);

  // Get step status
  const getStepStatus = useCallback(
    (step: number) => {
      if (formStep > step) return "complete";
      if (formStep === step) return "current";
      return "incomplete";
    },
    [formStep]
  );

  // Handle continue to step 2
  const handleContinueToStep2 = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (step1Valid) {
        setFormStep(2);
        scrollToFormTop();
        // Focus on full name input after transition
        setTimeout(() => {
          fullNameInputRef.current?.focus();
        }, 100);
      }
    },
    [step1Valid, scrollToFormTop]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!step2Valid) return;

      // Validate that price estimates have been calculated
      if (!estimateResponse || !tempProductIds || tempProductIds.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please calculate price estimates before submitting.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        // Ensure pickup date is in the future and in the correct format
        const pickupDateTime = new Date(pickupDate);
        // Set time to 2 PM if no time was specified
        if (
          pickupDateTime.getHours() === 0 &&
          pickupDateTime.getMinutes() === 0
        ) {
          pickupDateTime.setHours(14, 0, 0, 0);
        }

        // Check if the date is in the future
        const now = new Date();
        if (pickupDateTime <= now) {
          // If the selected date is today or in the past, set it to tomorrow at 2 PM
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(14, 0, 0, 0);
          pickupDateTime.setTime(tomorrow.getTime());

          toast({
            title: "Date Adjusted",
            description:
              "Pickup date has been adjusted to tomorrow as it must be in the future.",
            variant: "default",
          });
        }

        // Prepare contact submission data
        const contactSubmissionData = {
          temp_product_ids: tempProductIds,
          full_name: fullName,
          email: email,
          phone: formatPhoneForApi(phone),
          pickup_date: pickupDateTime.toISOString(),
          pickup_address: address,
          privacy_policy_accepted: termsAccepted,
        };

        console.log("Submitting contact data:", contactSubmissionData);

        // Submit contact info with temp product IDs
        const result = await submitContactInfo(contactSubmissionData).unwrap();

        console.log("Contact submission successful:", result);

        // Set success state
        setFormSubmitted(true);
        setSubmitResult({
          success: true,
          message: `Items submitted successfully with ID ${result.submission_id}`,
          submissionId: result.submission_id,
          userEmailSent: true,
        });

        toast({
          title: "Success!",
          description: `Your items have been submitted successfully! Submission ID: ${result.submission_id}`,
        });

        setTimeout(scrollToTop, 50);
      } catch (error) {
        console.error("Error submitting form:", error);
        console.error("Full error object:", JSON.stringify(error, null, 2));

        let errorMessage = "An unexpected error occurred. Please try again.";

        if (error && typeof error === "object" && "data" in error) {
          const apiError = error as any;
          console.error("API Error data:", apiError.data);

          if (apiError.data && apiError.data.message) {
            errorMessage = apiError.data.message;
          } else if (apiError.data && typeof apiError.data === "string") {
            errorMessage = apiError.data;
          } else if (apiError.data) {
            // If data is an object, stringify it for debugging
            errorMessage = `API Error: ${JSON.stringify(apiError.data)}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setSubmitResult({
          success: false,
          message: errorMessage,
        });

        toast({
          title: "Error",
          description: `There was a problem submitting your form: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      step2Valid,
      estimateResponse,
      tempProductIds,
      fullName,
      email,
      phone,
      pickupDate,
      address,
      formatPhoneForApi,
      submitContactInfo,
      toast,
      scrollToTop,
    ]
  );

  // Apply suggestion
  const applySuggestion = useCallback(
    (index: number) => {
      const updatedItems = [...items];
      if (updatedItems[index].nameSuggestion) {
        updatedItems[index].description = updatedItems[index].nameSuggestion;
        updatedItems[index].nameSuggestion = "";
        updatedItems[index].isValid = validateItem(updatedItems[index]);
        setItems(updatedItems);
        toast({
          title: "Suggestion Applied",
          description:
            "The AI suggestion has been applied to your item description.",
        });
      }
    },
    [items, validateItem, toast]
  );

  // Handle image URL input
  const handleImageUrlInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.value;
      updateItemField(index, "imageUrlInput", value);
    },
    [updateItemField]
  );

  // Add image URL
  const addImageUrl = useCallback(
    (index: number) => {
      const updatedItems = [...items];
      const imageUrl = updatedItems[index].imageUrlInput.trim();

      if (imageUrl) {
        updatedItems[index].imageUrl = imageUrl;
        updatedItems[index].imageUrlInput = "";
        updatedItems[index].isValid = validateItem(updatedItems[index]);
        setItems(updatedItems);

        toast({
          title: "Image URL Added",
          description: "The image URL has been added to your item.",
        });
      }
    },
    [items, validateItem, toast]
  );

  // Remove image URL
  const removeImageUrl = useCallback(
    (index: number) => {
      const updatedItems = [...items];
      updatedItems[index].imageUrl = undefined;
      updatedItems[index].isValid = validateItem(updatedItems[index]);
      setItems(updatedItems);

      toast({
        title: "Image URL Removed",
        description: "The image URL has been removed from your item.",
      });
    },
    [items, validateItem, toast]
  );

  // Handle name change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.value;
      // Allow only letters, numbers, spaces, hyphens, commas, periods, and apostrophes
      const sanitizedValue = value.replace(/[^a-zA-Z0-9\s,.\-']/g, "");
      updateItemField(index, "name", sanitizedValue);
    },
    [updateItemField]
  );

  // Handle description change
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      const value = e.target.value;
      updateItemField(index, "description", value);
    },
    [updateItemField]
  );

  // Handle issues change
  const handleIssuesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      const value = e.target.value;
      updateItemField(index, "issues", value);
    },
    [updateItemField]
  );

  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950"
      ref={formContainerRef}
    >
      {/* Add a ref at the top of the form for scrolling */}
      <div ref={formTopRef} className="scroll-target"></div>

      <div className="container mx-auto px-4 py-8 md:py-12 page-transition-wrapper">
        <ContentAnimation>
          {/* Professional Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-blue-500 to-transparent"></div>
              <span className="mx-3 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Sell Your Item
              </span>
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500"></div>
            </div>

            <h1 className="font-bold text-3xl md:text-4xl tracking-tight mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Get Cash for Your Items
            </h1>

            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm">
              Complete the form below to get an offer for your items within 24
              hours.
            </p>
          </div>
        </ContentAnimation>

        {!formSubmitted ? (
          <>
            {submitResult && !submitResult.success && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
                {submitResult.message}
              </div>
            )}

            {/* Progress Steps */}
            <ContentAnimation delay={0.2}>
              <div className="mb-8">
                <div className="hidden md:flex justify-between items-center relative z-10 px-8 max-w-2xl mx-auto">
                  {/* Progress line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 -translate-y-1/2 transition-all duration-500"
                    style={{ width: formStep === 1 ? "0%" : "100%" }}
                  ></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative bg-slate-50 dark:bg-slate-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(1) === "complete"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : getStepStatus(1) === "current"
                            ? "bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400"
                      }`}
                    >
                      {getStepStatus(1) === "complete" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        getStepStatus(1) === "current"
                          ? "text-blue-500"
                          : getStepStatus(1) === "complete"
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Item Details
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative bg-slate-50 dark:bg-slate-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(2) === "complete"
                          ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                          : getStepStatus(2) === "current"
                            ? "bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-500"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        getStepStatus(2) === "current"
                          ? "text-purple-500"
                          : getStepStatus(2) === "complete"
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Contact Info
                    </span>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="flex md:hidden justify-between items-center mb-4">
                  <div className="text-base font-medium text-slate-900 dark:text-white">
                    Step {formStep} of 2:{" "}
                    {formStep === 1 ? "Item Details" : "Contact Info"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {Math.round((formStep / 2) * 100)}% Complete
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6 md:hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(formStep / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <form
                ref={formBoxRef}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-violet-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-violet-950/30 p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {formStep === 1
                      ? "Add your items"
                      : "Your contact information"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {formStep === 1
                      ? `You're currently adding ${getItems().length} item${getItems().length > 1 ? "s" : ""}`
                      : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-6 md:p-8">
                  {formStep === 1 && (
                    <div className="space-y-6">
                      {/* Items list */}
                      <div className="space-y-6">
                        {getItems().map((item, index) => (
                          <Card
                            key={item.id}
                            id={item.id}
                            className={`border ${
                              item.isValid
                                ? "border-slate-200 dark:border-slate-700"
                                : "border-blue-300 dark:border-blue-700"
                            } transition-all duration-300 hover:shadow-md bg-white dark:bg-slate-900 rounded-lg overflow-hidden`}
                          >
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 py-3 px-4 border-b border-slate-200 dark:border-slate-800">
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-500" />
                                    Item {index + 1}
                                    {item.isValid && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 bg-green-100 text-green-800"
                                      >
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Complete
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {item.name
                                      ? item.name
                                      : "Add item details below"}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm" // Changed size to sm for better fit with text
                                    onClick={() => handleDuplicateClick(index)}
                                    className="h-7 w-auto px-2" // Adjust width and padding for text
                                    title="Choose quantity of item" // Updated title
                                    aria-label="Choose quantity of item" // Added aria-label for accessibility
                                  >
                                    <Copy className="h-3 w-3 mr-1" />{" "}
                                    {/* Keep icon, add margin */}
                                    <span className="text-xs">
                                      Choose Quantity
                                    </span>{" "}
                                    {/* New text */}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleItemAccordion(index)}
                                    className="h-7 w-7"
                                    title={
                                      item.isExpanded ? "Collapse" : "Expand"
                                    }
                                  >
                                    {item.isExpanded ? (
                                      <ChevronLeft className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            {item.isExpanded && (
                              <CardContent className="pt-4 px-4 space-y-4">
                                <div className="transition-all duration-300">
                                  <Label
                                    htmlFor={`item-name-${index}`}
                                    className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100"
                                  >
                                    Item Name{" "}
                                    <span className="text-red-500">*</span>{" "}
                                    {/* <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                      (Don't use special charecters){" "}
                                    </span> */}
                                  </Label>
                                  <Input
                                    id={`item-name-${index}`}
                                    value={item.name || ""}
                                    onChange={(e) => handleNameChange(e, index)}
                                    // placeholder="e.g., Leather Sofa, Samsung TV"
                                    className="transition-all duration-200"
                                    required
                                  />

                                  {/* Smart name suggestion */}
                                  {item.isLoadingSuggestion && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Generating suggestion...</span>
                                    </div>
                                  )}

                                  {item.nameSuggestion && (
                                    <div
                                      onClick={() => applySuggestion(index)}
                                      className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Wand2 className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                          Suggested Description
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                        >
                                          Click to Apply
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {item.nameSuggestion}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label
                                      htmlFor={`item-description-${index}`}
                                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                      Item Description{" "}
                                      <span className="text-red-500">
                                        *
                                      </span>{" "}
                                    </Label>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {(item.description || "").length}{" "}
                                      characters
                                    </div>
                                  </div>
                                  <Textarea
                                    id={`item-description-${index}`}
                                    value={item.description || ""}
                                    onChange={(e) =>
                                      handleDescriptionChange(e, index)
                                    }
                                    // placeholder="Describe your item in detail including brand, model, size, color, etc. (minimum 10 characters required)"
                                    rows={3}
                                    className="transition-all duration-200"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                    Item Condition{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {/* Clickable condition options */}
                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "like-new"
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm`}
                                      onClick={() =>
                                        handleConditionSelect(index, "like-new")
                                      }
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "like-new"
                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <Sparkles className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-like-new-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Like New
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "excellent"
                                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm`}
                                      onClick={() =>
                                        handleConditionSelect(
                                          index,
                                          "excellent"
                                        )
                                      }
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "excellent"
                                            ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-excellent-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Excellent
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "good"
                                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm`}
                                      onClick={() =>
                                        handleConditionSelect(index, "good")
                                      }
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "good"
                                            ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-good-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Good
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "fair"
                                          ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm`}
                                      onClick={() =>
                                        handleConditionSelect(index, "fair")
                                      }
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "fair"
                                            ? "bg-gradient-to-r from-purple-400 to-violet-400 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <Info className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-fair-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Fair
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "poor"
                                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all shadow-sm`}
                                      onClick={() =>
                                        handleConditionSelect(index, "poor")
                                      }
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "poor"
                                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-poor-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Poor
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label
                                      htmlFor={`item-issues-${index}`}
                                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                      Additional Information{" "}
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {(item.issues || "").length} characters
                                    </div>
                                  </div>
                                  <Textarea
                                    id={`item-issues-${index}`}
                                    value={item.issues || ""}
                                    onChange={(e) =>
                                      handleIssuesChange(e, index)
                                    }
                                    // placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                                    rows={3}
                                    className="transition-all duration-200"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300 mt-4">
                                  <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                    Item Photos{" "}
                                    <span className="text-red-500">*</span>{" "}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                      (at least 3 required)
                                    </span>
                                  </Label>

                                  <Tabs
                                    defaultValue="upload"
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-1 mb-4">
                                      <TabsTrigger
                                        value="upload"
                                        className="flex items-center gap-2 w-full"
                                      >
                                        <Camera className="h-4 w-4" />
                                        <span>Upload Photos</span>
                                      </TabsTrigger>
                                      {/* <TabsTrigger
                                        value="url"
                                        className="flex items-center gap-2"
                                      >
                                        <LinkIcon className="h-4 w-4" />
                                        <span>Image URL</span>
                                      </TabsTrigger> */}
                                    </TabsList>

                                    <TabsContent
                                      value="upload"
                                      className="mt-0"
                                    >
                                      {/* File upload */}
                                      <div
                                        onClick={() =>
                                          fileInputRefs.current[
                                            `item-${index}`
                                          ]?.click()
                                        }
                                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                      >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                          </div>
                                          <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                            Click to Upload Images
                                          </p>
                                          <p className="font-medium text-xs text-slate-700 dark:text-slate-300">
                                            Upload 3 quality images
                                          </p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {(item.photos || []).length} photos
                                            uploaded (max 10)
                                          </p>
                                        </div>
                                        <input
                                          type="file"
                                          ref={(el) => {
                                            fileInputRefs.current[
                                              `item-${index}`
                                            ] = el;
                                          }}
                                          className="hidden"
                                          multiple
                                          accept="image/*"
                                          onChange={(e) =>
                                            handleFileUpload(e, index)
                                          }
                                        />
                                      </div>
                                    </TabsContent>

                                    {/* <TabsContent value="url" className="mt-0">
                                      <div className="space-y-4">
                                        <div className="flex gap-2">
                                          <Input
                                            value={item.imageUrlInput || ""}
                                            onChange={(e) =>
                                              handleImageUrlInput(e, index)
                                            }
                                            placeholder="https://example.com/image.jpg"
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            onClick={() => addImageUrl(index)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                          >
                                            Add URL
                                          </Button>
                                        </div>

                                        {item.imageUrl && (
                                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Image URL Added
                                              </span>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  removeImageUrl(index)
                                                }
                                                className="h-7 w-7 p-0 text-red-500"
                                              >
                                                <X className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 break-all">
                                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                              <span>{item.imageUrl}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent> */}
                                  </Tabs>

                                  {/* Photo previews */}
                                  {item.photos && item.photos.length > 0 && (
                                    <div className="mt-4">
                                      <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                        Uploaded Photos ({item.photos.length})
                                      </Label>
                                      <div className="flex flex-wrap gap-3">
                                        {item.photos.map(
                                          (photo, photoIndex) => (
                                            <div
                                              key={photo.id || photoIndex}
                                              className="relative group"
                                            >
                                              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                                {photo.previewUrl ? (
                                                  <img
                                                    src={
                                                      photo.previewUrl ||
                                                      "/placeholder.svg"
                                                    }
                                                    alt={`Preview ${photoIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      const event =
                                                        e.nativeEvent || e;
                                                      const target =
                                                        e.currentTarget ||
                                                        e.target;
                                                      console.error(
                                                        `Error loading image ${photoIndex}:`,
                                                        {
                                                          src: target?.src,
                                                          supabaseUrl:
                                                            photo.supabaseUrl,
                                                          previewUrl:
                                                            photo.previewUrl,
                                                          errorMessage:
                                                            "Image load failed",
                                                          errorType: "unknown",
                                                        }
                                                      );
                                                      // Fallback to placeholder
                                                      if (
                                                        target &&
                                                        target.src !==
                                                          "/placeholder.svg?height=96&width=96"
                                                      ) {
                                                        target.src =
                                                          "/placeholder.svg?height=96&width=96";
                                                      }
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                    <ImageIcon className="h-8 w-8 text-slate-400" />
                                                  </div>
                                                )}
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removePhoto(index, photoIndex)
                                                }
                                                className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-red-500 rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700"
                                                aria-label="Remove photo"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                              {/* Upload status indicators */}
                                              {photo.uploading && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-75 text-white text-xs p-1 text-center flex items-center justify-center gap-1">
                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                  Uploading
                                                </div>
                                              )}
                                              {photo.uploaded &&
                                                !photo.uploading && (
                                                  <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 text-center">
                                                    Uploaded
                                                  </div>
                                                )}
                                              {photo.error &&
                                                !photo.uploading && (
                                                  <div className="absolute bottom-0 left-0 right-0 bg-red-600 bg-opacity-75 text-white text-xs p-1 text-center">
                                                    Error
                                                  </div>
                                                )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Upload progress indicator */}
                                  <div className="flex items-center gap-1 mt-3 w-full">
                                    <div className="w-full">
                                      <Progress
                                        value={Math.min(
                                          100,
                                          (((item.photos?.length || 0) +
                                            (item.imageUrl ? 1 : 0)) /
                                            3) *
                                            100
                                        )}
                                        className={`h-1.5 ${
                                          (item.photos?.length || 0) +
                                            (item.imageUrl ? 1 : 0) >=
                                          3
                                            ? "[&>div]:bg-green-500"
                                            : "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:via-purple-500 [&>div]:to-violet-500"
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* NEW: Enhanced price estimate display with eBay data badges */}
                                {priceEstimates[index] && (
                                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                          Estimated Value
                                        </span>
                                        {/* Enhanced source badges */}
                                        {priceEstimates[index].source ===
                                          "pricing_openai_primary" && (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            AI Pro (Pricing Key)
                                          </Badge>
                                        )}
                                        {priceEstimates[index].source ===
                                          "openai_secondary" && (
                                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            AI Standard
                                          </Badge>
                                        )}
                                        {priceEstimates[index].source ===
                                          "ebay_fallback" && (
                                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                            <ShoppingCart className="mr-1 h-3 w-3" />
                                            eBay Data (Fallback)
                                          </Badge>
                                        )}
                                        {(priceEstimates[index].source ===
                                          "system_fallback" ||
                                          priceEstimates[index].source ===
                                            "error_fallback") && (
                                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                                            Basic Estimate
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                          {priceEstimates[index].price}
                                        </div>
                                        {priceEstimates[index].source ===
                                        "content_filter" ? (
                                          <div className="text-xs text-red-600 dark:text-red-400">
                                            Content policy violation detected
                                          </div>
                                        ) : (
                                          <div className="text-xs text-slate-600 dark:text-slate-400">
                                            Range: $
                                            {priceEstimates[index].minPrice} - $
                                            {priceEstimates[index].maxPrice}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* NEW: eBay reference count */}
                                    {priceEstimates[index].source ===
                                      "ebay_fallback" &&
                                      priceEstimates[index].referenceCount !==
                                        undefined && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                          <Info className="h-3 w-3" />
                                          <span>
                                            Based on{" "}
                                            {
                                              priceEstimates[index]
                                                .referenceCount
                                            }{" "}
                                            similar eBay listings
                                          </span>
                                        </div>
                                      )}

                                    {/* Confidence indicator */}
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-xs text-slate-600 dark:text-slate-400">
                                        Confidence:
                                      </span>
                                      <Badge
                                        className={`text-xs ${
                                          priceEstimates[index].confidence ===
                                          "high"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                            : priceEstimates[index]
                                                  .confidence === "medium"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                        }`}
                                      >
                                        {priceEstimates[index].confidence ===
                                        "high"
                                          ? "High"
                                          : priceEstimates[index].confidence ===
                                              "medium"
                                            ? "Medium"
                                            : "Low"}
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            )}

                            {!item.isExpanded && (
                              <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                  {item.name && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Name:</span>
                                      <span className="text-slate-600 dark:text-slate-300">
                                        {item.name}
                                      </span>
                                    </div>
                                  )}

                                  {item.condition && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Condition:
                                      </span>
                                      <span className="text-slate-600 dark:text-slate-300">
                                        {item.condition
                                          .split("-")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(" ")}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Photos:</span>
                                    <span className="text-slate-600 dark:text-slate-300">
                                      {(item.photos?.length || 0) +
                                        (item.imageUrl ? 1 : 0)}
                                    </span>
                                  </div>

                                  {priceEstimates[index] && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Estimate:
                                      </span>
                                      <span className="text-green-600 dark:text-green-400 font-medium">
                                        {priceEstimates[index].price}
                                      </span>
                                      {priceEstimates[index].source ===
                                        "pricing_openai_primary" && (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                          AI Pro
                                        </Badge>
                                      )}
                                      {priceEstimates[index].source ===
                                        "openai_secondary" && (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                          AI Std
                                        </Badge>
                                      )}
                                      {priceEstimates[index].source ===
                                        "ebay_fallback" && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                          eBay
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>

                      {/* Add item button */}
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          onClick={addItem}
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Item
                        </Button>
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button
                          type="button"
                          onClick={handleContinueToStep2}
                          disabled={!step1Valid}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="transition-all">
                        <Label
                          htmlFor="full-name"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <User className="w-4 h-4 text-blue-500" />
                          <span>
                            Full Name <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="full-name"
                          name="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="transition-all duration-200"
                          required
                          ref={fullNameInputRef}
                        />
                        {formErrors.fullName && (
                          <ErrorMessage message={formErrors.fullName} />
                        )}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.email && (
                          <ErrorMessage message={formErrors.email} />
                        )}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>
                            Phone Number <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(123) 456-7890"
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.phone && (
                          <ErrorMessage message={formErrors.phone} />
                        )}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="pickup_date"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>
                            Preferred Pickup Date{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="pickup_date"
                          name="pickup_date"
                          type="date"
                          value={pickupDate}
                          min={
                            new Date(Date.now() + 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                          } // Tomorrow
                          onChange={(e) => {
                            setPickupDate(e.target.value);
                            // Blur the input to make the calendar disappear
                            e.target.blur();
                          }}
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.pickupDate && (
                          <ErrorMessage message={formErrors.pickupDate} />
                        )}
                      </div>

                      {/* Pickup Address */}
                      <div className="transition-all">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Package className="w-4 h-4 text-blue-500" />
                          <span>
                            Pickup Address
                            <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Address, town, zip"
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.address && (
                          <ErrorMessage message={formErrors.address} />
                        )}
                      </div>

                      {/* Show items summary in step 2 */}
                      <div className="transition-all">
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span>Items Summary ({getItems().length})</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  Total Items:
                                </span>{" "}
                                {getItems().length}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  Total Value:
                                </span>{" "}
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {/* {totalEstimate.price} */}
                                </span>
                              </p>
                              {/* Show pricing method summary */}
                              {/* <div className="mt-2 flex flex-wrap gap-1">
                                {priceEstimates.some(
                                  (e) => e.source === "pricing_openai_primary"
                                ) && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    AI Pro
                                  </Badge>
                                )}
                                {priceEstimates.some(
                                  (e) => e.source === "openai_secondary"
                                ) && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                    AI Std
                                  </Badge>
                                )}
                                {priceEstimates.some(
                                  (e) => e.source === "ebay_fallback"
                                ) && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                    eBay Data
                                  </Badge>
                                )}
                              </div> */}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Item Details:
                              </p>
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                              >
                                {getItems().map((item, index) => (
                                  <AccordionItem
                                    key={item.id}
                                    value={`item-${index}`}
                                    className="border-slate-200 dark:border-slate-800"
                                  >
                                    <AccordionTrigger className="text-sm hover:no-underline py-2">
                                      <span className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-500" />
                                        {item.name || `Item ${index + 1}`}
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pt-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            Condition:
                                          </span>{" "}
                                          {item.condition
                                            ? item.condition
                                                .split("-")
                                                .map(
                                                  (word) =>
                                                    word
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    word.slice(1)
                                                )
                                                .join(" ")
                                            : "Not specified"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            Description:
                                          </span>{" "}
                                          {item.description ||
                                            "No description provided"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            Issues:
                                          </span>{" "}
                                          {item.issues || "None specified"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            Photos:
                                          </span>{" "}
                                          {(item.photos?.length || 0) +
                                            (item.imageUrl ? 1 : 0)}
                                        </p>
                                        {priceEstimates[index] && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                                              Estimate:
                                            </span>
                                            <span className="text-green-600 dark:text-green-400 text-sm">
                                              {priceEstimates[index].price}
                                            </span>
                                            {priceEstimates[index].source ===
                                              "pricing_openai_primary" && (
                                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                                AI Pro
                                              </Badge>
                                            )}
                                            {priceEstimates[index].source ===
                                              "openai_secondary" && (
                                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                                AI Std
                                              </Badge>
                                            )}
                                            {priceEstimates[index].source ===
                                              "ebay_fallback" && (
                                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                                eBay
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Calculation Section */}
                      <div className="mt-8 transition-all">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-500" />
                            Price Estimation
                          </h3>

                          {!estimateResponse ? (
                            <div className="space-y-4">
                              <p className="text-slate-600 dark:text-slate-400">
                                Get instant price estimates for your items
                                before submitting.
                              </p>
                              {/* calculate price button */}
                              <Button
                                type="button"
                                onClick={calculatePriceEstimates}
                                disabled={
                                  !step1Valid ||
                                  items.length === 0 ||
                                  isCalculatingPrices
                                }
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCalculatingPrices ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Calculating Prices...
                                  </>
                                ) : (
                                  <>
                                    <Calculator className="w-4 h-4" />
                                    Calculate Prices
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                  Total Estimated Value
                                </h4>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  $
                                  {
                                    estimateResponse.products_summary
                                      .total_estimated_value
                                  }
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  Based on{" "}
                                  {
                                    estimateResponse.products_summary
                                      .total_products
                                  }{" "}
                                  items
                                </p>
                              </div>

                              <div className="grid gap-3">
                                {estimateResponse.individual_products.map(
                                  (product: any, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="font-medium text-slate-900 dark:text-white text-sm">
                                            {items[index]?.name ||
                                              `Item ${index + 1}`}
                                          </h5>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Confidence:{" "}
                                            {product.confidence_level}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-green-600 dark:text-green-400">
                                            ${product.estimated_value}
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {product.price_range}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* <Button
                                type="button"
                                onClick={calculatePriceEstimates}
                                variant="outline"
                                className="w-full mt-4"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Recalculate Prices
                              </Button> */}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 transition-all">
                        <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={(checked) =>
                                setTermsAccepted(checked === true)
                              }
                              className={`mt-1 border-blue-500 text-blue-500 focus-visible:ring-blue-500 ${formErrors.terms ? "border-red-300" : ""}`}
                              required
                            />
                            <div>
                              <Label
                                htmlFor="consent"
                                className="font-medium text-slate-900 dark:text-white"
                              >
                                I consent to being contacted by BluBerry{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                By submitting this form, you agree to our{" "}
                                <Link
                                  href="/privacy-policy"
                                  className="text-blue-500 underline hover:text-blue-600 transition-colors"
                                >
                                  Privacy Policy
                                </Link>
                                . We'll use your information to process your
                                request and contact you about your items.
                              </p>
                              {formErrors.terms && (
                                <ErrorMessage message={formErrors.terms} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormStep(1);
                            scrollToFormTop();
                          }}
                          className="px-6 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-medium text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </Button>

                        <Button
                          type="submit"
                          disabled={
                            !step2Valid ||
                            isSubmitting ||
                            isSubmittingAPI ||
                            !estimateResponse ||
                            !tempProductIds ||
                            tempProductIds.length === 0
                          }
                          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg relative overflow-hidden"
                        >
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting || isSubmittingAPI ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {!estimateResponse
                                    ? "Calculate Prices First"
                                    : "Submit Items"}
                                </span>
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </ContentAnimation>
          </>
        ) : (
          <ContentAnimation>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-violet-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-violet-950/30 p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Submission Received
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>

                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-16 h-0.5 mx-auto mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-full"></div>

                <p className="text-base mb-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                  We've received your submission and will review your item
                  details. You can expect to hear from us within 24 hours with a
                  price offer.
                </p>

                {/* <p className="text-sm mb-8 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                  Your images have been stored in the{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    item_images
                  </span>{" "}
                  bucket.
                </p> */}

                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-md max-w-md mx-auto flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-left">
                    {submitResult && submitResult.userEmailSent ? (
                      <>
                        We've sent a confirmation email to{" "}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {email}
                        </span>{" "}
                        with the details of your submission.
                      </>
                    ) : (
                      <>
                        Your submission was successful, but we couldn't send a
                        confirmation email. Please keep your submission
                        reference for your records.
                      </>
                    )}
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </ContentAnimation>
        )}
      </div>

      {/* Duplicate Item Dialog */}
      <Dialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duplicate Item</DialogTitle>
            <DialogDescription>
              How many copies of this item would you like to create?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duplicate-count" className="text-right">
                Copies
              </Label>
              <Input
                id="duplicate-count"
                type="number"
                value={duplicateCount}
                onChange={(e) =>
                  setDuplicateCount(
                    Math.max(1, Number.parseInt(e.target.value) || 1)
                  )
                }
                min="1"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmDuplicate}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
