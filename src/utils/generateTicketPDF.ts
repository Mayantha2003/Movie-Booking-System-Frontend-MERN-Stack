import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { BookingConfirmation } from "../types/api";
import { describeDay, showDayKey, sortSeatIds } from "./booking";
import { formatMoney, formatTime } from "../components/dashboard/format";

const loadPoster = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext("2d");

        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = url;
  });

export async function generateTicketPDF(
  booking: BookingConfirmation
): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = 210;
  const bookingCode = booking.bookingCode;

  const ticketConfirmed =
    (booking.bookingStatus === "Confirmed" ||
      booking.bookingStatus === "Completed") &&
    booking.paymentStatus === "Paid";

  // Same QR URL used by TicketCard.tsx
  const qrValue = `${window.location.origin}/booking/confirmation/${booking.bookingCode}`;

  const seatIds = sortSeatIds(
    (booking.seats || []).map((seat) => seat.seatId)
  );

  const showDate = describeDay(
    showDayKey(booking.showtime?.showDate ?? "")
  ).full;

  // Header
  pdf.setFillColor(20, 20, 20);
  pdf.rect(0, 0, pageWidth, 43, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(23);

  pdf.text("CINEMA TICKET", pageWidth / 2, 19, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text("MOVIE BOOKING CONFIRMATION", pageWidth / 2, 28, {
    align: "center",
  });

  // Movie poster
  let textStartX = 15;

  if (booking.movie?.poster) {
    const poster = await loadPoster(booking.movie.poster);

    if (poster) {
      pdf.addImage(poster, "JPEG", 15, 53, 34, 49);
      textStartX = 58;
    }
  }

  // Movie title
  pdf.setTextColor(25, 25, 25);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);

  const movieTitle = pdf.splitTextToSize(
    booking.movie?.title || "Movie",
    pageWidth - textStartX - 15
  );

  pdf.text(movieTitle, textStartX, 61);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(`Booking ID: ${bookingCode}`, textStartX, 78);

  // Divider
  pdf.setDrawColor(210, 210, 210);
  pdf.line(15, 112, 195, 112);

  // Booking details
  const details: [string, string][] = [
    ["Customer", booking.guestInfo?.name || "Registered customer"],
    ["Cinema", booking.cinema?.name || "N/A"],
    ["Screen", booking.screen?.name || "N/A"],
    ["Date", showDate || "N/A"],
    ["Show Time", formatTime(booking.showtime?.startTime || "")],
    ["Seats", seatIds.join(", ") || "N/A"],
    ["Ticket Quantity", String(booking.totalSeats)],
    ["Ticket Price", formatMoney(booking.ticketPrice)],
    ["Food & Beverages", formatMoney(booking.foodTotal ?? 0)],
    ["Discount", formatMoney(booking.discountAmount ?? 0)],
    ["Total Amount", formatMoney(booking.finalAmount)],
    ["Booking Status", booking.bookingStatus],
    ["Payment Status", booking.paymentStatus],
  ];

  let y = 122;

  details.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(70, 70, 70);

    pdf.text(`${label}:`, 15, y);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(25, 25, 25);

    const lines = pdf.splitTextToSize(value || "N/A", 115);

    pdf.text(lines, 65, y);

    y += Math.max(8, lines.length * 5);
  });

  // QR code
  if (ticketConfirmed) {
    const qrImage = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: "M",
      width: 400,
      margin: 2,
    });

    pdf.setDrawColor(210, 210, 210);
    pdf.roundedRect(143, 215, 52, 59, 3, 3, "S");

    pdf.addImage(qrImage, "PNG", 150, 220, 38, 38);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);

    pdf.text("SCAN AT CINEMA", 169, 265, {
      align: "center",
    });
  } else {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(150, 90, 20);

    pdf.text(
      "QR code will be available after payment confirmation.",
      15,
      265
    );
  }

  // Footer
  pdf.setDrawColor(210, 210, 210);
  pdf.line(15, 280, 195, 280);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(110, 110, 110);

  pdf.text(
    "Please present your confirmed ticket QR code at the cinema.",
    pageWidth / 2,
    287,
    { align: "center" }
  );

  pdf.save(`Movie-Ticket-${bookingCode}.pdf`);
}
