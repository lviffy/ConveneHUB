# 📚 ConveneHub API Documentation

Complete API reference for the ConveneHub ticket booking system.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Public Endpoints](#public-endpoints)
- [User Endpoints](#user-endpoints)
- [Coupon Endpoints](#coupon-endpoints)
- [Payment Endpoints](#payment-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Movie Team Endpoints](#movie-team-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

**Base URL:** `https://your-domain.com/api`  
**Version:** 1.0.0  
**Format:** JSON

### HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources
- `DELETE` - Remove resources

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Authentication

All authenticated endpoints require a valid Supabase session cookie or Bearer token.

### Authentication Headers
```http
Cookie: sb-<project>-auth-token=<token>
```

OR

```http
Authorization: Bearer <access_token>
```

---

## Authorization

ConveneHub uses role-based access control (RBAC) with three roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| `user` | Regular attendee | Book tickets, view own bookings |
| `movie_team` | Event staff | Check-in attendees, view assigned events |
| `eon_team` | Administrator | Full system access, manage events/users |

---

## Public Endpoints

### Health Check

```http
GET /api
```

Returns API status and available endpoints.

**Response:**
```json
{
  "status": "ok",
  "message": "CONVENEHUB Backend API",
  "version": "1.0.0",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "endpoints": {
    "auth": { ... },
    "admin": { ... }
  }
}
```

---

### Get Public Events

```http
GET /api/events/public
```

Returns all published events with accurate booking counts (bypasses RLS).

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "event_id": "uuid",
      "title": "Pushpa 2 Premiere",
      "description": "Exclusive premiere screening",
      "date_time": "2025-11-20T18:00:00Z",
      "venue_name": "PVR Cinemas",
      "venue_address": "123 Mall Road",
      "city": "Mumbai",
      "capacity": 500,
      "remaining": 245,
      "ticket_price": 499.00,
      "status": "published",
      "image_url": "https://...",
      "booking_count": 255
    }
  ]
}
```

---

## User Endpoints

### Create Booking

```http
POST /api/bookings
```

Create a new ticket booking for an event.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "event_id": "uuid",
  "tickets_count": 2
}
```

**Validation:**
- `event_id` - Required UUID
- `tickets_count` - Integer between 1-10

**Response (201):**
```json
{
  "success": true,
  "booking": {
    "booking_id": "uuid",
    "event_id": "uuid",
    "user_id": "uuid",
    "booking_code": "EON-ABC123",
    "tickets_count": 2,
    "total_amount": 998.00,
    "booking_status": "confirmed",
    "checked_in": false,
    "booked_at": "2025-11-15T10:30:00Z",
    "qr_nonce": "random_string",
    "event": { ... }
  },
  "message": "Booking created successfully. Check your email for confirmation."
}
```

**Error Responses:**
- `401` - User not authenticated
- `400` - Invalid tickets_count or event not available
- `409` - User already booked this event
- `400` - Not enough slots available

---

### Get User Bookings

```http
GET /api/bookings?status=confirmed&event_id=uuid
```

Get all bookings for the authenticated user.

**Authentication:** Required  
**Role:** Any authenticated user

**Query Parameters:**
- `status` (optional) - Filter by booking status: `confirmed`, `checked_in`, `cancelled`
- `event_id` (optional) - Filter by specific event

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "booking_id": "uuid",
      "booking_code": "EON-ABC123",
      "event": {
        "title": "Pushpa 2 Premiere",
        "date_time": "2025-11-20T18:00:00Z",
        "venue_name": "PVR Cinemas"
      },
      "tickets_count": 2,
      "booking_status": "confirmed",
      "checked_in": false
    }
  ],
  "count": 1
}
```

---

### Get Booking QR Code

```http
GET /api/bookings/{bookingId}/qr
```

Generate QR code for a specific booking.

**Authentication:** Required  
**Role:** Booking owner or `eon_team`

**Path Parameters:**
- `bookingId` - UUID of the booking

**Response:**
```json
{
  "success": true,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "booking_code": "EON-ABC123"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not booking owner
- `404` - Booking not found

---

### Get Event Bookings

```http
GET /api/bookings/event/{eventId}?status=confirmed
```

Get all bookings for a specific event.

**Authentication:** Required  
**Role:** `eon_team` or `movie_team` (must be assigned to event)

**Path Parameters:**
- `eventId` - UUID of the event

**Query Parameters:**
- `status` (optional) - Filter by booking status

**Response:**
```json
{
  "success": true,
  "event": {
    "title": "Pushpa 2 Premiere",
    "capacity": 500,
    "remaining": 245,
    "date_time": "2025-11-20T18:00:00Z"
  },
  "bookings": [
    {
      "booking_id": "uuid",
      "booking_code": "EON-ABC123",
      "tickets_count": 2,
      "booking_status": "confirmed",
      "checked_in": false,
      "profile": {
        "full_name": "John Doe",
        "phone": "+919876543210"
      }
    }
  ],
  "stats": {
    "total": 255,
    "confirmed": 200,
    "checked_in": 50,
    "cancelled": 5
  }
}
```

---

## Coupon Endpoints

Coupon endpoints allow users to validate, apply, and remove discount coupons during booking.

### Validate Coupon

```http
POST /api/coupons/validate
```

Validate a coupon code for an event and calculate potential discount.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "couponCode": "FLAT250",
  "eventId": "uuid",
  "ticketsCount": 2,
  "originalAmount": 998.00
}
```

**Response:**
```json
{
  "valid": true,
  "coupon": {
    "id": 1,
    "code": "FLAT250",
    "discountType": "fixed",
    "discountValue": 250.00,
    "eventId": "uuid"
  },
  "discountAmount": 250.00,
  "finalAmount": 748.00,
  "message": "Coupon applied successfully"
}
```

**Error Responses:**
- `400` - Invalid coupon code
- `400` - Coupon expired or not active
- `400` - Coupon not valid for this event
- `400` - Usage limit exceeded

---

### Apply Coupon

```http
POST /api/coupons/apply
```

Apply a validated coupon to an existing booking.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "bookingId": "uuid",
  "couponCode": "FLAT250",
  "eventId": "uuid",
  "ticketsCount": 2,
  "originalAmount": 998.00
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "booking_id": "uuid",
    "coupon_code": "FLAT250",
    "discount_amount": 250.00,
    "final_amount": 748.00,
    "updated_at": "2025-11-19T10:30:00Z"
  },
  "message": "Coupon applied successfully"
}
```

