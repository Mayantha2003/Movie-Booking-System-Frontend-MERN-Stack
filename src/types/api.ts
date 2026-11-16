// Shapes of the data your backend sends. Dates arrive as ISO strings.

export interface ApiResponse<T> {
  message?: string;
  count?: number;
  data: T;
}

export type MovieStatus = "now_showing" | "coming_soon";

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number;
  release_date: string;
  status: MovieStatus;
  poster: string;
  banner?: string;
  trailer_url?: string;
  cast: string[];
  director: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cinema {
  _id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  contactNumber?: string;
  email?: string;
  facilities: string[];
  isActive: boolean;
}

export type ScreenType = "Standard" | "Premium" | "IMAX" | "4DX" | "Dolby Atmos";

export interface SeatLayoutRow {
  row: string;
  seats: number;
}

export interface Screen {
  _id: string;
  cinema: string | Pick<Cinema, "_id" | "name">;
  name: string;
  screenType: ScreenType;
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
  seatLayout?: SeatLayoutRow[];
  isActive: boolean;
}

export type MovieRef = Pick<Movie, "_id" | "title"> &
  Partial<Pick<Movie, "poster" | "duration" | "genre" | "language">>;

export type CinemaRef = Pick<Cinema, "_id" | "name"> &
  Partial<Pick<Cinema, "location" | "city" | "address">>;

export type ScreenRef = Pick<Screen, "_id" | "name"> &
  Partial<Pick<Screen, "screenType" | "totalSeats">>;

export interface Showtime {
  _id: string;
  movie: string | MovieRef;
  cinema: string | CinemaRef;
  screen: string | ScreenRef;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  availableSeats: number;
  totalSeats: number;
  isActive: boolean;
}

export interface PopulatedShowtime
  extends Omit<Showtime, "movie" | "cinema" | "screen"> {
  movie: string | MovieRef;
  cinema: CinemaRef;
  screen: ScreenRef;
}

export interface BookedSeat {
  row: string;
  seatNumber: number;
  seatId: string;
}

export interface BookedSeatsData {
  showtimeId: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: BookedSeat[];
  bookedSeatIds: string[];
}

export type FoodCategory = "Popcorn" | "Drinks" | "Snacks" | "Combos" | "Other";

export interface Food {
  _id: string;
  name: string;
  description?: string;
  category: FoodCategory;
  price: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
}

export type DiscountType = "percentage" | "fixed";

export interface Offer {
  _id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export type OfferRef = Pick<Offer, "_id" | "code"> &
  Partial<Pick<Offer, "description" | "discountType" | "discountValue">>;

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Cancelled"
  | "Refunded";
export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";
export type GatewayPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BookingFoodItem {
  food: string;
  quantity: number;
  price: number;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  user?: string | { _id: string; first_name: string; last_name: string; email?: string } | null;
  guestInfo?: GuestInfo;
  showtime: Pick<Showtime, "_id" | "showDate" | "startTime"> &
    Partial<Pick<Showtime, "endTime" | "ticketPrice">>;
  movie: MovieRef;
  cinema: CinemaRef;
  screen?: ScreenRef;
  seats: BookedSeat[];
  totalSeats: number;
  ticketPrice: number;
  totalAmount: number;
  foodItems?: BookingFoodItem[];
  foodTotal?: number;
  offer?: OfferRef | null;
  discountAmount?: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  holdExpiresAt?: string | null;
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingConfirmation {
  bookingCode: string;
  guestInfo?: Pick<GuestInfo, "name">;
  showtime: Pick<Showtime, "_id" | "showDate" | "startTime"> &
    Partial<Pick<Showtime, "ticketPrice">>;
  movie: MovieRef;
  cinema: CinemaRef;
  screen?: ScreenRef;
  seats: Array<Pick<BookedSeat, "seatId">>;
  totalSeats: number;
  ticketPrice: number;
  foodTotal?: number;
  discountAmount?: number;
  offer?: Pick<Offer, "code"> | null;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

export interface CreateBookingPayload {
  showtimeId: string;
  seats: BookedSeat[];
  foodItems?: { foodId: string; quantity: number }[];
  offerCode?: string;
  guestInfo?: GuestInfo;
}

export interface CreateBookingResponse extends ApiResponse<Booking> {
  paymentToken: string;
}

export interface PayHereCheckout {
  orderId: string;
  attempt: number;
  attemptsLeft: number;
  holdExpiresAt: string;
  checkout: {
    action: string;
    fields: Record<string, string>;
  };
}

export interface PaymentStatusResponse {
  orderId: string;
  status: GatewayPaymentStatus;
  bookingStatus: BookingStatus | null;
  holdExpiresAt: string | null;
  attemptsLeft: number;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface AdminUser {
  _id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone?: string;
  user_role?: string;
  user_status: UserStatus;
  createdAt: string;
}

export interface AdminStats {
  movies: number;
  bookings: number;
  users: number;
  revenue: number;
  recentBookings: Booking[];
}

export interface AdminAnalyticsSummary {
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  failedPayments: number;
  ticketsSold: number;
  revenue: number;
}

export interface RevenueTrendItem {
  date: string;
  bookings: number;
  revenue: number;
}

export interface PopularMovieItem {
  movieId: string;
  title: string;
  bookings: number;
  ticketsSold: number;
  revenue: number;
}

export interface AnalyticsStatusItem {
  status: string;
  count: number;
}

export interface AdminAnalytics {
  period: {
    from: string;
    to: string;
  };
  summary: AdminAnalyticsSummary;
  revenueTrend: RevenueTrendItem[];
  popularMovies: PopularMovieItem[];
  bookingStatuses: AnalyticsStatusItem[];
  paymentStatuses: AnalyticsStatusItem[];
}

export interface SuperAdminStats {
  admins: number;
  users: number;
  movies: number;
  bookings: number;
  revenue: number;
}

export interface CreateAdminValues {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface UploadedImage {
  url: string;
  path: string;
}

export interface MovieRecommendation {
  movie: Movie;
  reason: string;
}

export interface RecommendationResponse extends ApiResponse<MovieRecommendation[]> {
  source: "ai" | "fallback" | "none";
}
export type Payload = Record<string, unknown>;
