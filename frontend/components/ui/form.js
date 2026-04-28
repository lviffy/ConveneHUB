"use client";

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
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
const Form = FormProvider;
const FormFieldContext = React.createContext({});
const FormField = ({
  ...props
}) => {
  return React.createElement(FormFieldContext.Provider, {
    value: {
      name: props.name
    }
  }, React.createElement(Controller, props));
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const {
    getFieldState,
    formState
  } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const {
    id
  } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext({});
const FormItem = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const id = React.useId();
  return React.createElement(FormItemContext.Provider, {
    value: {
      id
    }
  }, React.createElement("div", _extends({
    ref: ref,
    className: cn("space-y-2", className)
  }, props)));
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const {
    error,
    formItemId
  } = useFormField();
  return React.createElement(Label, _extends({
    ref: ref,
    className: cn(error && "text-destructive", className),
    htmlFor: formItemId
  }, props));
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef(({
  ...props
}, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId
  } = useFormField();
  return React.createElement(Slot, _extends({
    ref: ref,
    id: formItemId,
    "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
    "aria-invalid": !!error
  }, props));
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const {
    formDescriptionId
  } = useFormField();
  return React.createElement("p", _extends({
    ref: ref,
    id: formDescriptionId,
    className: cn("text-sm text-muted-foreground", className)
  }, props));
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  const {
    error,
    formMessageId
  } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) {
    return null;
  }
  return React.createElement("p", _extends({
    ref: ref,
    id: formMessageId,
    className: cn("text-sm font-medium text-destructive", className)
  }, props), body);
});
FormMessage.displayName = "FormMessage";
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };