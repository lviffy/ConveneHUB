import React from "react";
import { EventsHeader } from "@/components/events-header";
import Footer from "@/components/footer";
import FAQSection from "@/components/faq-section";
import ContactSection from "@/components/contact-section";
export const metadata = {
  title: "Contact Us - ConveneHub",
  description: "Have questions? Get in touch with the ConveneHub team or browse our FAQ."
};
export default function ContactPage() {
  return React.createElement("main", {
    className: "min-h-screen bg-white"
  }, React.createElement(EventsHeader, null), React.createElement("div", {
    className: "pt-16"
  }, React.createElement(FAQSection, null), React.createElement(ContactSection, null)), React.createElement(Footer, null));
}