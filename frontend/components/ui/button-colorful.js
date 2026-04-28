import React from "react";
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
function ButtonColorful({
  className,
  label = "Explore Components",
  ...props
}) {
  return React.createElement(Button, _extends({
    className: cn("relative h-10 px-4 overflow-hidden", "bg-[#010101]", "transition-all duration-200", "group", className)
  }, props), React.createElement("div", {
    className: cn("absolute inset-0", "bg-gradient-to-r from-[#195ADC] via-[#7F56D9] to-[#378FFA]", "opacity-40 group-hover:opacity-80", "blur transition-opacity duration-500")
  }), React.createElement("div", {
    className: "relative flex items-center justify-center gap-2"
  }, React.createElement("span", {
    className: "text-white"
  }, label), React.createElement(ArrowUpRight, {
    className: "w-3.5 h-3.5 text-white/90"
  })));
}
export { ButtonColorful };