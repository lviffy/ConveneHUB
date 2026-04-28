"use client";
import React from "react";

import { motion, useInView } from "framer-motion";
export function TimelineContent({
  children,
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  className = ""
}) {
  const isInView = useInView(timelineRef, {
    once: true,
    amount: 0.3
  });
  const defaultVariants = {
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6
      }
    }),
    hidden: {
      opacity: 0,
      y: 20
    }
  };
  const variants = customVariants || defaultVariants;
  return React.createElement(motion.div, {
    custom: animationNum,
    initial: "hidden",
    animate: isInView ? "visible" : "hidden",
    variants: variants,
    className: className
  }, Component === "div" ? children : React.createElement(Component, {
    className: className
  }, children));
}