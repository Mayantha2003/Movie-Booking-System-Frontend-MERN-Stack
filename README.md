# Online Movie Ticket Booking System — Frontend

A responsive single-page web application for an online cinema ticket booking platform. Customers can browse movies, view showtimes, select seats, make a demo booking, and access their tickets. Administrators manage cinema operations through protected dashboards, while Super Admins manage administrator accounts.

**Frontend repository:** [Movie-Booking-System-Frontend-MERN-Stack](https://github.com/Mayantha2003/Movie-Booking-System-Frontend-MERN-Stack)  
**Backend repository:** [Movie-Booking-System-Backend-MERN-Stack](https://github.com/Mayantha2003/Movie-Booking-System-Backend-MERN-Stack)  
**Backend API:** `https://movie-booking-system-backend-mern-s.vercel.app/api`

> Add the verified public frontend deployment URL here after confirming it in the hosting dashboard. A frontend deployment URL was not present in the supplied source archive, so it is intentionally not guessed.

---

## 1. Project overview

The frontend is built with React and TypeScript. It communicates with the separate Express and TypeScript backend through REST API requests using Axios.

The application provides three main experiences:

1. **Customer / Guest:** Browse movies, choose showtimes and seats, review booking details, complete the demo payment flow, and view booking confirmation.
2. **Admin:** Manage movies, cinemas, screens, showtimes, bookings, foods, offers, and users.
3. **Super Admin:** View the Super Admin dashboard and manage administrator accounts.

The UI uses reusable React components, route guards, Redux Toolkit for authentication state, and Tailwind CSS for styling.

## 2. Technology stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Type safety and maintainable frontend code |
| Vite | Development server and production build tool |
| React Router | Client-side routing and nested routes |
| Redux Toolkit | Global authentication state |
| React Redux | Connect React components to Redux |
| Tailwind CSS 4 | Responsive UI styling |
| Axios | Backend HTTP requests |
| jsPDF | Client-side PDF utility used by the application |
| qrcode.react | QR code display |
| Recharts | Dashboard charts |
| ESLint | Code-quality checks |

## 3. Main frontend features

### Customer and guest experience
- Browse now-showing and coming-soon movies.
- Search and explore movie information.
- View movie details and trailers.
- Browse cinemas and available showtimes.
- Select seats using the seat-selection interface.
- Continue as a guest or sign in to an account.
- Enter guest contact information when booking as a guest.
- Review the booking summary, selected seats, food items, offers, and total.
- Continue to the demo payment page.
- View booking confirmation and payment result pages.
- View profile and personal booking information when signed in.

### AI movie recommendations
- The home page includes an AI Picks/recommendation area.
- The frontend requests recommendations from `GET /api/recommendations/trending`.
- The backend can use Groq AI to rank movies and provide short recommendation reasons.
- The backend can use its fallback ranking when AI is unavailable.

### Admin experience
- Separate Admin login page.
- Protected Admin dashboard and nested management pages.
- Manage movies, bookings, cinemas, screens, showtimes, foods, offers, and users.
- View dashboard statistics and analytics.
- Reusable dashboard components for tables, forms, badges, modals, and status messages.

### Super Admin experience
- Protected Super Admin dashboard.
- View administrator accounts.
- Create/manage Admin accounts and update administrator status.
- Separate Super Admin layout and navigation.

### Authentication and session handling
- Redux Toolkit stores the current authentication state.
- Protected routes check the signed-in user's role before displaying restricted pages.
- Guest routes are used for pages such as login and registration.
- Axios sends API requests to the configured backend.
- The API service attaches the available access token and handles token refresh/session failure logic.
- Token storage and session synchronization are separated into service/store modules.

### Booking and payment interface
- Booking and payment pages communicate with backend services.
- A pending payment session is stored in browser session storage while the demo payment flow is in progress.
- The frontend calls the backend's demo payment endpoint.
- This is a demonstration payment process; it does not process real card transactions or transfer money.

## 4. Application architecture

```text
React Pages and Components
          |
          v
 React Router / Route Guards
          |
          v
 Redux Toolkit (Auth State)
          |
          v
 Service Layer (Axios)
          |
          | HTTP / JSON
          v
 Express + TypeScript Backend
          |
          v
       MongoDB
```

The frontend is separated into reusable UI components, page-level components, routing, services, Redux state, hooks, types, and utility functions.

## 5. Project structure

```text
Movie-Booking-Frontend/
├── public/              # Static public assets
├── src/
│   ├── assets/          # Images and other imported assets
│   ├── components/
│   │   ├── admin/       # Admin layout and navigation
│   │   ├── auth/        # Authentication UI components
│   │   ├── booking/     # Seat map, booking summary, ticket UI, etc.
│   │   ├── common/      # Shared navbar, footer, buttons and state views
│   │   ├── dashboard/   # Reusable dashboard tables, forms and modals
│   │   ├── home/        # Home page sections and movie recommendations
│   │   ├── movie/       # Movie cards, posters, trailer and hero components
│   │   └── superadmin/  # Super Admin layout and components
│   ├── data/            # Local movie-related data definitions
│   ├── hooks/           # Reusable React hooks
│   ├── pages/           # Customer, booking, payment and dashboard pages
│   │   └── admin/       # Admin management pages
│   ├── router/          # Application routes and route guards
│   ├── service/         # Axios client and API service modules
│   ├── store/           # Redux store, auth slice and session sync
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Validation, roles, booking and media helpers
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.js
```

## 6. Routing overview

The main routes are defined in `src/router/AppRouter.tsx`.

| Route | Purpose | Access |
|---|---|---|
| `/` | Home and movie listings | Guest / Customer |
| `/movies/:movieId` | Movie details | Guest / Customer |
| `/booking/:showtimeId/seats` | Seat selection | Guest / Customer |
| `/booking/:showtimeId/summary` | Booking summary | Guest / Customer |
| `/booking/confirmation/:code` | Booking confirmation | Guest / Customer |
| `/payment/demo` | Demo payment page | Booking flow |
| `/payment/return` | Payment result | Booking flow |
| `/payment/cancelled` | Payment result/cancelled state | Booking flow |
| `/login` | Customer login | Guest |
| `/register` | Customer registration | Guest |
| `/profile` | Customer profile | Authenticated Customer |
| `/admin/login` | Admin login | Guest |
| `/admin/dashboard` | Admin dashboard | Admin |
| `/admin/movies` | Movie management | Admin |
| `/admin/bookings` | Booking management | Admin |
| `/admin/cinemas` | Cinema management | Admin |
| `/admin/screens` | Screen management | Admin |
| `/admin/showtimes` | Showtime management | Admin |
| `/admin/foods` | Food management | Admin |
| `/admin/offers` | Offer management | Admin |
| `/admin/users` | User management | Admin |
| `/super-admin/dashboard` | Super Admin dashboard | Super Admin |
| `/super-admin/admins` | Administrator management | Super Admin |

The application also defines forbidden and not-found handling through its route guards and fallback page.

## 7. Redux state management

Redux Toolkit is used for global authentication/session state.

The store is configured in `src/store/makeStore.ts`. The authentication reducer is registered under the `auth` key.

The authentication slice stores:
- The current user (or `null` when signed out).
- An initialization flag used while restoring a previous session.

Important Redux actions/thunks include:
- `signedIn`
- `signedOut`
- `restoreFinished`
- `restoreSession`
- `loginUser`
- `logoutUser`

Typed Redux state and dispatch hooks are provided through `src/store/hooks.ts`.

## 8. Backend API integration

The Axios client is configured in:

```text
src/service/api.ts
```

The API base URL is read from `VITE_API_URL`. If that variable is not set, the source currently falls back to:

```text
https://movie-booking-system-backend-mern-s.vercel.app/api
```

For local development, set:

```dotenv
VITE_API_URL=http://localhost:5001/api
```

The frontend service modules separate API operations by feature:

| Service file | Responsibility |
|---|---|
| `auth.ts` | Login, registration, logout and current-user requests |
| `movie.ts` | Movie listing and details |
| `showtime.ts` | Showtime and seat availability requests |
| `booking.ts` | Booking creation, lookup, cancellation and customer bookings |
| `payment.ts` | Demo payment request and pending payment session |
| `food.ts` | Food item requests |
| `offer.ts` | Offer requests |
| `admin.ts` | Admin dashboard and management requests |
| `superAdmin.ts` | Super Admin operations |
| `screen.ts` | Screen-related requests |
| `recommendation.ts` | Trending/AI recommendation request |
| `api.ts` | Shared Axios configuration and interceptors |

## 9. Environment variables

Create a `.env` file in the frontend root directory.

```dotenv
VITE_API_URL=http://localhost:5001/api
```

For production, set `VITE_API_URL` in the frontend hosting provider to the deployed backend API base URL:

```dotenv
VITE_API_URL=https://movie-booking-system-backend-mern-s.vercel.app/api
```

**Important:** Vite variables prefixed with `VITE_` are included in browser-side code. Never place MongoDB credentials, JWT secrets, Groq API keys, Supabase service-role keys, or email passwords in the frontend `.env` file.

After changing environment variables, restart the Vite development server.

## 10. Installation and local setup

### Requirements
- Node.js and npm
- The Movie Booking backend running locally or deployed
- A modern web browser

### Step 1 — Clone the repository

```bash
git clone https://github.com/Mayantha2003/Movie-Booking-System-Frontend-MERN-Stack.git
cd Movie-Booking-System-Frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure the backend URL

Create `.env` and set:

```dotenv
VITE_API_URL=http://localhost:5001/api
```

Make sure the backend is running and accessible at the configured address.

### Step 4 — Start the development server

```bash
npm run dev
```

Vite prints the local development URL in the terminal. Open that URL in your browser.

## 11. Available npm scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

Before deployment, run:

```bash
npm run lint
npm run build
```

## 12. Build and deployment

The frontend is a Vite application and can be deployed to Vercel or Netlify.

Typical Vercel configuration:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Environment variable | `VITE_API_URL` |

Deployment steps:

1. Push the frontend code to GitHub.
2. Import the frontend repository into Vercel or Netlify.
3. Set the build command and output directory.
4. Add `VITE_API_URL` with the deployed backend API URL.
5. Deploy the application.
6. Test customer, booking, payment-demo, Admin, and Super Admin routes on the deployed site.
7. Add the verified frontend deployment URL to this README.

**Backend API:**  
`https://movie-booking-system-backend-mern-s.vercel.app/api`

**Frontend deployment URL:**  
`Add the verified deployed frontend URL here.`

## 13. UI and responsive design

The application uses Tailwind CSS and reusable components to keep the interface consistent. The page and component structure separates customer booking screens from administrative dashboards. Responsive layouts are applied to the movie browsing, booking, authentication, and dashboard experiences.

## 14. Security notes

- Authentication and authorization are enforced by the backend API.
- Frontend protected routes improve navigation and user experience, but do not replace backend authorization.
- Do not store backend secrets in frontend environment variables.
- Do not assume that hiding an Admin link in the UI protects an API endpoint.
- The backend must validate user roles and sensitive booking/payment data for every protected operation.

## 15. Current implementation scope

This README reflects the frontend source code supplied with the project. The payment screen is connected to the backend demo payment workflow; it is not a live payment gateway. The frontend deployment URL should be added only after checking the actual hosting dashboard.

---

**Developed as the frontend component of the Online Movie Ticket Booking System — Rapid Application Development (RAD) coursework.**
