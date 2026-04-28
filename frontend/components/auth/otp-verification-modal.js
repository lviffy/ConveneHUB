"use client";
import React from "react";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Mail, RefreshCw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/convene/client";
export function OTPVerificationModal({
  open,
  onClose,
  email,
  type,
  onVerified
}) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const client = createClient();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtp("");
      setCountdown(60);
      setIsVerified(false);
      setError(null);
    }
  }, [open]);

  // Countdown timer for resend
  useEffect(() => {
    if (!open || countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, countdown]);
  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // If already verified, don't try again
    if (isVerified) {
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const {
        data,
        error
      } = await client.auth.verifyOtp({
        email,
        token: otp,
        type
      });
      if (error || !data?.session?.user) {
        throw new Error(error?.message || "Verification failed");
      }

      // Mark as verified IMMEDIATELY
      setIsVerified(true);
      // Close modal BEFORE calling onVerified to prevent any modal-related errors
      onClose();
      // Then call the callback which will handle the redirect
      onVerified(data.session.user.role);
    } catch (error) {
      // Only show error if not already verified
      if (!isVerified) {
        setError(error.message || "Invalid or expired code. Please try again.");
        setOtp("");
      }
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, type, onVerified, onClose, isVerified]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !isVerifying) {
      handleVerify();
    }
  }, [otp, isVerifying, handleVerify]);
  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      const {
        error
      } = await client.auth.signInWithOtp({
        email,
        options: {
          type,
          shouldCreateUser: type !== "recovery"
        }
      });
      if (error) throw error;
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email."
      });
      setCountdown(60);
      setOtp("");
    } catch (error) {
      setError(error.message || "Failed to resend code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };
  return React.createElement(Dialog, {
    open: open,
    onOpenChange: onClose
  }, React.createElement(DialogContent, {
    className: "sm:max-w-md"
  }, React.createElement(DialogHeader, {
    className: "text-center"
  }, React.createElement("div", {
    className: "mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
  }, React.createElement(Mail, {
    className: "w-8 h-8 text-[#195ADC]"
  })), React.createElement(DialogTitle, {
    className: "text-xl font-bold text-center"
  }, "Enter Verification Code"), React.createElement(DialogDescription, {
    className: "text-center"
  }, "We've sent a 6-digit code to", React.createElement("br", null), React.createElement("span", {
    className: "font-medium text-[#010101]"
  }, email), React.createElement("br", null), React.createElement("span", {
    className: "text-xs text-slate-500 mt-1 inline-block"
  }, "Code expires in 10 minutes"))), React.createElement("div", {
    className: "space-y-6 py-4"
  }, error && React.createElement("div", {
    className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
  }, React.createElement(AlertCircle, {
    className: "w-5 h-5 flex-shrink-0"
  }), React.createElement("div", null, React.createElement("p", {
    className: "text-sm font-medium"
  }, "Verification Failed"), React.createElement("p", {
    className: "text-xs"
  }, error))), React.createElement(OTPInput, {
    value: otp,
    onChange: val => {
      setOtp(val);
      if (error) setError(null);
    },
    disabled: isVerifying
  }), isVerifying && React.createElement("div", {
    className: "flex items-center justify-center gap-2 text-sm text-slate-600"
  }, React.createElement(Spinner, {
    className: "h-4 w-4"
  }), React.createElement("span", null, "Verifying...")), React.createElement("div", {
    className: "text-center space-y-2"
  }, React.createElement("p", {
    className: "text-sm text-slate-600"
  }, "Didn't receive the code?"), countdown > 0 ? React.createElement("p", {
    className: "text-sm text-slate-500"
  }, "Resend in ", countdown, "s") : React.createElement(Button, {
    type: "button",
    variant: "link",
    onClick: handleResend,
    disabled: isResending,
    className: "text-[#195ADC] hover:text-[#195ADC]/80"
  }, isResending ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "mr-2 h-3 w-3"
  }), "Sending...") : React.createElement(React.Fragment, null, React.createElement(RefreshCw, {
    className: "mr-2 h-3 w-3"
  }), "Resend Code"))), React.createElement("div", {
    className: "text-center"
  }, React.createElement(Button, {
    type: "button",
    onClick: handleVerify,
    disabled: otp.length !== 6 || isVerifying,
    className: "w-full bg-[#195ADC] hover:bg-[#195ADC]/90 text-white"
  }, isVerifying ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "mr-2 h-4 w-4"
  }), "Verifying...") : "Verify")))));
}