---

### Remove Coupon

```http
POST /api/coupons/remove
```

Remove an applied coupon from a booking.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "booking_id": "uuid",
    "coupon_code": null,
    "discount_amount": 0.00,
    "final_amount": 998.00,
    "updated_at": "2025-11-19T10:35:00Z"
  },
  "message": "Coupon removed successfully"
}
```

---

## Payment Endpoints

Payment endpoints handle Razorpay integration for secure payment processing.

### Create Payment Order

```http
POST /api/payments/create-order
```

Create a Razorpay payment order for a booking.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 998.00,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_xyz123",
    "amount": 99800,
    "currency": "INR",
    "razorpayKey": "rzp_test_xxx",
    "bookingId": "uuid"
  },
  "message": "Payment order created successfully"
}
```

---

### Verify Payment

```http
POST /api/payments/verify
```

Verify a completed Razorpay payment.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "SUCCESSFUL",
    "verified_at": "2025-11-19T10:40:00Z"
  },
  "message": "Payment verified successfully"
}
```

---

### Handle Payment Failure

```http
POST /api/payments/fail
```

Handle a failed Razorpay payment.

**Authentication:** Required  
**Role:** Any authenticated user

**Request Body:**
```json
{
  "razorpayOrderId": "order_xyz123",
  "error": {
    "code": "PAYMENT_FAILED",
    "description": "Card declined"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "FAILED",
    "failure_reason": "Card declined"
  },
  "message": "Payment failure recorded"
}
```

---

### Razorpay Webhook

```http
POST /api/payments/webhook
```

Handle Razorpay webhook notifications.

**Authentication:** None (webhook signature verification)  

**Headers:**
```
X-Razorpay-Signature: signature_hash
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### Cleanup Pending Payments

```http
POST /api/payments/cleanup-pending
```

Clean up expired pending payments (admin only).

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "success": true,
  "cleanedCount": 5,
  "message": "Expired payments cleaned up"
}
```

---

## Admin Endpoints

All admin endpoints require `eon_team` role.

### Get All Events

```http
GET /api/admin/events
```

Get all events (admin view).

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "events": [
    {
      "event_id": "uuid",
      "title": "Pushpa 2 Premiere",
      "date_time": "2025-11-20T18:00:00Z",
      "status": "published",
      "venue_name": "PVR Cinemas",
      "city": "Mumbai"
    }
  ]
}
```

