function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("div", _extends({
  ref: ref,
  className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)
}, props)));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("div", _extends({
  ref: ref,
  className: cn("flex flex-col space-y-1.5 p-6", className)
}, props)));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("h3", _extends({
  ref: ref,
  className: cn("text-2xl font-semibold leading-none tracking-tight", className)
}, props)));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("p", _extends({
  ref: ref,
  className: cn("text-sm text-muted-foreground", className)
}, props)));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("div", _extends({
  ref: ref,
  className: cn("p-6 pt-0", className)
}, props)));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({
  className,
  ...props
}, ref) => React.createElement("div", _extends({
  ref: ref,
  className: cn("flex items-center p-6 pt-0", className)
}, props)));
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };