"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
export default function NotFound() {
  const [isHovered, setIsHovered] = useState(false);
  return React.createElement("div", {
    className: "min-h-screen bg-white flex items-center justify-center px-4"
  }, React.createElement("div", {
    className: "text-center max-w-md"
  }, React.createElement("div", {
    className: "mb-8"
  }, React.createElement("h1", {
    className: "text-9xl font-bold text-blue-600"
  }, "404")), React.createElement("div", null, React.createElement("h2", {
    className: "text-3xl font-bold text-gray-900 mb-3"
  }, "Page Not Found"), React.createElement("p", {
    className: "text-gray-600 text-lg mb-8"
  }, "Sorry, the page you're looking for doesn't exist or has been moved.")), React.createElement("div", {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  }, React.createElement(Link, {
    href: "/"
  }, React.createElement("button", {
    className: cn("bg-blue-600 text-white hover:bg-blue-700", "font-semibold px-6 h-10 text-base", "group transition-all duration-300 border border-blue-500", "hover:border-blue-600 flex items-center gap-2 mx-auto rounded-lg", "relative overflow-hidden")
  }, React.createElement(motion.div, {
    animate: isHovered ? {
      x: ["100%", "-100%"]
    } : {
      x: "-100%"
    },
    transition: {
      duration: 0.8,
      repeat: isHovered ? Infinity : 0
    },
    className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
  }), React.createElement(ArrowLeft, {
    className: "w-4 h-4 relative"
  }), React.createElement("span", {
    className: "relative"
  }, "Back to Home"))))));
}