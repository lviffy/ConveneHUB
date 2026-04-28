"use client";
import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function CityInput({
  value,
  onChange,
  required = false,
  disabled = false,
  label = "City",
  placeholder = "Enter your city",
  className = "",
  id = "city"
}) {
  const handleChange = e => {
    // Capitalize first letter of each word as user types
    const formattedValue = e.target.value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    onChange(formattedValue);
  };
  return React.createElement("div", {
    className: `space-y-2 ${className}`
  }, label && React.createElement(Label, {
    htmlFor: id,
    className: "text-sm font-medium text-[#010101]"
  }, label, " ", required && React.createElement("span", {
    className: "text-red-500"
  }, "*")), React.createElement(Input, {
    id: id,
    type: "text",
    placeholder: placeholder,
    value: value,
    onChange: handleChange,
    disabled: disabled,
    required: required,
    className: "h-11 border-2 border-slate-200 focus:border-[#195ADC] focus:ring-2 focus:ring-[#195ADC]/20 transition-all duration-200",
    minLength: 2,
    maxLength: 50,
    pattern: "[A-Za-z\\s]{2,50}",
    title: "Please enter a valid city name (2-50 characters, letters and spaces only)"
  }));
}