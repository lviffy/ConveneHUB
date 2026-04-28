"use client";
import React from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/convene/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { CityInput } from "@/components/ui/city-input";
import Image from "next/image";
export function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    toast
  } = useToast();
  const supabase = createClient();
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          user: currentUser
        },
        error
      } = await supabase.auth.getUser();
      if (error || !currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setUserEmail(currentUser.email || "");
      const {
        data: profile
      } = await supabase.from("profiles").select("phone, city").eq("id", currentUser.id).single();
      if (profile && typeof profile === "object") {
        const profileData = profile;
        if (profileData.phone) setPhone(profileData.phone);
        if (profileData.city) setCity(profileData.city);
      }
    };
    checkAuth();
  }, [router]);

  // Show banner when redirected here due to a duplicate phone number
  useEffect(() => {
    if (searchParams.get("error") === "phone_taken") {
      toast({
        title: "Phone Number Already in Use",
        description: "The phone number you entered is linked to another account. Please enter a different number.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!city) {
        throw new Error("Please enter a city");
      }
      if (!user?.id) {
        throw new Error("User not found");
      }
      const {
        error
      } = await supabase.from("profiles").update({
        phone: phone || null,
        city
      }).eq("id", user.id).single();
      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated."
      });
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || "/events");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (!user) {
    return React.createElement("div", {
      className: "min-h-screen flex items-center justify-center"
    }, React.createElement(Spinner, {
      className: "w-8 h-8"
    }));
  }
  return React.createElement("div", {
    className: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900"
  }, React.createElement(Card, {
    className: "w-full max-w-md"
  }, React.createElement(CardHeader, {
    className: "space-y-1 flex flex-col items-center"
  }, React.createElement("div", {
    className: "w-20 h-20 relative mb-4"
  }, React.createElement(Image, {
    src: "/logo/logo.jpg",
    alt: "ConveneHub Logo",
    fill: true,
    className: "object-contain",
    priority: true
  })), React.createElement(CardTitle, {
    className: "text-2xl font-bold text-center"
  }, "Complete Your Profile"), React.createElement(CardDescription, {
    className: "text-center"
  }, "Please provide some additional information to complete your profile")), React.createElement(CardContent, null, React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, React.createElement("div", {
    className: "space-y-2"
  }, React.createElement(Label, {
    htmlFor: "email"
  }, "Email"), React.createElement(Input, {
    id: "email",
    type: "email",
    value: userEmail,
    disabled: true,
    className: "bg-muted"
  })), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement(Label, {
    htmlFor: "phone"
  }, "Phone Number *"), React.createElement(Input, {
    id: "phone",
    type: "tel",
    placeholder: "+91 9876543210",
    value: phone,
    onChange: e => setPhone(e.target.value),
    required: true
  })), React.createElement(CityInput, {
    value: city,
    onChange: setCity,
    placeholder: "Enter your city",
    required: true,
    label: "City"
  }), React.createElement(Button, {
    type: "submit",
    className: "w-full",
    disabled: isLoading || !city || !phone
  }, isLoading ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "mr-2 h-4 w-4"
  }), "Updating...") : "Complete Profile")))));
}