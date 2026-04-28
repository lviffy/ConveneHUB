import React from "react";
import { EventsHeader } from "@/components/events-header";
import Footer from "@/components/footer";
export const metadata = {
  title: "Refund Policy | ConveneHub",
  description: "Refund and cancellation policy for ConveneHub bookings."
};
export default function RefundPolicy() {
  return React.createElement("main", {
    className: "min-h-screen bg-gray-50"
  }, React.createElement(EventsHeader, null), React.createElement("div", {
    className: "bg-white border-b border-gray-200 pt-32 pb-16"
  }, React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6"
  }, React.createElement("h1", {
    className: "text-4xl font-bold text-gray-900 mb-4"
  }, "Refund Policy"), React.createElement("p", {
    className: "text-lg text-gray-600"
  }, "Last updated: January 23, 2026"))), React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 py-16"
  }, React.createElement("div", {
    className: "bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm prose prose-blue max-w-none"
  }, React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "1. General Refund Principles"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "At ConveneHub, we strive to provide exceptional experiences. We understand that plans can change, and we have established this refund policy to be fair to both our users and the event organizers.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "2. Cancellation by User"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "Standard refund rules for most experiences:"), React.createElement("ul", {
    className: "list-disc pl-6 text-gray-700 space-y-2 mb-4"
  }, React.createElement("li", null, React.createElement("strong", null, "More than 7 days before the event:"), " 100% refund (minus a small processing fee)."), React.createElement("li", null, React.createElement("strong", null, "3 to 7 days before the event:"), " 50% refund."), React.createElement("li", null, React.createElement("strong", null, "Less than 72 hours before the event:"), " No refund available.")), React.createElement("p", {
    className: "text-sm text-gray-500 italic"
  }, "Note: Some specific high-demand events may have custom cancellation policies which will be clearly stated on the booking page.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "3. Cancellation by Organizer or ConveneHub"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "If an event is cancelled by the organizer, venue partner, or ConveneHub for any reason (including weather, technical issues, or operational changes), you will be entitled to a 100% refund of your booking amount.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "4. Refund Process"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "Once a refund is approved:"), React.createElement("ul", {
    className: "list-disc pl-6 text-gray-700 space-y-2 mb-4"
  }, React.createElement("li", null, "The refund will be processed back to the original payment method."), React.createElement("li", null, "It may take 5-7 business days for the amount to reflect in your account, depending on your bank."), React.createElement("li", null, "You will receive a confirmation email once the refund has been initiated."))), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "5. Rescheduling"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "If an event is rescheduled, your ticket will automatically be valid for the new date. If you are unable to attend on the new date, you can request a full refund within 48 hours of the rescheduling announcement.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "6. No-Shows"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "Refunds will not be provided for no-shows or if you arrive significantly late to an event where entry has already been closed.")), React.createElement("section", null, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "7. Contact Support"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed"
  }, "To request a refund or for any payment-related inquiries, please contact our support team:", React.createElement("br", null), "Email: ", React.createElement("a", {
    href: "mailto:refunds@convenehub.com",
    className: "text-blue-600 hover:underline"
  }, "refunds@convenehub.com"), React.createElement("br", null), "Please provide your Booking ID for faster processing.")))), React.createElement(Footer, null));
}