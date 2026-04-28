import React from "react";
import clsx from "clsx";
import Link from "next/link";
export const ProjectBanner = ({
  label,
  icon,
  callToAction,
  className
}) => {
  return React.createElement("div", {
    className: clsx("inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#C6BEF4] rounded-full px-4 py-2 shadow-sm", className)
  }, icon && React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, icon), React.createElement("div", {
    className: "flex items-center gap-1.5 flex-wrap"
  }, React.createElement("span", {
    className: "text-gray-700 font-medium text-xs"
  }, label), callToAction && React.createElement(React.Fragment, null, React.createElement("span", {
    className: "text-gray-400 text-xs"
  }, "\u2022"), callToAction.href ? React.createElement(Link, {
    href: callToAction.href,
    className: "text-xs font-medium text-[#195ADC] underline underline-offset-2 decoration-[#195ADC] hover:text-[#378FFA] hover:decoration-[#378FFA] transition-colors duration-200"
  }, callToAction.label) : React.createElement("button", {
    onClick: callToAction.onClick,
    className: "text-xs font-medium text-[#195ADC] underline underline-offset-2 decoration-[#195ADC] hover:text-[#378FFA] hover:decoration-[#378FFA] transition-colors duration-200"
  }, callToAction.label))));
};