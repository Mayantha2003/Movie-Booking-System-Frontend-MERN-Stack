# Online Movie Ticket Booking System — Frontend

The frontend is the React single-page application for browsing films, choosing a cinema showtime and seats, completing a booking, and managing the system through role-based dashboards. It communicates with the Movie Booking Backend over its JSON API.

## Technologies

- React 19 and TypeScript
- Vite
- Redux Toolkit and React Redux for application/session state
- React Router for client-side routes and protected pages
- Tailwind CSS 4
- Axios for API requests and token refresh handling
- `qrcode.react` for QR code rendering

## Features

### Customer and guest experience

- Browse now-showing and coming-soon movies, search titles, and open movie details.
- Browse cinema showtimes and select seats from the screen layout.
- Continue as a guest or use a signed-in account; guest bookings collect contact details.
- Review a booking summary, then view booking confirmation and payment return/cancellation results.
- View a signed-in user's profile and bookings.
- Handle loading, empty, and error states throughout the booking flow.

### Admin experience

- Role-protected admin sign-in and dashboard.
- Manage movies, cinemas, screens, showtimes, bookings, food items, offers, and users.
- Access is gated by the authenticated role in the frontend and should also be enforced by the backend.

### Super Admin experience

- Role-protected dashboard for the Super Admin.
- View and manage administrator accounts and their status.

## Project structure

```text
src/
├── assets/           # Images and static assets
├── components/       # Shared UI, booking, authentication, admin, and dashboard components
├── data/             # Local data definitions
├── hooks/            # Reusable React hooks
├── pages/            # Customer, booking, admin, and super-admin pages
├── router/           # Application routes and route guards
├── service/          # API client and domain-specific API calls
├── store/            # Redux store, authentication state, and session synchronization
├── types/            # Shared TypeScript types
└── utils/            # Role, booking, media, and validation helpers
```

## Prerequisites

- Node.js and npm
- The Movie Booking Backend running locally or at an accessible API URL

## Installation and local development

From the frontend repository root:

```bash
npm install
```

Create a `.env` file in this repository root and set the backend API base URL:

```dotenv
VITE_API_URL=http://localhost:5001/api
```

The frontend falls back to `http://localhost:5001/api` when `VITE_API_URL` is not set. The repository also contains an `.example.env` file; use it as a reference and provide the API URL in your local `.env`.

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser. To create and preview a production build:

```bash
npm run build
npm run preview
```

Run the configured lint checks with:

```bash
npm run lint
```

## Backend API connection

The Axios client in `src/service/api.ts` uses `VITE_API_URL` as its base URL. Set it to the backend API root, including `/api` (for example, `http://localhost:5001/api` for the backend's default local port).

The API client attaches an access token when available, attempts to refresh an expired access token, and ends the session when refresh is unavailable or rejected. The backend must be reachable from the browser and allow the frontend's origin through its CORS configuration. For a different backend host or port, update `VITE_API_URL` and restart the Vite server.

## Screenshots

Add current application screenshots to `docs/screenshots/` and replace these placeholders before submission:

| Screen | Screenshot |
|---|---|
| Home and movie listings | `![Home page](docs/screenshots/home.png)` |
| Movie details and showtimes | `![Movie details](docs/screenshots/movie-details.png)` |
| Seat selection and booking | `![Seat selection](docs/screenshots/seat-selection.png)` |
| Admin dashboard | `![Admin dashboard](docs/screenshots/admin-dashboard.png)` |
| Super Admin dashboard | `![Super Admin dashboard](docs/screenshots/super-admin-dashboard.png)` |

## Project information

- This repository contains the frontend application only; the API is maintained in the separate `Movie-Booking-Backend` repository.
- API behavior, roles, booking availability, and payment status are ultimately controlled by the backend.
- Do not put backend secrets, database credentials, JWT secrets, or payment credentials in frontend environment variables. Vite-exposed variables are available to browser code.
