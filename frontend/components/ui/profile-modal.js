"use client";
import React from "react";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, MapPin, Mail, Calendar, Award, Settings, Save, Phone, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateName } from "@/lib/validation/name";
export default function ProfileModal({
  isOpen,
  onClose,
  userName,
  userCity,
  userEmail = "user@convenehub.com",
  userPhone = "",
  userRole,
  joinedDate = "January 2025",
  accentColor = "#195ADC",
  onEditProfile,
  onProfileUpdated,
  totalEventsAttended = 0,
  onOpenReferrals
}) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [editedCity, setEditedCity] = useState(userCity);
  const [editedPhone, setEditedPhone] = useState(userPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [displayName, setDisplayName] = useState(userName);
  const [displayCity, setDisplayCity] = useState(userCity);
  const [displayPhone, setDisplayPhone] = useState(userPhone);
  const {
    toast
  } = useToast();
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update local display values when props change
  useEffect(() => {
    setDisplayName(userName);
    setDisplayCity(userCity);
    setDisplayPhone(userPhone);
    setEditedName(userName);
    setEditedCity(userCity);
    setEditedPhone(userPhone);
  }, [userName, userCity, userPhone]);
  if (!mounted || !isOpen) return null;
  const userInitial = displayName.charAt(0).toUpperCase();
  const roleLabels = {
    admin_team: "CONVENEHUB Team",
    organizer: "Event Operations",
    promoter: "Promoter",
    movie_team: "Event Operations",
    user: "General User"
  };
  const canAccessReferrals = userRole === "user" || userRole === "promoter" || userRole === "admin_team";
  const handleSave = async () => {
    // Client-side name validation
    const {
      isValid: isNameValid,
      error: nameValidationError
    } = validateName(editedName);
    if (!isNameValid) {
      setNameError(nameValidationError);
      return;
    }
    setNameError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: editedName,
          city: editedCity,
          phone: editedPhone
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local display values immediately
      setDisplayName(editedName);
      setDisplayCity(editedCity);
      setDisplayPhone(editedPhone);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      // Notify parent component if callback provided
      if (onProfileUpdated) {
        onProfileUpdated(editedName, editedCity, editedPhone);
      }

      // Call legacy callback if provided
      if (onEditProfile) {
        onEditProfile();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    setEditedName(displayName);
    setEditedCity(displayCity);
    setEditedPhone(displayPhone);
    setNameError("");
    setIsEditing(false);
  };
  const modalContent = React.createElement(AnimatePresence, null, React.createElement(motion.div, {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    className: "fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4",
    onClick: onClose
  }, React.createElement(motion.div, {
    initial: {
      scale: 0.9,
      opacity: 0,
      y: 20
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 20
    },
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    },
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl"
  }, React.createElement("div", {
    className: `relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-gradient-to-br from-gray-50 to-white ${!isEditing ? "sticky top-0 z-10" : ""}`
  }, React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onClose,
    className: "absolute top-3 sm:top-4 right-3 sm:right-4 h-8 w-8 p-0 hover:bg-white rounded-lg z-10 border border-gray-200"
  }, React.createElement(X, {
    className: "h-3.5 w-3.5"
  })), React.createElement("div", {
    className: "flex flex-col items-center text-center"
  }, React.createElement("div", {
    className: "h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center border-2 mb-2 sm:mb-3",
    style: {
      backgroundColor: `${accentColor}08`,
      borderColor: `${accentColor}20`
    }
  }, React.createElement("span", {
    className: "text-xl sm:text-2xl font-bold",
    style: {
      color: accentColor
    }
  }, userInitial)), React.createElement("div", {
    className: "mb-2 sm:mb-3"
  }, !isEditing ? React.createElement(React.Fragment, null, React.createElement("h2", {
    className: "text-lg sm:text-xl font-bold text-gray-900 mb-0.5"
  }, displayName), React.createElement("p", {
    className: "text-xs font-medium",
    style: {
      color: accentColor
    }
  }, roleLabels[userRole] || userRole), React.createElement("div", {
    className: "flex items-center justify-center gap-1 text-xs text-gray-500 mt-1"
  }, React.createElement(MapPin, {
    className: "h-3 w-3"
  }), React.createElement("span", null, displayCity))) : React.createElement(React.Fragment, null, React.createElement("div", {
    className: "space-y-2 mb-2 w-full max-w-xs mx-auto"
  }, React.createElement("div", null, React.createElement(Label, {
    htmlFor: "edit-name",
    className: "text-xs text-gray-600 mb-1"
  }, "Full Name"), React.createElement(Input, {
    id: "edit-name",
    value: editedName,
    onChange: e => {
      setEditedName(e.target.value);
      setNameError("");
    },
    className: `h-8 text-sm text-center ${nameError ? "border-red-500" : ""}`
  }), nameError && React.createElement("p", {
    className: "text-xs text-red-500 mt-1 text-left"
  }, nameError)), React.createElement("div", null, React.createElement(Label, {
    htmlFor: "edit-city",
    className: "text-xs text-gray-600 mb-1"
  }, "City"), React.createElement(Input, {
    id: "edit-city",
    value: editedCity,
    onChange: e => setEditedCity(e.target.value),
    className: "h-8 text-sm text-center"
  })), React.createElement("div", null, React.createElement(Label, {
    htmlFor: "edit-phone",
    className: "text-xs text-gray-600 mb-1"
  }, "Phone Number"), React.createElement(Input, {
    id: "edit-phone",
    type: "tel",
    value: editedPhone,
    onChange: e => setEditedPhone(e.target.value),
    placeholder: "Enter phone number",
    className: "h-8 text-sm text-center"
  }))))), !isEditing ? React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setIsEditing(true),
    className: "border-gray-300 hover:bg-white h-8 text-xs"
  }, React.createElement(Settings, {
    className: "h-3.5 w-3.5 mr-1.5"
  }), "Edit Profile") : React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(Button, {
    size: "sm",
    onClick: handleSave,
    disabled: isSaving,
    style: {
      backgroundColor: accentColor
    },
    className: "text-white hover:opacity-90 h-8 text-xs disabled:opacity-50"
  }, React.createElement(Save, {
    className: "h-3.5 w-3.5 mr-1.5"
  }), isSaving ? "Saving..." : "Save"), React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: handleCancel,
    disabled: isSaving,
    className: "border-gray-300 hover:bg-white h-8 text-xs disabled:opacity-50"
  }, "Cancel")))), React.createElement("div", {
    className: "p-4 sm:p-8"
  }, React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4"
  }, React.createElement("div", {
    className: "col-span-2 bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-2 mb-3 sm:mb-5"
  }, React.createElement("div", {
    className: "h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(User, {
    className: "h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-sm sm:text-base"
  }, "Account Information")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2 sm:gap-4"
  }, React.createElement("div", {
    className: "p-2.5 sm:p-4 rounded-lg bg-gray-50"
  }, React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1"
  }, "Full Name"), React.createElement("p", {
    className: "text-xs sm:text-sm font-medium text-gray-900 truncate"
  }, displayName)), React.createElement("div", {
    className: "p-2.5 sm:p-4 rounded-lg bg-gray-50"
  }, React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1"
  }, "Role"), React.createElement("p", {
    className: "text-xs sm:text-sm font-medium text-gray-900 truncate"
  }, roleLabels[userRole])), React.createElement("div", {
    className: "p-2.5 sm:p-4 rounded-lg bg-gray-50"
  }, React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1"
  }, "Location"), React.createElement("p", {
    className: "text-xs sm:text-sm font-medium text-gray-900 truncate"
  }, displayCity)), React.createElement("div", {
    className: "p-2.5 sm:p-4 rounded-lg bg-gray-50"
  }, React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1"
  }, "Member Since"), React.createElement("p", {
    className: "text-xs sm:text-sm font-medium text-gray-900 truncate"
  }, joinedDate)))), React.createElement("div", {
    className: "col-span-2 sm:col-span-1 bg-white rounded-xl p-3 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 mb-1"
  }, React.createElement("div", {
    className: "h-6 w-6 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(Mail, {
    className: "h-3 w-3 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-xs"
  }, "Email")), React.createElement("p", {
    className: "text-xs text-gray-600 break-all leading-relaxed"
  }, userEmail)), React.createElement("div", {
    className: "bg-white rounded-xl p-3 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 mb-1"
  }, React.createElement("div", {
    className: "h-6 w-6 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(Phone, {
    className: "h-3 w-3 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-xs"
  }, "Phone")), React.createElement("p", {
    className: "text-xs text-gray-600 break-all leading-relaxed"
  }, displayPhone || "Not provided")), canAccessReferrals && React.createElement("div", {
    className: "col-span-2 sm:col-span-1 bg-white rounded-xl p-3 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 mb-2"
  }, React.createElement("div", {
    className: "h-6 w-6 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(Megaphone, {
    className: "h-3 w-3 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-xs"
  }, "Referrals")), React.createElement("p", {
    className: "text-xs text-gray-600 mb-2.5"
  }, "Create and share your referral links."), React.createElement(Button, {
    size: "sm",
    variant: "outline",
    className: "h-7 text-xs border-gray-300 hover:bg-gray-50",
    onClick: () => {
      if (onOpenReferrals) onOpenReferrals();
      onClose();
    }
  }, "Open Referrals")), React.createElement("div", {
    className: "bg-white rounded-xl p-3 sm:p-5 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3"
  }, React.createElement("div", {
    className: "h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(Award, {
    className: "h-3 w-3 sm:h-4 sm:w-4 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-xs sm:text-sm"
  }, "Events")), React.createElement("p", {
    className: "text-2xl sm:text-3xl font-bold text-gray-900"
  }, totalEventsAttended), React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1"
  }, "Total attended")), React.createElement("div", {
    className: "bg-white rounded-xl p-3 sm:p-5 border-2 border-gray-200 hover:border-gray-300 transition-colors"
  }, React.createElement("div", {
    className: "flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3"
  }, React.createElement("div", {
    className: "h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center bg-gray-100"
  }, React.createElement(Calendar, {
    className: "h-3 w-3 sm:h-4 sm:w-4 text-gray-700"
  })), React.createElement("h3", {
    className: "font-semibold text-gray-900 text-xs sm:text-sm"
  }, "Joined")), React.createElement("p", {
    className: "text-xs sm:text-sm font-medium text-gray-900"
  }, joinedDate), React.createElement("p", {
    className: "text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1"
  }, "Member since")))))));
  return createPortal(modalContent, document.body);
}