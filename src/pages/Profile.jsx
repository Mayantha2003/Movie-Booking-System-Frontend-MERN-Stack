
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import useAuth from "../hooks/useAuth";
import { getMyBookings } from "../service/booking";

const EDIT_ENABLED = false;

// Updated premium navy theme
const container = "mx-auto w-full max-w-7xl px-4 sm:px-6";
const card = "rounded-2xl border border-[#39475B] bg-[#263449] shadow-xl shadow-black/20";

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c.6-3.8 3.7-6 7.5-6s6.9 2.2 7.5 6" strokeLinecap="round" />
  </svg>
);

const TicketIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" strokeLinejoin="round" />
    <path d="M14 6v12" strokeDasharray="2 2.4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="m16 8 4 4-4 4M20 12H9" />
  </svg>
);

const AvatarSilhouette = () => (
  <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
    <defs>
      <linearGradient id="avatar-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E11D48" />
        <stop offset="1" stopColor="#9F1239" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#avatar-grad)" />
    <ellipse cx="50" cy="38" rx="17" ry="20" fill="#fff" fillOpacity="0.95" />
    <path d="M14 96c2-22 16-32 36-32s34 10 36 32a50 50 0 0 1-72 0Z" fill="#fff" fillOpacity="0.95" />
  </svg>
);

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_STYLES = {
  Confirmed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  Completed: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  Cancelled: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const SectionTitle = ({ children }) => (
  <h2 className="flex items-center gap-3 text-lg font-extrabold text-[#F1F5F9]">
    <span className="h-5 w-1 rounded-full bg-[#E11D48]" aria-hidden="true" />
    {children}
  </h2>
);

const DetailRow = ({ label, value }) => (
  <div className="grid gap-1 border-b border-[#39475B] py-4 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-6">
    <dt className="text-sm text-[#AAB6C7]">{label}</dt>
    <dd className={`break-words text-sm ${value ? "font-semibold text-[#F1F5F9]" : "italic text-[#94A3B8]"}`}>
      {value || "Not provided"}
    </dd>
  </div>
);

const SideButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition ${
      active
        ? "bg-[#E11D48]/15 text-[#FFFFFF] ring-1 ring-[#E11D48]/50"
        : "text-[#AAB6C7] hover:bg-[#33445C] hover:text-white"
    }`}
  >
    <span className={active ? "text-[#FB7185]" : "text-[#94A3B8]"}>{icon}</span>
    {children}
  </button>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") === "bookings" ? "bookings" : "details";
  const selectTab = (tab) => setSearchParams(tab === "details" ? {} : { tab }, { replace: true });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab !== "bookings") return undefined;

    let ignore = false;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyBookings();
        if (!ignore) setBookings(response?.data || []);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Unable to load your bookings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBookings();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "User";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dateOfBirth = user?.dateOfBirth ? formatDate(user.dateOfBirth) : "";

  return (
    <div className="flex min-h-screen flex-col bg-[#182235] text-[#F1F5F9]">
      <Navbar />

      <main className="flex-1">

        {/* Profile Header */}
        <section className="relative overflow-hidden border-b border-[#39475B] bg-gradient-to-br from-[#263449] via-[#202D40] to-[#182235]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-[#E11D48]/10 blur-3xl"
          />

          <div className={`${container} relative flex items-center gap-5 py-8 sm:gap-7 sm:py-10`}>
            <div className="size-24 shrink-0 overflow-hidden rounded-full shadow-lg shadow-rose-950/30 ring-4 ring-[#E11D48]/30 sm:size-28">
              <AvatarSilhouette />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
                {fullName}
              </h1>

              {user?.username && (
                <span className="mt-2 inline-block rounded-full border border-[#475569] bg-[#33445C] px-3 py-0.5 text-xs font-semibold text-[#CBD5E1]">
                  @{user.username}
                </span>
              )}

              <p className="mt-2 truncate text-sm text-[#AAB6C7]">
                {user?.email || "Email not available"}
              </p>

              <p className="mt-0.5 text-sm text-[#AAB6C7]">
                {user?.phone || "Phone number not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar + Content */}
        <section className={`${container} grid gap-6 py-8 lg:grid-cols-[280px_1fr] lg:py-10`}>

          <aside className={`${card} flex min-h-[200px] flex-col p-3`}>
            <nav aria-label="Account" className="space-y-1.5">

              <SideButton
                active={activeTab === "details"}
                onClick={() => selectTab("details")}
                icon={<PersonIcon />}
              >
                Personal Details
              </SideButton>

              <SideButton
                active={activeTab === "bookings"}
                onClick={() => selectTab("bookings")}
                icon={<TicketIcon />}
              >
                My Bookings
              </SideButton>

            </nav>

            <div className="mt-auto border-t border-[#39475B] pt-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-bold text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          </aside>

          <div className={`${card} min-h-[360px] p-5 sm:p-8`}>

            {activeTab === "details" && (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-[#39475B] pb-4">

                  <SectionTitle>Contact Information</SectionTitle>

                  <button
                    type="button"
                    disabled={!EDIT_ENABLED}
                    title={EDIT_ENABLED ? undefined : "Profile editing is coming soon"}
                    className="rounded-lg border border-[#E11D48]/50 px-4 py-1.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:border-[#39475B] disabled:text-[#64748B] disabled:hover:bg-transparent"
                  >
                    Edit Details
                  </button>

                </div>

                <dl>
                  <DetailRow label="Full Name" value={fullName} />
                  <DetailRow label="Email" value={user?.email} />
                  <DetailRow label="Phone" value={user?.phone} />
                  <DetailRow label="Gender" value={user?.gender} />
                  <DetailRow label="Marital Status" value={user?.maritalStatus} />
                  <DetailRow label="Date of Birth" value={dateOfBirth} />
                </dl>
              </>
            )}

            {activeTab === "bookings" && (
              <>
                <div className="border-b border-[#39475B] pb-4">
                  <SectionTitle>My Bookings</SectionTitle>
                </div>

                {loading && (
                  <p className="py-10 text-center text-sm text-[#AAB6C7]">
                    Loading your bookings...
                  </p>
                )}

                {error && (
                  <p role="alert" className="py-10 text-center text-sm text-rose-300">
                    {error}
                  </p>
                )}

                {!loading && !error && bookings.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-lg font-bold text-[#F1F5F9]">No bookings yet</p>
                    <p className="mt-2 text-sm text-[#AAB6C7]">
                      Your movie bookings will appear here.
                    </p>
                  </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                  <div className="mt-5 space-y-4">

                    {bookings.map((booking) => (
                      <article
                        key={booking._id}
                        className="flex flex-col gap-4 rounded-xl border border-[#39475B] bg-[#202D40] p-4 transition hover:border-[#E11D48]/40 sm:flex-row"
                      >

                        <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-[#182235]">
                          {booking.movie?.poster ? (
                            <img
                              src={booking.movie.poster}
                              alt={booking.movie?.title || "Movie poster"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-xs text-[#AAB6C7]">
                              No Poster
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-lg font-extrabold text-[#F1F5F9]">
                              {booking.movie?.title || "Movie"}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                                STATUS_STYLES[booking.bookingStatus] || "bg-white/5 text-[#AAB6C7] ring-[#39475B]"
                              }`}
                            >
                              {booking.bookingStatus || "Unknown"}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-[#AAB6C7] sm:grid-cols-2">

                            <p><strong className="font-semibold text-[#F1F5F9]">Booking Code:</strong> {booking.bookingCode || "N/A"}</p>
                            <p><strong className="font-semibold text-[#F1F5F9]">Cinema:</strong> {booking.cinema?.name || "N/A"}</p>
                            <p><strong className="font-semibold text-[#F1F5F9]">Date:</strong> {formatDate(booking.showtime?.showDate)}</p>
                            <p><strong className="font-semibold text-[#F1F5F9]">Time:</strong> {booking.showtime?.startTime || "N/A"}</p>
                            <p><strong className="font-semibold text-[#F1F5F9]">Screen:</strong> {booking.screen?.name || "N/A"}</p>

                            <p>
                              <strong className="font-semibold text-[#F1F5F9]">Seats:</strong>{" "}
                              {booking.seats?.map((seat) => seat.seatId).join(", ") || "N/A"}
                            </p>

                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#39475B] pt-3">

                            <p className="text-base font-extrabold text-[#F1F5F9]">
                              Rs. {Number(booking.finalAmount || 0).toLocaleString("en-LK")}
                            </p>

                            <p className="text-xs text-[#AAB6C7]">
                              Payment: {booking.paymentStatus || "Pending"}
                            </p>

                          </div>
                        </div>
                      </article>
                    ))}

                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
