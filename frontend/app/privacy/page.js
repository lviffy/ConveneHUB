import { EventsHeader } from "@/components/events-header";
import Footer from "@/components/footer";
export const metadata = {
  title: "Privacy Policy | ConveneHub",
  description: "Privacy policy for ConveneHub booking platform."
};
export default function PrivacyPolicy() {
  return React.createElement("main", {
    className: "min-h-screen bg-gray-50"
  }, React.createElement(EventsHeader, null), React.createElement("div", {
    className: "bg-white border-b border-gray-200 pt-32 pb-16"
  }, React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6"
  }, React.createElement("h1", {
    className: "text-4xl font-bold text-gray-900 mb-4"
  }, "Privacy Policy"), React.createElement("p", {
    className: "text-lg text-gray-600"
  }, "Last updated: January 23, 2026"))), React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 py-16"
  }, React.createElement("div", {
    className: "bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm prose prose-blue max-w-none"
  }, React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "1. Information We Collect"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "We collect information you provide directly to us, such as when you create an account, make a booking, subscribe to our newsletter, or contact support. This may include:"), React.createElement("ul", {
    className: "list-disc pl-6 text-gray-700 space-y-2 mb-4"
  }, React.createElement("li", null, "Name, email address, and phone number"), React.createElement("li", null, "Billing information and transaction history"), React.createElement("li", null, "Profile information and preferences"), React.createElement("li", null, "Communications with our team"))), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "2. How We Use Your Information"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "We use the collected information for various purposes, including:"), React.createElement("ul", {
    className: "list-disc pl-6 text-gray-700 space-y-2 mb-4"
  }, React.createElement("li", null, "Processing and confirming your event bookings"), React.createElement("li", null, "Sending transactional emails and notifications"), React.createElement("li", null, "Providing customer support and responding to inquiries"), React.createElement("li", null, "Improving our platform and user experience"), React.createElement("li", null, "Complying with legal obligations"))), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "3. Information Sharing"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "We do not sell your personal information. We may share your information with:"), React.createElement("ul", {
    className: "list-disc pl-6 text-gray-700 space-y-2 mb-4"
  }, React.createElement("li", null, React.createElement("strong", null, "Event Organizers:"), " To verify your booking at the venue."), React.createElement("li", null, React.createElement("strong", null, "Service Providers:"), " Email services, hosting providers, and analytics tools that help us operate the platform."), React.createElement("li", null, React.createElement("strong", null, "Legal Authorities:"), " When required by law or to protect our rights."))), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "4. Data Security"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "5. Your Rights"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "You have the right to access, correct, or delete your personal information. You can manage your profile settings through your account dashboard or contact us for assistance.")), React.createElement("section", {
    className: "mb-10"
  }, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "6. Cookies"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed mb-4"
  }, "We use cookies and similar technologies to enhance your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.")), React.createElement("section", null, React.createElement("h2", {
    className: "text-2xl font-bold text-gray-900 mb-4"
  }, "7. Contact Us"), React.createElement("p", {
    className: "text-gray-700 leading-relaxed"
  }, "If you have any questions about this Privacy Policy, please contact us at:", React.createElement("br", null), "Email: ", React.createElement("a", {
    href: "mailto:privacy@convenehub.com",
    className: "text-blue-600 hover:underline"
  }, "privacy@convenehub.com"))))), React.createElement(Footer, null));
}