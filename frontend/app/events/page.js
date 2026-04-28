import { Suspense } from "react";
import "./events.css";
import { EventsHeader } from "@/components/events-header";
import EventsBrowsePage from "@/components/events/events-browse-page";
import Footer from "@/components/footer";
import { Spinner } from "@/components/ui/spinner";
export const metadata = {
  title: "Events - CONVENEHUB Ticket Booking",
  description: "Explore upcoming events, reserve your seat, and get instant digital tickets with QR access."
};
function LoadingFallback() {
  return React.createElement("div", {
    className: "min-h-screen bg-white flex items-center justify-center"
  }, React.createElement("div", {
    className: "text-center"
  }, React.createElement(Spinner, {
    className: "w-12 h-12 text-gray-900 mx-auto mb-4"
  }), React.createElement("p", {
    className: "text-gray-500"
  }, "Loading events...")));
}
export default function EventsPage() {
  return React.createElement("main", {
    className: "min-h-screen text-render-optimized bg-white"
  }, React.createElement(EventsHeader, null), React.createElement("div", {
    className: "pt-16"
  }, React.createElement(Suspense, {
    fallback: React.createElement(LoadingFallback, null)
  }, React.createElement(EventsBrowsePage, null))), React.createElement(Footer, null));
}