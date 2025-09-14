/** @format */

"use client";

import type React from "react";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  Users,
  MapPin,
} from "lucide-react";
import ContentAnimation from "@/components/content-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/userAuth";
import { useRequestServiceMutation } from "@/redux/features/serviceAPI";

export default function HowItWorksPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [requestService, { isLoading: isSubmitting, error, isSuccess }] =
    useRequestServiceMutation();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    zip_code: "",
    city: "",
    state: "",
    service_type: "",
    types_of_items: "",
    estimated_total_value: "",
    preferred_timeframe: "",
    additional_information: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestService = () => {
    // if (isAuthenticated) {
    //   setIsServiceFormOpen(true);
    // } else {
    //   router.push("/auth/sign-in");
    // }
    setIsServiceFormOpen(true);
  };

  const handleStartSelling = (e: React.MouseEvent) => {
    e.preventDefault();
    // if (isAuthenticated) {
    //   router.push("/sell-multiple-items");
    // } else {
    //   router.push("/auth/sign-in");
    // }
    router.push("/sell-multiple-items");
  };

  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean the form data to only include the required fields in the exact format
      const cleanFormData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        service_type: formData.service_type,
        types_of_items: formData.types_of_items,
        estimated_total_value: formData.estimated_total_value,
        preferred_timeframe: formData.preferred_timeframe,
        additional_information: formData.additional_information,
      };

      await requestService(cleanFormData).unwrap();
      setIsSubmitted(true);
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        zip_code: "",
        city: "",
        state: "",
        service_type: "",
        types_of_items: "",
        estimated_total_value: "",
        preferred_timeframe: "",
        additional_information: "",
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
    }
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                How BluBerry Works
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto text-muted-foreground mb-8">
              From submission to cash in hand - here's how our simple 3-step
              process works
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Simple 3-Step Process
              </span>
            </h2>
          </ContentAnimation>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] opacity-20"></div>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#3B82F6]/20">
                  <Package className="h-8 w-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">
                  1. Fill Out Form
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Complete our simple online form with your item details,
                  photos, and contact information. Takes just 2-3 minutes.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#8c52ff]/20">
                  <Truck className="h-8 w-8 text-[#8c52ff]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">
                  2. We Come To You
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Schedule a convenient pickup time. Our professional team comes
                  to your location to collect and evaluate your items.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#3B82F6]/20">
                  <DollarSign className="h-8 w-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">
                  3. Get Paid Instantly
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Receive your payment immediately upon pickup. Cash, check,
                  Venmo, or PayPal - your choice.
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Full Service Section */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Full-Service Experience
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  What We Handle
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">
                      Professional item evaluation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">
                      Market research and pricing
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">
                      Photography and listings
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Buyer communication</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">
                      Shipping and delivery
                    </span>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  What You Do
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">
                      Fill out our simple form
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">
                      Schedule a pickup time
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">
                      Be available for pickup
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">
                      Receive your payment
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-foreground font-medium">
                      That's it!
                    </span>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* AI-Powered Pricing Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Smart Pricing Technology
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-6">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Market Analysis
                </h3>
                <p className="text-muted-foreground text-sm">
                  AI analyzes current market trends and comparable sales to
                  determine optimal pricing
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Real-Time Updates
                </h3>
                <p className="text-muted-foreground text-sm">
                  Pricing adjusts automatically based on demand, seasonality,
                  and market conditions
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Maximum Value
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our algorithms ensure you get the best possible price for your
                  items
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Service Areas
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ContentAnimation delay={0.1}>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Currently Serving
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">
                      Chicago Metropolitan Area
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">North Shore Suburbs</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">Northwest Suburbs</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  Don't see your area? We're expanding rapidly. Request service
                  in your area below!
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Request Service in Your Area
                </h3>
                <Button
                  onClick={handleRequestService}
                  className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white hover:opacity-90"
                >
                  Request Service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* What We Accept Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                What We Accept
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Electronics
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Smartphones & Tablets</li>
                  <li>Laptops & Computers</li>
                  <li>Gaming Consoles</li>
                  <li>Audio Equipment</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Furniture
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Living Room Sets</li>
                  <li>Bedroom Furniture</li>
                  <li>Office Furniture</li>
                  <li>Antiques</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Appliances
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Kitchen Appliances</li>
                  <li>Washers & Dryers</li>
                  <li>Small Appliances</li>
                  <li>HVAC Equipment</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.4}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  More Items
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Sporting Equipment</li>
                  <li>Musical Instruments</li>
                  <li>Collectibles</li>
                  <li>Tools & Equipment</li>
                </ul>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-[#3B82F6]/5 to-[#8c52ff]/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Turn your unused items into cash today with our simple 3-step
              process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleStartSelling}
                className="bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white hover:opacity-90"
              >
                Start Selling Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Have Questions?
                </Button>
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Service Request Modal */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Request BluBerry Service in Your Area
                </h2>
                <button
                  onClick={() => setIsServiceFormOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    {error &&
                    "data" in error &&
                    error.data &&
                    typeof error.data === "object" &&
                    "message" in error.data
                      ? (error.data as any).message
                      : "An error occurred while submitting your request. Please try again."}
                  </p>
                </div>
              )}

              {!isSubmitted ? (
                <form onSubmit={handleServiceFormSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) =>
                          handleInputChange("phone_number", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City *
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          State *
                        </label>
                        <Select
                          onValueChange={(value) =>
                            handleInputChange("state", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alabama">Alabama</SelectItem>
                            <SelectItem value="Alaska">Alaska</SelectItem>
                            <SelectItem value="Arizona">Arizona</SelectItem>
                            <SelectItem value="Arkansas">Arkansas</SelectItem>
                            <SelectItem value="California">
                              California
                            </SelectItem>
                            <SelectItem value="Colorado">Colorado</SelectItem>
                            <SelectItem value="Connecticut">
                              Connecticut
                            </SelectItem>
                            <SelectItem value="Delaware">Delaware</SelectItem>
                            <SelectItem value="Florida">Florida</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Hawaii">Hawaii</SelectItem>
                            <SelectItem value="Idaho">Idaho</SelectItem>
                            <SelectItem value="Illinois">Illinois</SelectItem>
                            <SelectItem value="Indiana">Indiana</SelectItem>
                            <SelectItem value="Iowa">Iowa</SelectItem>
                            <SelectItem value="Kansas">Kansas</SelectItem>
                            <SelectItem value="Kentucky">Kentucky</SelectItem>
                            <SelectItem value="Louisiana">Louisiana</SelectItem>
                            <SelectItem value="Maine">Maine</SelectItem>
                            <SelectItem value="Maryland">Maryland</SelectItem>
                            <SelectItem value="Massachusetts">
                              Massachusetts
                            </SelectItem>
                            <SelectItem value="Michigan">Michigan</SelectItem>
                            <SelectItem value="Minnesota">Minnesota</SelectItem>
                            <SelectItem value="Mississippi">
                              Mississippi
                            </SelectItem>
                            <SelectItem value="Missouri">Missouri</SelectItem>
                            <SelectItem value="Montana">Montana</SelectItem>
                            <SelectItem value="Nebraska">Nebraska</SelectItem>
                            <SelectItem value="Nevada">Nevada</SelectItem>
                            <SelectItem value="New Hampshire">
                              New Hampshire
                            </SelectItem>
                            <SelectItem value="New Jersey">
                              New Jersey
                            </SelectItem>
                            <SelectItem value="New Mexico">
                              New Mexico
                            </SelectItem>
                            <SelectItem value="New York">New York</SelectItem>
                            <SelectItem value="North Carolina">
                              North Carolina
                            </SelectItem>
                            <SelectItem value="North Dakota">
                              North Dakota
                            </SelectItem>
                            <SelectItem value="Ohio">Ohio</SelectItem>
                            <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                            <SelectItem value="Oregon">Oregon</SelectItem>
                            <SelectItem value="Pennsylvania">
                              Pennsylvania
                            </SelectItem>
                            <SelectItem value="Rhode Island">
                              Rhode Island
                            </SelectItem>
                            <SelectItem value="South Carolina">
                              South Carolina
                            </SelectItem>
                            <SelectItem value="South Dakota">
                              South Dakota
                            </SelectItem>
                            <SelectItem value="Tennessee">Tennessee</SelectItem>
                            <SelectItem value="Texas">Texas</SelectItem>
                            <SelectItem value="Utah">Utah</SelectItem>
                            <SelectItem value="Vermont">Vermont</SelectItem>
                            <SelectItem value="Virginia">Virginia</SelectItem>
                            <SelectItem value="Washington">
                              Washington
                            </SelectItem>
                            <SelectItem value="West Virginia">
                              West Virginia
                            </SelectItem>
                            <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                            <SelectItem value="Wyoming">Wyoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          ZIP Code *
                        </label>
                        <Input
                          value={formData.zip_code}
                          onChange={(e) =>
                            handleInputChange("zip_code", e.target.value)
                          }
                          placeholder="Enter ZIP code"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Type *
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("service_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Item Pickup & Sale">
                          Item Pickup & Sale
                        </SelectItem>
                        <SelectItem value="Item Evaluation Only">
                          Item Evaluation Only
                        </SelectItem>
                        <SelectItem value="Selling Consultation">
                          Selling Consultation
                        </SelectItem>
                        <SelectItem value="Bulk Item Sale">
                          Bulk Item Sale
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Types of Items
                    </label>
                    <Input
                      placeholder="e.g., furniture, electronics, appliances"
                      value={formData.types_of_items}
                      onChange={(e) =>
                        handleInputChange("types_of_items", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estimated Total Value
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("estimated_total_value", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select estimated value range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under $500">Under $500</SelectItem>
                        <SelectItem value="$500 - $1,000">
                          $500 - $1,000
                        </SelectItem>
                        <SelectItem value="$1,000 - $2,500">
                          $1,000 - $2,500
                        </SelectItem>
                        <SelectItem value="$2,500 - $5,000">
                          $2,500 - $5,000
                        </SelectItem>
                        <SelectItem value="Over $5,000">Over $5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preferred Timeframe
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("preferred_timeframe", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="When would you like service?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="As soon as possible">
                          As soon as possible
                        </SelectItem>
                        <SelectItem value="Within a week">
                          Within a week
                        </SelectItem>
                        <SelectItem value="Within a month">
                          Within a month
                        </SelectItem>
                        <SelectItem value="I'm flexible">
                          I'm flexible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Information
                    </label>
                    <Textarea
                      placeholder="Tell us more about your items, special requirements, or questions..."
                      value={formData.additional_information}
                      onChange={(e) =>
                        handleInputChange(
                          "additional_information",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsServiceFormOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Request Service"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Thank you for your request!
                  </h3>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setIsServiceFormOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
