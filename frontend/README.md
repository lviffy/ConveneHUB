# ConveneHub Frontend

React + Vite client application for ConveneHub.

## Overview

The frontend delivers role-specific experiences for attendees, organizers, promoters, and administrators.

- Framework: React
- Build tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- Forms/validation: React Hook Form + Zod

## Project Layout

```text
frontend/
├── app/
├── components/
├── hooks/
├── lib/
├── public/
├── src/
├── index.html
├── jsconfig.json
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Run

```bash
npm run dev
```

Default URL:

- `http://localhost:5173`

## Build and Preview

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build production assets
- `npm run start` - Preview production build
- `npm run lint` - Run ESLint
- `npm run analyze` - Build with bundle analysis flag

## Environment Variables

Set values in `frontend/.env.local`.

Common keys:

- `VITE_API_BASE_URL` (for example `http://localhost:3000/api/v1`)
- `VITE_API_PROXY_TARGET` (optional local proxy target)
- `VITE_RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` (if enabled)

## API Integration

The frontend targets backend routes under `/api/v1`.

When using local proxy in `vite.config.js`, API calls to `/api/...` are rewritten to `/api/v1/...`.

## Quality Expectations

Before merging frontend changes:

- Run `npm run lint`
- Run `npm run build`
- Verify key role-based flows manually (auth, events, bookings, check-ins)

## License

MIT
