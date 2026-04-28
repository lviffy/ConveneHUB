import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { CompleteProfileForm } from "./complete-profile-form";
export default function CompleteProfilePage() {
  return React.createElement(Suspense, {
    fallback: React.createElement("div", {
      className: "min-h-screen flex items-center justify-center"
    }, React.createElement(Spinner, {
      className: "w-8 h-8"
    }))
  }, React.createElement(CompleteProfileForm, null));
}