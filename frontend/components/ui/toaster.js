"use client";
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
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
  const {
    toasts
  } = useToast();
  return React.createElement(ToastProvider, null, toasts.map(function ({
    id,
    title,
    description,
    action,
    ...props
  }) {
    return React.createElement(Toast, _extends({
      key: id
    }, props), React.createElement("div", {
      className: "grid gap-1"
    }, title && React.createElement(ToastTitle, null, title), description && React.createElement(ToastDescription, null, description)), action, React.createElement(ToastClose, null));
  }), React.createElement(ToastViewport, null));
}