---

### Create Event

```http
POST /api/admin/events
```

Create a new event.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "title": "Pushpa 2 Premiere",
  "description": "Exclusive screening",
  "date_time": "2025-11-20T18:00:00Z",
  "venue_name": "PVR Cinemas",
  "venue_address": "123 Mall Road",
  "city": "Mumbai",
  "capacity": 500,
  "ticket_price": 499.00,
  "status": "draft",
  "image_url": "https://...",
  "entry_instructions": "Arrive 30 minutes early"
}
```

**Response (201):**
```json
{
  "success": true,
  "event": { ... },
  "message": "Event created successfully"
}
```

---

### Update Event

```http
PUT /api/admin/events/{eventId}
```

Update an existing event.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:** Same as Create Event

**Response:**
```json
{
  "success": true,
  "event": { ... },
  "message": "Event updated successfully"
}
```

---

### Delete Event

```http
DELETE /api/admin/events/{eventId}
```

Delete an event (cascades to bookings and assignments).

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### Export Event Bookings (CSV)

```http
GET /api/admin/events/{eventId}/export-bookings
```

Download CSV of all event bookings.

**Authentication:** Required  
**Role:** `eon_team`

**Response:** CSV file download

```csv
Booking Code,Full Name,Phone,Email,Tickets,Amount,Status,Checked In,Booked At
EON-ABC123,John Doe,+919876543210,john@example.com,2,998.00,confirmed,false,2025-11-15 10:30:00
```

---

### Export Check-ins (CSV)

```http
GET /api/admin/events/{eventId}/export-checkins
```

Download CSV of all checked-in attendees.

**Authentication:** Required  
**Role:** `eon_team`

**Response:** CSV file download

---

### Get All Users

```http
GET /api/admin/users
```

Get all user profiles.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "city": "Mumbai",
      "role": "user",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### Update User Role

```http
POST /api/admin/users/update-role
```

Update a user's role.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "movie_team"
}
```

**Validation:**
- `role` must be one of: `user`, `movie_team`, `eon_team`

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

### Delete User

```http
POST /api/admin/users/delete
```

Delete a user account.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Validation:**
- Cannot delete your own account

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Get Movie Team Assignments

```http
GET /api/admin/movie-team-assignments
```

Get all movie team assignments to events.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "assignments": [
    {
      "assignment_id": "uuid",
      "user_id": "uuid",
      "event_id": "uuid",
      "user_name": "John Doe",
      "event_title": "Pushpa 2 Premiere",
      "assigned_at": "2025-11-15T10:00:00Z"
    }
  ]
}
```

---

### Assign Movie Team

```http
POST /api/admin/movie-team-assignments
```

Assign a movie team member to an event.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "userId": "uuid",
  "eventId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "assignmentId": "uuid",
  "message": "Movie team member assigned successfully"
}
```

---

### Remove Assignment

```http
DELETE /api/admin/movie-team-assignments
```

Remove a movie team assignment.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "assignmentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment removed successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment removed successfully"
}
```

---

### Get All Coupons

```http
GET /api/admin/coupons
```

Get all coupons with usage statistics.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "coupons": [
    {
      "id": 1,
      "code": "FLAT250",
      "discount_type": "fixed",
      "discount_value": 250.00,
      "event_id": "uuid",
      "usage_limit": 100,
      "current_usage_count": 45,
      "is_active": true,
      "valid_from": "2025-11-01T00:00:00Z",
      "valid_until": "2025-11-30T23:59:59Z",
      "event": {
        "title": "Pushpa 2 Premiere"
      }
    }
  ]
}
```

---

### Create Coupon

```http
POST /api/admin/coupons
```

Create a new discount coupon.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "code": "FLAT250",
  "discountType": "fixed",
  "discountValue": 250.00,
  "eventId": "uuid",
  "usageLimit": 100,
  "perUserLimit": 1,
  "minTickets": 1,
  "validFrom": "2025-11-01T00:00:00Z",
  "validUntil": "2025-11-30T23:59:59Z",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "coupon": { ... },
  "message": "Coupon created successfully"
}
```

---

### Update Coupon

```http
PATCH /api/admin/coupons/{couponId}
```

Update an existing coupon.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:** Same as Create Coupon

**Response:**
```json
{
  "success": true,
  "coupon": { ... },
  "message": "Coupon updated successfully"
}
```

---

### Delete Coupon

```http
DELETE /api/admin/coupons/{couponId}
```

Delete or deactivate a coupon.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "success": true,
  "message": "Coupon deactivated successfully"
}
```

