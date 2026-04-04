# ConveneHub

## 1. Introduction

ConveneHub is a web-based event management platform designed to help organizers manage the complete lifecycle of events, from ticketing to attendee check-in and analytics.

Event organizers often rely on multiple tools for ticketing, promotions, attendee tracking, and analytics, which leads to inefficiencies, data inconsistencies, and increased operational complexity.

ConveneHub provides a unified solution that integrates ticketing, RSVP management, promoter tracking, and analytics into a single platform. It also supports multi-campus or multi-tenant environments, making it ideal for colleges, organizations, and event agencies.

The project demonstrates concepts such as event management systems, multi-tenant architectures, analytics dashboards, and full-stack development.

## 2. Description

ConveneHub enables organizers to create, manage, and analyze events efficiently.

The application allows organizers to:

- Create events with ticketing and seat tiers
- Manage RSVPs and attendee registrations
- Track attendance using QR-based check-ins
- Manage promoters and commission structures
- Analyze event performance through dashboards

Promoters can:

- Promote events using referral links
- Track ticket sales and commissions

Attendees can:

- Register for events
- Purchase tickets
- Receive QR codes for entry

The platform ensures smooth event execution, better audience engagement, and data-driven decision-making.

## 3. Problem Statement

Event organizers face challenges in managing events due to reliance on multiple disconnected tools.

This results in:

- Inefficient ticketing and attendee management
- Difficulty tracking promoter performance
- Poor visibility into revenue and attendance
- Manual check-in processes causing delays

The challenge is to build a platform that:

- Provides integrated ticketing and RSVP management
- Enables QR-based attendee check-in
- Supports promoter tracking and commission flows
- Offers analytics for revenue and attendance
- Supports multi-campus or multi-tenant setups

The solution should provide a centralized, scalable, and efficient event management system.

## 4. Scenario

Consider a university hosting a tech fest across multiple campuses.

- The organizer creates the event on ConveneHub.
- Different ticket tiers are created (General, VIP, Early Bird).
- Promoters are assigned unique referral links to sell tickets.
- Students register and receive QR-based tickets.

On the event day:

- Attendees check in by scanning QR codes.
- The system updates attendance in real time.

After the event:

- Organizers view analytics such as:
	- Total revenue
	- Attendance rates
	- Promoter performance

This helps organizers improve future events and manage operations efficiently.

## 5. Architecture

The platform follows a three-tier architecture with multi-tenant support.

### Frontend Layer

- Event creation and management UI
- Ticket booking interface
- Promoter dashboards
- Analytics dashboards
- Developed using React.js

### Backend Layer

- Handles event management, ticketing, and RSVPs
- QR code generation and check-in system
- Promoter tracking and commission logic
- Multi-tenant (multi-campus) handling
- Developed using Node.js + Express.js

### Database Layer

- Stores events, users, tickets, promoters, and analytics data
- Implemented using MongoDB

### Communication Flow

Frontend (React)  
-> API Requests  
Backend (Node.js + Express)  
-> Database Queries  
MongoDB Database

## 6. Project Flow (System Flow)

### Step 1: Organizer Registration

Organizers create accounts and set up their profiles.

### Step 2: Event Creation

Organizers create events with details and ticket tiers.

### Step 3: Ticket Sales and RSVP

Users register and purchase tickets.

### Step 4: Promoter Allocation

Promoters are assigned referral links and track sales.

### Step 5: QR Ticket Generation

Each attendee receives a unique QR code.

### Step 6: Event Check-in

Attendees are verified via QR scanning.

### Step 7: Analytics and Reporting

System generates:

- Revenue reports
- Attendance analytics
- Promoter commission reports

## 7. User Flow

### Organizer Flow

Organizer -> Create Event -> Set Ticket Tiers -> Monitor Dashboard

### Attendee Flow

User -> Register -> Buy Ticket -> Receive QR Code -> Check-in

### Promoter Flow

Promoter -> Share Referral Link -> Track Sales -> Earn Commission

### Admin Flow

Admin -> Monitor Platform -> Manage Tenants

## 8. ER Diagram

### Entities

- User: Core entity for all users (attendees, organizers, promoters, admins)
- Event: Events created by organizers with details like date, location, and capacity
- Ticket: Tickets purchased by users for events with check-in tracking
- ReferralLink: Unique referral links created by promoters
- Sales: Tracks ticket sales generated through referral links with commissions
- Admin: Administrators who monitor the entire platform

### Key Relationships

- User -> Event (1:M): Organizers can create multiple events
- User -> Ticket (1:M): Users can buy multiple tickets
- Event -> Ticket (1:M): Events have multiple tickets
- User -> ReferralLink (1:M): Promoters can create multiple referral links
- ReferralLink -> Sales (1:M): Each referral link can generate multiple sales
- User -> Admin (1:1): Admins are special users with elevated permissions

## 9. Pre-Requisites

### Frontend (React)

- React Components
- React Hooks
- React Router
- Axios
- TailwindCSS / CSS

### Backend (Node.js and Express)

- Node.js fundamentals
- Express routing
- REST APIs
- Middleware
- JWT Authentication

### Database (MongoDB)

- CRUD operations
- Schema design
- Mongoose ODM

## 10. Required Technologies

### Frontend

- React.js
- TailwindCSS / Material UI
- Axios

### Backend

- Node.js
- Express.js
- JWT Authentication

### Database

- MongoDB
- Mongoose

### Integrations

- Razorpay / Stripe (payments)
- QR code generator libraries
- Email/SMS APIs

### Tools

- Git
- GitHub
- Postman

## 11. Suggested Database Collections

### Users

- _id
- name
- email
- password
- role (organizer/promoter/attendee/admin)

### Events

- _id
- title
- description
- date
- venue
- organizerId

### Tickets

- _id
- eventId
- type (VIP/General)
- price
- quantity

### Orders

- _id
- userId
- eventId
- ticketId
- paymentStatus

### Attendees

- _id
- eventId
- userId
- qrCode
- checkInStatus

### Promoters

- _id
- userId
- eventId
- referralCode
- commission

### Analytics

- _id
- eventId
- revenue
- attendance
- promoterPerformance

## 12. Key Features

### Event Management

- Create and manage events
- Multi-campus support

### Ticketing System

- Ticket tiers
- Online booking

### Check-in System

- QR-based verification

### Promoter System

- Referral tracking
- Commission calculation

### Analytics Dashboard

- Revenue tracking
- Attendance insights
- Event performance

## 13. Optional Advanced Features

- Dynamic pricing for tickets
- AI-based demand prediction
- Fraud detection in ticketing
- Mobile app for check-in staff
- Real-time event heatmaps
- Social media integration for promotion
- Automated marketing campaigns

## 14. Learning Outcomes

By completing this project, developers will learn:

- Full-stack MERN application development
- Event management system design
- Multi-tenant architecture
- Payment gateway integration
- QR-based systems
- Analytics and reporting systems
- Scalable backend design