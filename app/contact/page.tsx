/** @format */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import ContentAnimation from "@/components/content-animation";
import ConfettiEffect from "@/components/confetti-effect";
import { useSubmitContactMutation } from "@/redux/features/contactAPI";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Redux mutation hook
  const [submitContact, { isLoading: isSubmitting, error }] =
    useSubmitContactMutation();

  useEffect(() => {
    setIsFormValid(
      name.trim() !== "" && email.trim() !== "" && message.trim() !== ""
    );
  }, [name, email, message]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name required";
    if (!email.trim()) errors.email = "Email required";
    if (!message.trim()) errors.message = "Message required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const contactData = {
          your_name: name,
          your_email: email,
          your_message: message,
        };

        const result = await submitContact(contactData).unwrap();

        if (result?.success) {
          setIsSubmitted(true);
          setShowConfetti(true);
          setName("");
          setEmail("");
          setMessage("");
        } else {
          throw new Error(result?.message || "Failed to send message");
        }
      } catch (error: any) {
        console.error("Error submitting form:", error);
        // Error is already handled by RTK Query
      }
    }
  };

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="bg-background">
      <ConfettiEffect trigger={showConfetti} />

      {/* Hero Section with elegant gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-light mb-4 text-center tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-muted-foreground">
              Have questions or need assistance? We're here to help!
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <ContentAnimation>
            {!isSubmitted ? (
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
                  Send a Message
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${formErrors.name ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.name && (
                      <ErrorMessage message={formErrors.name} />
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${formErrors.email ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.email && (
                      <ErrorMessage message={formErrors.email} />
                    )}
                  </div>

                  <div className="relative">
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message..."
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${formErrors.message ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.message && (
                      <ErrorMessage message={formErrors.message} />
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                      {typeof error === "object" && "data" in error
                        ? (error as any)?.data?.message ||
                          "Failed to send message"
                        : "Failed to send message"}
                    </div>
                  )}

                  <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg w-full">
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full flex justify-center items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2 text-foreground">
                  Message Sent!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for contacting us. We'll respond within 24 hours.
                </p>
                <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="flex items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                  >
                    Send Another
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </ContentAnimation>
        </div>
      </section>
    </div>
  );
}