---

### Get Settlements

```http
GET /api/admin/settlements
```

Get all event settlements.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "settlements": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "gross_revenue": 50000.00,
      "razorpay_fees": 750.00,
      "eonverse_commission": 2500.00,
      "net_payout": 46750.00,
      "transaction_reference": "UTR123456",
      "transfer_date": "2025-11-20",
      "settled_by": "uuid",
      "settled_at": "2025-11-19T15:00:00Z",
      "event": {
        "title": "Pushpa 2 Premiere"
      }
    }
  ]
}
```

---

### Create Settlement

```http
POST /api/admin/settlements
```

Record a settlement payment to movie team.

**Authentication:** Required  
**Role:** `eon_team`

**Request Body:**
```json
{
  "eventId": "uuid",
  "transactionReference": "UTR123456",
  "transferDate": "2025-11-20",
  "paymentMethod": "bank_transfer",
  "notes": "Monthly settlement"
}
```

**Response:**
```json
{
  "success": true,
  "settlement": { ... },
  "message": "Settlement recorded successfully"
}
```

---

### Financial Summary

```http
GET /api/admin/financial-summary
```

Get comprehensive financial dashboard data.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "summary": {
    "totalRevenue": 150000.00,
    "totalFees": 2250.00,
    "totalCommission": 7500.00,
    "totalPayouts": 140250.00,
    "pendingSettlements": 25000.00,
    "monthlyBreakdown": [...]
  }
}
```

---

### Payment Reconciliation

```http
GET /api/admin/reconciliation
```

Get payment reconciliation data.

**Authentication:** Required  
**Role:** `eon_team`

**Response:**
```json
{
  "reconciliation": {
    "successfulPayments": 450,
    "failedPayments": 12,
    "pendingPayments": 8,
    "totalAmount": 150000.00,
    "discrepancies": []
  }
}
```

---

## Movie Team Endpoints

All movie team endpoints require `movie_team` role.

### Check-in Attendee

```http
POST /api/movie-team/checkin
```

Check in an attendee using QR code, booking ID, or phone number.

**Authentication:** Required  
**Role:** `movie_team`

**Request Body (QR Method):**
```json
{
  "eventId": "uuid",
  "method": "qr",
  "qrCode": "booking_uuid"
}
```

**Request Body (Manual - Booking Code):**
```json
{
  "eventId": "uuid",
  "method": "manual",
  "bookingId": "EON-ABC123"
}
```

**Request Body (Manual - Phone):**
```json
{
  "eventId": "uuid",
  "method": "manual",
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "booking_id": "uuid",
    "booking_code": "EON-ABC123",
    "profile": {
      "full_name": "John Doe"
    },
    "tickets_count": 2,
    "checked_in": true,
    "checked_in_at": "2025-11-20T17:45:00Z"
  },
  "message": "Check-in successful for John Doe"
}
```

**Error Responses:**
- `400` - Check-in not yet open (opens 30 minutes before event)
- `400` - Already checked in (duplicate)
- `404` - Booking not found
- `403` - Not assigned to this event

---

### Get My Assigned Events

```http
GET /api/movie-team/my-events
```

Get events assigned to the authenticated movie team member.

**Authentication:** Required  
**Role:** `movie_team`

**Response:**
```json
{
  "events": [
    {
      "event_id": "uuid",
      "title": "Pushpa 2 Premiere",
      "date_time": "2025-11-20T18:00:00Z",
      "venue_name": "PVR Cinemas",
      "status": "checkin_open",
      "assignment_id": "uuid",
      "assigned_at": "2025-11-15T10:00:00Z"
    }
  ]
}
```

---

### Get Event Stats

```http
GET /api/movie-team/events/{eventId}/stats
```

Get real-time statistics for an assigned event.

**Authentication:** Required  
**Role:** `movie_team` (must be assigned to event)

**Response:**
```json
{
  "stats": {
    "total_bookings": 255,
    "total_tickets": 400,
    "checked_in": 50,
    "checked_in_tickets": 78,
    "pending": 205,
    "capacity": 500,
    "remaining": 100,
    "check_in_rate": "19.6%"
  }
}
```

---

### Get Event Notes

```http
GET /api/movie-team/events/{eventId}/notes
```

