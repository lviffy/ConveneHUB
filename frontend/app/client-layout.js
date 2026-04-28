"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import ErrorBoundary from "@/components/error-boundary";
import { suppressKnownHydrationWarnings } from "@/lib/hydration-utils";
export default function ClientLayout({
  children
}) {
  const pathname = usePathname();
  useEffect(() => {
    // Suppress known hydration warnings from browser extensions
    suppressKnownHydrationWarnings();
  }, []);
  return React.createElement(ErrorBoundary, null, React.createElement(AnimatePresence, {
    mode: "wait"
  }, React.createElement(motion.div, {
    key: pathname,
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: 20
    },
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }, children)));
}