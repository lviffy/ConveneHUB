# ConveneHub (React + Express + MongoDB)

This is the new separate implementation workspace for ConveneHub.

## Structure

- frontend: React + Vite + TypeScript
- backend: Express + TypeScript + MongoDB
- shared: shared types/contracts

## Quick Start

1. Install dependencies from project root:
   npm install
2. Copy env file and update values:
   cp backend/.env.example backend/.env
3. Run backend:
   npm run dev:backend
4. Run frontend in another terminal:
   npm run dev:frontend

## Current Status

- Frontend route skeleton added for public, attendee, organizer, promoter, and admin paths.
- Backend API module skeleton added for auth, events, bookings, tickets, check-ins, promoters, analytics, and admin.
- MongoDB models added for users, events, bookings, and tickets.