Get notes for an event.

**Authentication:** Required  
**Role:** `movie_team` or `eon_team`

**Response:**
```json
{
  "notes": "VIP section reserved for first 50 guests. Check IDs for 18+ rating."
}
```

---

### Add Event Notes

```http
POST /api/movie-team/events/{eventId}/notes
```

Add or update notes for an event.

**Authentication:** Required  
**Role:** `movie_team` or `eon_team`

**Request Body:**
```json
{
  "notes": "VIP section reserved for first 50 guests."
}
```

**Response:**
```json
{
  "success": true,
  "notes": "VIP section reserved for first 50 guests."
}
```

---

### Update Event Status

```http
POST /api/movie-team/events/{eventId}/status
```

Update event status (for assigned movie team members).

**Authentication:** Required  
**Role:** `movie_team` (must be assigned) or `eon_team`

**Request Body:**
```json
{
  "status": "checkin_open"
}
```

**Valid Status Values:**
- `draft` - Not yet published
- `published` - Visible to users
- `checkin_open` - Check-in allowed
- `in_progress` - Event started
- `completed` - Event finished
- `cancelled` - Event cancelled

**Response:**
```json
{
  "success": true,
  "message": "Event status updated to checkin_open"
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Messages

| Error | Meaning |
|-------|---------|
| `Unauthorized` | Not authenticated |
| `Forbidden` | Authenticated but lacks permission |
| `Invalid role` | Role value not allowed |
| `Not enough slots` | Event capacity exceeded |
| `You have already booked this event` | Duplicate booking attempt |
| `Check-in is not currently open` | Check-in time window not active |
| `Already checked in` | Duplicate check-in attempt |

---

## Rate Limiting

Currently, no rate limiting is enforced. Consider implementing rate limiting for production:

- **Public endpoints:** 100 requests/minute/IP
- **Authenticated endpoints:** 200 requests/minute/user
- **Admin endpoints:** 500 requests/minute/admin

---

## Webhooks

Currently not implemented. Future webhooks may include:

- `booking.created` - New booking created
- `booking.checked_in` - Attendee checked in
- `event.published` - Event published
- `event.completed` - Event finished

---

## API Client Examples

### JavaScript/TypeScript

```typescript
// Create a booking
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event_id: 'event-uuid',
    tickets_count: 2
  })
});

const data = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'https://your-domain.com/api/bookings',
    json={
        'event_id': 'event-uuid',
        'tickets_count': 2
    }
)

data = response.json()
```

### cURL

```bash
curl -X POST https://your-domain.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"event_id":"event-uuid","tickets_count":2}'
```

---

## Database Functions

The API uses Supabase PostgreSQL functions for critical operations:

### `create_booking(p_event_id, p_user_id, p_tickets_count)`
Creates a booking with atomic remaining count decrement.

### `assign_movie_team_to_event(target_user_id, target_event_id)`
Assigns a movie team member to an event.

### `remove_movie_team_assignment(p_assignment_id)`
Removes a movie team assignment.

### `get_assigned_events_for_user(p_user_id)`
Gets events assigned to a movie team member.

### `update_user_role(p_user_id, p_new_role)`
Updates a user's role.

---

## Real-time Subscriptions

ConveneHub supports real-time updates via Supabase subscriptions:

```typescript
// Subscribe to booking updates
const channel = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings',
    filter: `event_id=eq.${eventId}`
  }, (payload) => {
    console.log('New booking:', payload.new);
  })
  .subscribe();
```

---

## Testing

See testing documentation:
- [E2E Tests](./frontend/tests/e2e/README.md)
- [Security Tests](./frontend/tests/security/README.md)
- [Integration Tests](./frontend/tests/integration/README.md)

---

## Support

For API issues or questions:
- **Email:** support@convenehub.com
- **GitHub:** [github.com/lviffy/ConveneHub](https://github.com/lviffy/ConveneHub)
- **Documentation:** [Complete Implementation Guide](./documentation/COMPLETE_IMPLEMENTATION_GUIDE.md)

---

**Last Updated:** November 19, 2025  
**Version:** 1.1.0  
**Status:** ✅ Production Ready

**New Features Added:**
- ✅ Complete coupon system (validation, application, management)
- ✅ Razorpay payment integration with webhooks
- ✅ Settlement management for event payouts
- ✅ Financial dashboard and reconciliation tools
- ✅ Enhanced booking system with discounts
