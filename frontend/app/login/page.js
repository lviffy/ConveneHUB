import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "./login-form";
export default function LoginPage() {
  return React.createElement(Suspense, {
    fallback: React.createElement("div", {
      className: "min-h-screen flex items-center justify-center"
    }, React.createElement(Spinner, {
      className: "w-8 h-8"
    }))
  }, React.createElement(LoginForm, null));
}