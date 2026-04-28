import React from "react";
import { cn } from "../lib/utils";
import Image from "next/image";
export const Logo = ({
  className,
  uniColor
}) => {
  return React.createElement("div", {
    className: cn("flex items-center space-x-1", className)
  }, React.createElement(Image, {
    src: "/logo/logo.jpg",
    alt: "ConveneHub Logo",
    width: 40,
    height: 40,
    className: "h-10 w-10"
  }), React.createElement("span", {
    className: "text-xl font-bold text-gray-900"
  }, "convenehub"));
};
export const BoltIcon = ({
  className,
  uniColor
}) => {
  return React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: cn("h-6 w-6", className)
  }, React.createElement("path", {
    d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    fill: uniColor ? "currentColor" : "url(#bolt-gradient)",
    stroke: uniColor ? "currentColor" : "url(#bolt-gradient)",
    strokeWidth: "0.5",
    strokeLinejoin: "round"
  }), React.createElement("defs", null, React.createElement("linearGradient", {
    id: "bolt-gradient",
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "22",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    stopColor: "#3B82F6"
  }), React.createElement("stop", {
    offset: "0.5",
    stopColor: "#1D4ED8"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#1E40AF"
  }))));
};
export const LogoIcon = ({
  className,
  uniColor
}) => {
  return React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: cn("h-6 w-6", className)
  }, React.createElement("path", {
    d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    fill: uniColor ? "currentColor" : "url(#bolt-gradient-icon)",
    stroke: uniColor ? "currentColor" : "url(#bolt-gradient-icon)",
    strokeWidth: "0.5",
    strokeLinejoin: "round"
  }), React.createElement("defs", null, React.createElement("linearGradient", {
    id: "bolt-gradient-icon",
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "22",
    gradientUnits: "userSpaceOnUse"
  }, React.createElement("stop", {
    stopColor: "#3B82F6"
  }), React.createElement("stop", {
    offset: "0.5",
    stopColor: "#1D4ED8"
  }), React.createElement("stop", {
    offset: "1",
    stopColor: "#1E40AF"
  }))));
};
export const LogoStroke = ({
  className
}) => {
  return React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: cn("h-7 w-7", className)
  }, React.createElement("path", {
    d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
};