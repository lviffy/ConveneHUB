import React from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import ClientLayout from "@/app/client-layout";
import HomePage from "@/app/page";
import EventsPage from "@/app/events/page";
import LoginPage from "@/app/login/page";
import BookingsPage from "@/app/bookings/page";
import CompleteProfilePage from "@/app/complete-profile/page";
import ContactPage from "@/app/contact/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/reset-password/page";
import OrganizerLoginPage from "@/app/organizer-login/page";
import OrganizerForgotPasswordPage from "@/app/organizer-forgot-password/page";
import AdminUsersPage from "@/app/admin/users/page";
import AdminEventsEditPage from "@/app/admin/events/edit/page";
import AuthCallbackPage from "@/app/auth/callback/page";
import AuthErrorPage from "@/app/auth/error/page";
import PrivacyPage from "@/app/privacy/page";
import RefundPage from "@/app/refund/page";
import TermsPage from "@/app/terms/page";
import NotFound from "@/app/not-found";
import EventBookingPage from "@/components/events/event-booking-page";
import AdminPage from "@/src/pages/admin-page";
import OrganizerTeamPage from "@/src/pages/organizer-team-page";
import PromoterPage from "@/src/pages/promoter-page";
import { Toaster } from "@/components/ui/toaster";

function EventDetailsRoute() {
  const { id } = useParams();
  if (!id) {
    return <NotFound />;
  }
  return <EventBookingPage eventId={id} />;
}

export default function App() {
  return (
    <ClientLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/organizer-login" element={<OrganizerLoginPage />} />
        <Route
          path="/organizer-forgot-password"
          element={<OrganizerForgotPasswordPage />}
        />
        <Route path="/organizer" element={<OrganizerTeamPage />} />
        <Route path="/promoter" element={<PromoterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/events/edit" element={<AdminEventsEditPage />} />
        <Route
          path="/admin/assignments"
          element={<Navigate to="/admin?tab=events" replace />}
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ClientLayout>
  );
}
