"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/convene/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EventsHeader } from "@/components/events-header";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Ticket, QrCode, Download, AlertCircle, CheckCircle2, Clock, ArrowLeft, X, Info } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
export default function MyBookingsPage() {
  const router = useRouter();
  const client = createClient();
  const {
    toast
  } = useToast();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQR, setLoadingQR] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  // Tickets per booking cache: booking_id -> TicketData[]
  const [ticketsMap, setTicketsMap] = useState({});
  const [loadingTicketsMap, setLoadingTicketsMap] = useState({});
  // QR images per ticket cache: ticket_id -> qr image url/base64
  const [ticketQrMap, setTicketQrMap] = useState({});
  const [loadingTicketQrMap, setLoadingTicketQrMap] = useState({});
  // Modal state for viewing individual ticket QR
  const [selectedTicketQR, setSelectedTicketQR] = useState(null);
  // Delete booking state
  const [deletingBooking, setDeletingBooking] = useState(null);
  // Confirmation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  useEffect(() => {
    checkAuth();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [bookings, filterStatus]);
  const applyFilters = () => {
    let filtered = [...bookings];
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => {
        switch (filterStatus) {
          case "free":
            return !booking.payment_required;
          case "paid":
            return booking.payment_status === "SUCCESSFUL" || booking.payment_status === "paid";
          case "pending":
            return booking.payment_status === "PENDING" || booking.payment_status === "pending";
          case "failed":
            return booking.payment_status === "FAILED" || booking.payment_status === "failed";
          case "confirmed":
            return booking.booking_status === "confirmed";
          case "checked_in":
            return booking.booking_status === "checked_in";
          default:
            return true;
        }
      });
    }
    setFilteredBookings(filtered);
  };
  const checkAuth = async () => {
    const {
      data: {
        user
      }
    } = await client.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/bookings");
      return;
    }
    fetchBookings();
  };
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bookings");
      }
      const bookingsList = data.bookings || [];
      setBookings(bookingsList);

      // Auto-load tickets and QR codes for all confirmed/checked_in bookings
      bookingsList.forEach(async booking => {
        if (booking.booking_status === "confirmed" || booking.booking_status === "checked_in") {
          await fetchTicketsForBooking(booking.booking_id);
          // Wait a tiny bit for tickets to populate state, then fetch all QRs
          setTimeout(() => fetchAllTicketQrsForBooking(booking.booking_id), 100);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchQRCode = async bookingId => {
    try {
      setLoadingQR(bookingId);
      setQrCode(null);
      const response = await fetch(`/api/bookings/${bookingId}/qr`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      // guard: make sure the qr_code is a valid data URL before setting
      if (data.qr_code && /^data:image\//.test(data.qr_code)) {
        setQrCode(data.qr_code);
      } else {
        setQrCode(null);
      }
      setSelectedBooking(bookingId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load QR code");
    } finally {
      setLoadingQR(null);
    }
  };
  const fetchTicketsForBooking = useCallback(async bookingId => {
    if (!bookingId) return;
    try {
      setLoadingTicketsMap(prev => ({
        ...prev,
        [bookingId]: true
      }));
      const resp = await fetch(`/api/bookings/${bookingId}/tickets`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch tickets");
      const tickets = data.tickets || [];
      setTicketsMap(prev => ({
        ...prev,
        [bookingId]: tickets
      }));

      // If no tickets found for a confirmed paid booking, try to create them
      if (tickets.length === 0 && data.booking) {
        try {
          const createResp = await fetch(`/api/bookings/${bookingId}/create-missing-tickets`, {
            method: "POST"
          });
          const createData = await createResp.json();
          if (createResp.ok) {
            // Refresh tickets after creation
            const refreshResp = await fetch(`/api/bookings/${bookingId}/tickets`);
            const refreshData = await refreshResp.json();
            if (refreshResp.ok) {
              setTicketsMap(prev => ({
                ...prev,
                [bookingId]: refreshData.tickets || []
              }));
            }
          } else {}
        } catch (createErr) {
          // Silently fail - don't disrupt the user experience
        }
      }
    } catch (err) {
      setTicketsMap(prev => ({
        ...prev,
        [bookingId]: []
      }));
    } finally {
      setLoadingTicketsMap(prev => ({
        ...prev,
        [bookingId]: false
      }));
    }
  }, []);
  const fetchTicketQr = useCallback(async ticketId => {
    if (!ticketId) return;
    try {
      setLoadingTicketQrMap(prev => ({
        ...prev,
        [ticketId]: true
      }));
      const resp = await fetch(`/api/tickets/${ticketId}/qr`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch ticket QR");
      // guard: only set if we got a valid data URI for the QR image
      if (data.qr_code && /^data:image\//.test(data.qr_code)) {
        setTicketQrMap(prev => ({
          ...prev,
          [ticketId]: data.qr_code
        }));
      } else {
        setTicketQrMap(prev => ({
          ...prev,
          [ticketId]: ""
        }));
      }
    } catch (err) {} finally {
      setLoadingTicketQrMap(prev => ({
        ...prev,
        [ticketId]: false
      }));
    }
  }, []);
  const fetchAllTicketQrsForBooking = useCallback(async bookingId => {
    const tickets = ticketsMap[bookingId] || [];
    await Promise.all(tickets.map(t => fetchTicketQr(t.ticket_id)));
  }, [ticketsMap, fetchTicketQr]);
  const downloadQRCode = bookingCode => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `ticket-${bookingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadTicketQR = (ticketCode, qrImage) => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `ticket-${ticketCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleTicketClick = async (ticket, bookingCode) => {
    // If QR already loaded, show modal immediately
    const existingQR = ticketQrMap[ticket.ticket_id];
    if (existingQR) {
      setSelectedTicketQR({
        ticket,
        qrCode: existingQR,
        bookingCode
      });
      return;
    }

    // Load QR first
    try {
      setLoadingTicketQrMap(prev => ({
        ...prev,
        [ticket.ticket_id]: true
      }));
      const resp = await fetch(`/api/tickets/${ticket.ticket_id}/qr`);
      const data = await resp.json();
      if (resp.ok && data.qr_code && /^data:image\//.test(data.qr_code)) {
        setTicketQrMap(prev => ({
          ...prev,
          [ticket.ticket_id]: data.qr_code
        }));
        setSelectedTicketQR({
          ticket,
          qrCode: data.qr_code,
          bookingCode
        });
      } else {}
    } catch (err) {} finally {
      setLoadingTicketQrMap(prev => ({
        ...prev,
        [ticket.ticket_id]: false
      }));
    }
  };
  const handleDeleteBooking = async bookingId => {
    try {
      setDeletingBooking(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Show success toast
      toast({
        title: "✅ Booking Cancelled Successfully",
        description: `${data.tickets_released} ticket(s) have been released and are now available for others to book.`,
        duration: 5000
      });

      // Close dialog
      setShowCancelDialog(false);
      setBookingToCancel(null);

      // Refresh bookings list from backend to ensure sync
      await fetchBookings();
    } catch (err) {
      toast({
        title: "❌ Cancellation Failed",
        description: err.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setDeletingBooking(null);
    }
  };
  const confirmCancelBooking = booking => {
    setBookingToCancel({
      id: booking.booking_id,
      code: booking.booking_code,
      tickets: booking.tickets_count
    });
    setShowCancelDialog(true);
  };
  const getStatusBadge = status => {
    switch (status) {
      case "confirmed":
        return React.createElement(Badge, {
          className: "bg-green-500"
        }, "Confirmed");
      case "checked_in":
        return React.createElement(Badge, {
          className: "bg-blue-500"
        }, "Checked In");
      case "cancelled":
        return React.createElement(Badge, {
          className: "bg-red-500"
        }, "Cancelled");
      default:
        return React.createElement(Badge, null, status);
    }
  };
  const getPaymentBadge = (paymentStatus, paymentRequired) => {
    if (!paymentRequired) {
      return React.createElement(Badge, {
        variant: "outline",
        className: "bg-gray-100 text-gray-700"
      }, "Free");
    }
    switch (paymentStatus?.toUpperCase()) {
      case "SUCCESSFUL":
      case "PAID":
        return React.createElement(Badge, {
          className: "bg-green-500"
        }, "Paid");
      case "FAILED":
        return React.createElement(Badge, {
          className: "bg-red-500"
        }, "Payment Failed");
      default:
        return React.createElement(Badge, {
          variant: "outline"
        }, "Unknown");
    }
  };
  if (isLoading) {
    return React.createElement("div", {
      className: "min-h-screen bg-gradient-to-b from-gray-50 to-white"
    }, React.createElement(EventsHeader, null), React.createElement("div", {
      className: "flex items-center justify-center h-[calc(100vh-80px)]"
    }, React.createElement("div", {
      className: "text-center"
    }, React.createElement(Spinner, {
      className: "mx-auto mb-4"
    }), React.createElement("p", {
      className: "text-gray-600"
    }, "Loading your bookings..."))));
  }
  return React.createElement("div", {
    className: "min-h-screen bg-gradient-to-b from-gray-50 to-white"
  }, React.createElement(EventsHeader, null), React.createElement("div", {
    className: "container mx-auto px-4 pb-8 pt-24 md:pt-32 max-w-6xl"
  }, React.createElement("div", {
    className: "mb-8"
  }, React.createElement("h1", {
    className: "md:hidden text-2xl font-bold py-4"
  }, "Bookings"), React.createElement("div", {
    className: "hidden md:block"
  }, React.createElement(Button, {
    variant: "ghost",
    onClick: () => router.back(),
    className: "mb-4"
  }, React.createElement(ArrowLeft, {
    className: "mr-2 h-4 w-4"
  }), "Back"), React.createElement("h1", {
    className: "text-4xl font-bold mb-2"
  }, "My Bookings"), React.createElement("p", {
    className: "text-gray-600"
  }, "View and manage your event bookings"))), !error && bookings.length > 0 && React.createElement("div", {
    className: "mb-6 flex flex-wrap gap-2"
  }, React.createElement(Button, {
    variant: filterStatus === "all" ? "default" : "outline",
    size: "sm",
    onClick: () => setFilterStatus("all")
  }, "All (", bookings.length, ")"), React.createElement(Button, {
    variant: filterStatus === "confirmed" ? "default" : "outline",
    size: "sm",
    onClick: () => setFilterStatus("confirmed")
  }, "Confirmed (", bookings.filter(b => b.booking_status === "confirmed").length, ")"), React.createElement(Button, {
    variant: filterStatus === "checked_in" ? "default" : "outline",
    size: "sm",
    onClick: () => setFilterStatus("checked_in")
  }, "Checked In (", bookings.filter(b => b.booking_status === "checked_in").length, ")"), React.createElement(Button, {
    variant: filterStatus === "free" ? "default" : "outline",
    size: "sm",
    onClick: () => setFilterStatus("free")
  }, "Free (", bookings.filter(b => !b.payment_required).length, ")"), React.createElement(Button, {
    variant: filterStatus === "paid" ? "default" : "outline",
    size: "sm",
    onClick: () => setFilterStatus("paid")
  }, "Paid (", bookings.filter(b => b.payment_status === "SUCCESSFUL" || b.payment_status === "paid").length, ")")), error && React.createElement(Card, {
    className: "border-red-200 bg-red-50 mb-6"
  }, React.createElement(CardContent, {
    className: "pt-6"
  }, React.createElement("div", {
    className: "flex items-center gap-3 text-red-800"
  }, React.createElement(AlertCircle, {
    className: "h-5 w-5"
  }), React.createElement("p", null, error)))), !error && bookings.length === 0 && React.createElement(Card, {
    className: "border-dashed"
  }, React.createElement(CardContent, {
    className: "pt-12 pb-12 text-center"
  }, React.createElement(Ticket, {
    className: "h-16 w-16 mx-auto mb-4 text-gray-400"
  }), React.createElement("h3", {
    className: "text-xl font-semibold mb-2"
  }, "No bookings yet"), React.createElement("p", {
    className: "text-gray-600 mb-6"
  }, "You haven't booked any events. Start exploring and book your first experience!"), React.createElement(Button, {
    onClick: () => router.push("/events")
  }, "Browse Events"))), bookings.length > 0 && React.createElement(React.Fragment, null, filteredBookings.length === 0 ? React.createElement(Card, {
    className: "border-dashed"
  }, React.createElement(CardContent, {
    className: "pt-12 pb-12 text-center"
  }, React.createElement(Ticket, {
    className: "h-16 w-16 mx-auto mb-4 text-gray-400"
  }), React.createElement("h3", {
    className: "text-xl font-semibold mb-2"
  }, "No bookings match this filter"), React.createElement("p", {
    className: "text-gray-600 mb-6"
  }, "Try selecting a different filter to see your bookings."), React.createElement(Button, {
    onClick: () => setFilterStatus("all"),
    variant: "outline"
  }, "Show All Bookings"))) : React.createElement("div", {
    className: "grid gap-6 md:grid-cols-2 lg:grid-cols-2"
  }, filteredBookings.map(booking => React.createElement(Card, {
    key: booking.booking_id,
    className: "overflow-hidden hover:shadow-lg transition-shadow"
  }, React.createElement(CardHeader, {
    className: "pb-4"
  }, React.createElement("div", {
    className: "flex justify-between items-start mb-2"
  }, React.createElement(CardTitle, {
    className: "text-xl"
  }, booking.event.title), React.createElement("div", {
    className: "flex gap-2 flex-wrap"
  }, getStatusBadge(booking.booking_status), getPaymentBadge(booking.payment_status, booking.payment_required))), React.createElement(CardDescription, null, "Booking Code: ", React.createElement("span", {
    className: "font-mono font-bold text-black"
  }, booking.booking_code))), React.createElement(CardContent, {
    className: "space-y-4"
  }, booking.event.event_image && React.createElement("div", {
    className: "relative w-full h-40 rounded-lg overflow-hidden"
  }, React.createElement(Image, {
    src: booking.event.event_image,
    alt: booking.event.title,
    fill: true,
    className: "object-cover"
  })), React.createElement("div", {
    className: "space-y-2 text-sm"
  }, React.createElement("div", {
    className: "flex items-start gap-2"
  }, React.createElement(Calendar, {
    className: "h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0"
  }), React.createElement("span", null, format(new Date(booking.event.date_time), "EEEE, MMMM d, yyyy • h:mm a"))), React.createElement("div", {
    className: "flex items-start gap-2"
  }, React.createElement(MapPin, {
    className: "h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0"
  }), React.createElement("div", null, React.createElement("div", {
    className: "font-medium"
  }, booking.event.venue_name), React.createElement("div", {
    className: "text-gray-600"
  }, booking.event.city))), React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement(Ticket, {
    className: "h-4 w-4 text-gray-500"
  }), React.createElement("span", null, booking.tickets_count, " ", booking.tickets_count === 1 ? "Ticket" : "Tickets")), booking.total_amount > 0 && React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("span", {
    className: "font-semibold"
  }, "\u20B9", booking.total_amount.toFixed(2))), React.createElement("div", {
    className: "flex items-center gap-2 text-gray-500"
  }, React.createElement(Clock, {
    className: "h-4 w-4"
  }), React.createElement("span", null, "Booked on ", format(new Date(booking.booked_at), "MMM d, yyyy")))), (booking.payment_status === "PENDING" || booking.payment_status === "pending" || booking.payment_status === "FAILED" || booking.payment_status === "failed") && React.createElement("div", {
    className: "pt-4 border-t"
  }, React.createElement("div", {
    className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3"
  }, React.createElement("div", {
    className: "flex items-start gap-3"
  }, React.createElement(AlertCircle, {
    className: "h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0"
  }), React.createElement("div", {
    className: "flex-1"
  }, React.createElement("p", {
    className: "font-medium text-yellow-900 mb-1"
  }, booking.payment_status === "PENDING" || booking.payment_status === "pending" ? "Payment Pending" : "Payment Failed"), React.createElement("p", {
    className: "text-sm text-yellow-700 mb-3"
  }, booking.payment_status === "PENDING" || booking.payment_status === "pending" ? "Complete your payment to confirm this booking. Pending bookings will be automatically cancelled after 15 minutes." : "Your payment was not successful. This booking has been cancelled and slots have been released. You can try booking again."), React.createElement("div", {
    className: "flex gap-2 flex-wrap"
  }, (booking.payment_status === "PENDING" || booking.payment_status === "pending") && React.createElement(React.Fragment, null, React.createElement(Button, {
    onClick: () => router.push(`/events/${booking.event.event_id}`),
    size: "sm",
    className: "bg-blue-600 hover:bg-blue-700"
  }, "Complete Payment"), React.createElement(Button, {
    onClick: () => confirmCancelBooking(booking),
    size: "sm",
    variant: "outline",
    disabled: deletingBooking === booking.booking_id,
    className: "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
  }, deletingBooking === booking.booking_id ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "w-4 h-4 mr-2"
  }), "Cancelling...") : React.createElement(React.Fragment, null, React.createElement(X, {
    className: "w-4 h-4 mr-1"
  }), "Cancel Booking"))), (booking.payment_status === "FAILED" || booking.payment_status === "failed") && React.createElement(Button, {
    onClick: () => router.push(`/events/${booking.event.event_id}`),
    size: "sm",
    className: "bg-yellow-600 hover:bg-yellow-700"
  }, "Book Again")))))), (booking.booking_status === "confirmed" || booking.booking_status === "checked_in") && (booking.payment_status === "SUCCESSFUL" || booking.payment_status === "NOT_REQUIRED") && booking.tickets_count < 10 && new Date(booking.event.date_time) > new Date() && (
  // Event hasn't happened yet
  booking.event.status === "published" || booking.event.status === "checkin_open") && React.createElement("div", {
    className: "pt-4 border-t"
  }, React.createElement(Button, {
    onClick: () => router.push(`/events/${booking.event.event_id}`),
    variant: "outline",
    className: "w-full border-blue-300 text-blue-600 hover:bg-blue-50",
    size: "sm"
  }, React.createElement(Ticket, {
    className: "w-4 h-4 mr-2"
  }), "Add More Tickets")), (booking.booking_status === "confirmed" || booking.booking_status === "checked_in") && React.createElement("div", {
    className: "pt-4 border-t"
  }, React.createElement("div", {
    className: "mb-3"
  }, selectedBooking === booking.booking_id && qrCode ? React.createElement("div", {
    className: "space-y-3"
  }, React.createElement("div", {
    className: "relative w-full aspect-square max-w-[220px] mx-auto bg-white p-4 rounded-lg border-2"
  }, React.createElement(Image, {
    src: qrCode,
    alt: "Booking QR Code",
    fill: true,
    className: "object-contain"
  })), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement(Button, {
    onClick: () => downloadQRCode(booking.booking_code),
    className: "flex-1",
    variant: "outline"
  }, React.createElement(Download, {
    className: "mr-2 h-4 w-4"
  }), "Download"), React.createElement(Button, {
    onClick: () => setSelectedBooking(null),
    variant: "outline"
  }, "Hide"))) : React.createElement(Button, {
    onClick: () => fetchQRCode(booking.booking_id),
    disabled: loadingQR === booking.booking_id,
    className: "w-full"
  }, loadingQR === booking.booking_id ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "mr-2 h-4 w-4"
  }), "Generating...") : React.createElement(React.Fragment, null, React.createElement(QrCode, {
    className: "mr-2 h-4 w-4"
  }), "Show Booking QR"))), React.createElement("div", {
    className: "mt-4"
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, React.createElement("div", {
    className: "text-sm font-semibold"
  }, "Tickets"), React.createElement("div", {
    className: "text-xs text-gray-500"
  }, booking.tickets_count, " total")), loadingTicketsMap[booking.booking_id] ? React.createElement("div", {
    className: "text-center py-4"
  }, React.createElement(Spinner, {
    className: "mx-auto"
  }), React.createElement("p", {
    className: "text-sm text-gray-500 mt-2"
  }, "Loading tickets...")) : ticketsMap[booking.booking_id] && ticketsMap[booking.booking_id].length > 0 ? React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, ticketsMap[booking.booking_id].map(t => React.createElement("button", {
    key: t.ticket_id,
    onClick: () => handleTicketClick(t, booking.booking_code),
    className: "bg-gray-50 rounded-lg p-3 border border-gray-200 text-center hover:bg-gray-100 hover:border-blue-400 transition-all cursor-pointer"
  }, React.createElement("div", {
    className: "text-sm font-semibold"
  }, "Ticket ", t.ticket_number), React.createElement("div", {
    className: "text-xs font-mono text-gray-600 mb-2"
  }, t.ticket_code), t.checked_in && React.createElement(Badge, {
    className: "bg-green-100 text-green-800 text-xs mb-2"
  }, "\u2713 Checked In"), loadingTicketQrMap[t.ticket_id] ? React.createElement("div", {
    className: "text-center py-4"
  }, React.createElement(Spinner, {
    className: "mx-auto h-6 w-6"
  })) : React.createElement("div", {
    className: "flex items-center justify-center gap-1 text-xs text-blue-600 mt-2"
  }, React.createElement(QrCode, {
    className: "w-3 h-3"
  }), "Click to view QR")))) : React.createElement("div", {
    className: "text-center py-2 text-sm text-gray-500"
  }, "No tickets found")), booking.event.entry_instructions && React.createElement("div", {
    className: "text-xs text-gray-600 bg-blue-50 p-3 rounded mt-4"
  }, React.createElement("strong", null, "Entry Instructions:"), React.createElement("p", {
    className: "mt-1"
  }, booking.event.entry_instructions))), booking.booking_status === "checked_in" && React.createElement("div", {
    className: "pt-4 border-t"
  }, React.createElement("div", {
    className: "flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded"
  }, React.createElement(CheckCircle2, {
    className: "h-5 w-5"
  }), React.createElement("span", {
    className: "font-medium"
  }, ticketsMap[booking.booking_id]?.some(t => !t.checked_in) ? `Partially checked in (${ticketsMap[booking.booking_id]?.filter(t => t.checked_in).length}/${ticketsMap[booking.booking_id]?.length} tickets)` : "You've checked in to this event"))))))))), selectedTicketQR && React.createElement("div", {
    className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
    onClick: () => setSelectedTicketQR(null)
  }, React.createElement("div", {
    className: "bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-4"
  }, React.createElement("div", null, React.createElement("h3", {
    className: "text-xl font-bold"
  }, "Ticket ", selectedTicketQR.ticket.ticket_number), React.createElement("p", {
    className: "text-sm text-gray-600 font-mono"
  }, selectedTicketQR.ticket.ticket_code)), React.createElement("button", {
    onClick: () => setSelectedTicketQR(null),
    className: "text-gray-500 hover:text-gray-700 p-2"
  }, React.createElement(X, {
    className: "w-6 h-6"
  }))), selectedTicketQR.ticket.checked_in && React.createElement("div", {
    className: "mb-4 p-3 bg-green-50 rounded-lg border border-green-200"
  }, React.createElement("div", {
    className: "flex items-center gap-2 text-green-800"
  }, React.createElement(CheckCircle2, {
    className: "w-5 h-5"
  }), React.createElement("div", null, React.createElement("div", {
    className: "font-semibold"
  }, "Already Checked In"), selectedTicketQR.ticket.checked_in_at && React.createElement("div", {
    className: "text-xs text-green-700"
  }, new Date(selectedTicketQR.ticket.checked_in_at).toLocaleString())))), React.createElement("div", {
    className: "relative w-full aspect-square bg-white p-4 rounded-lg border-2 border-gray-200 mb-4"
  }, React.createElement(Image, {
    src: selectedTicketQR.qrCode,
    alt: `QR Code for ${selectedTicketQR.ticket.ticket_code}`,
    fill: true,
    className: "object-contain"
  })), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement(Button, {
    onClick: () => downloadTicketQR(selectedTicketQR.ticket.ticket_code, selectedTicketQR.qrCode),
    className: "w-full bg-blue-600 hover:bg-blue-700"
  }, React.createElement(Download, {
    className: "mr-2 h-4 w-4"
  }), "Download QR Code"), React.createElement(Button, {
    onClick: () => setSelectedTicketQR(null),
    variant: "outline",
    className: "w-full"
  }, "Close")), React.createElement("div", {
    className: "mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700"
  }, React.createElement("div", {
    className: "flex items-start gap-2"
  }, React.createElement(Info, {
    className: "w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600"
  }), React.createElement("p", null, "Present this QR code at the event entrance for check-in. Each ticket must be scanned individually."))))), showCancelDialog && bookingToCancel && React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  }, React.createElement("div", {
    className: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
  }, React.createElement("div", {
    className: "flex items-start gap-4 mb-4"
  }, React.createElement("div", {
    className: "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"
  }, React.createElement(AlertCircle, {
    className: "w-6 h-6 text-red-600"
  })), React.createElement("div", {
    className: "flex-1"
  }, React.createElement("h3", {
    className: "text-xl font-bold text-gray-900 mb-1"
  }, "Cancel Booking?"), React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "This action cannot be undone."))), React.createElement("div", {
    className: "bg-gray-50 rounded-lg p-4 mb-6 space-y-2"
  }, React.createElement("div", {
    className: "flex justify-between text-sm"
  }, React.createElement("span", {
    className: "text-gray-600"
  }, "Booking Code:"), React.createElement("span", {
    className: "font-mono font-bold text-gray-900"
  }, bookingToCancel.code)), React.createElement("div", {
    className: "flex justify-between text-sm"
  }, React.createElement("span", {
    className: "text-gray-600"
  }, "Tickets to Release:"), React.createElement("span", {
    className: "font-semibold text-gray-900"
  }, bookingToCancel.tickets))), React.createElement("div", {
    className: "bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6"
  }, React.createElement("div", {
    className: "flex items-start gap-2"
  }, React.createElement(Info, {
    className: "w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600"
  }), React.createElement("p", {
    className: "text-xs text-blue-900"
  }, bookingToCancel.tickets, " ticket(s) will be released and become available for other users to book."))), React.createElement("div", {
    className: "flex gap-3"
  }, React.createElement(Button, {
    onClick: () => {
      setShowCancelDialog(false);
      setBookingToCancel(null);
    },
    variant: "outline",
    className: "flex-1",
    disabled: deletingBooking === bookingToCancel.id
  }, "Keep Booking"), React.createElement(Button, {
    onClick: () => handleDeleteBooking(bookingToCancel.id),
    className: "flex-1 bg-red-600 hover:bg-red-700",
    disabled: deletingBooking === bookingToCancel.id
  }, deletingBooking === bookingToCancel.id ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "w-4 h-4 mr-2"
  }), "Cancelling...") : React.createElement(React.Fragment, null, React.createElement(X, {
    className: "w-4 h-4 mr-2"
  }), "Yes, Cancel Booking"))))));
}