import { useMemo } from "react";
import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import useRemote from "../../hooks/useRemote";
import { getCinemas, getScreens, screenApi } from "../../service/admin";
import type { FormField } from "../../components/dashboard/form";
import type { ColumnDef } from "../../components/dashboard/DataTable";
import type { Cinema, Screen, SeatLayoutRow } from "../../types/api";

const TYPES = ["Standard", "Premium", "IMAX", "4DX", "Dolby Atmos"].map((t) => ({ value: t, label: t }));

const columns: ColumnDef<Screen>[] = [
  {
    key: "name", header: "Screen",
    render: (s: Screen) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{s.name}</p>
        <p className="truncate text-xs text-gray-400">{s.screenType}</p>
      </div>
    ),
  },
  { key: "cinema", header: "Cinema", render: (s: Screen) => (typeof s.cinema === "string" ? "—" : s.cinema?.name ?? "—") },
  { key: "layout", header: "Layout", render: (s: Screen) => `${s.rows} rows × ${s.seatsPerRow} seats`, className: "whitespace-nowrap" },
  { key: "seats", header: "Total seats", render: (s: Screen) => s.totalSeats },
  { key: "status", header: "Status", render: (s: Screen) => (s.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Inactive</Badge>) },
];

// A, B, C ... one entry per row (kept only when it fits in the alphabet)
const seatLayout = (rows: number, perRow: number): SeatLayoutRow[] | undefined =>
  rows <= 26 ? Array.from({ length: rows }, (_, i) => ({ row: String.fromCharCode(65 + i), seats: perRow })) : undefined;

export default function Screens() {
  const cinemas = useRemote(getCinemas, "Could not load the cinemas.");

  const fields = useMemo<FormField[]>(() => [
      {
        name: "cinema", label: "Cinema", type: "select", required: true, half: true,
        options: (cinemas.data ?? []).map((c: Cinema) => ({ value: c._id, label: c.name })),
        hint: cinemas.status === "ready" && !cinemas.data?.length ? "Add a cinema first." : undefined,
      },
      { name: "name", label: "Screen name", type: "text", required: true, half: true, placeholder: "Screen 1" },
      { name: "screenType", label: "Screen type", type: "select", options: TYPES, required: true, half: true, defaultValue: "Standard" },
      { name: "rows", label: "Rows", type: "number", required: true, half: true, min: 1, integer: true },
      { name: "seatsPerRow", label: "Seats per row", type: "number", required: true, half: true, min: 1, integer: true, hint: "Total seats = rows × seats per row." },
      { name: "isActive", label: "In service", type: "checkbox", half: true, defaultValue: true },
    ],
    [cinemas.data, cinemas.status]
  );

  return (
    <CrudPage
      title="Screens" subtitle="Auditoriums and their seating layout."
      noun="Screen" plural="screens"
      fetcher={getScreens} api={screenApi}
      columns={columns} fields={fields}
      searchText={(s: Screen) => [s.name, s.screenType, typeof s.cinema === "string" ? "" : s.cinema?.name ?? ""].join(" ")}
      rowName={(s: Screen) => `${s.name}${typeof s.cinema === "string" || !s.cinema ? "" : ` (${s.cinema.name})`}`}
      buildPayload={(body) => {
        const rows = Number(body.rows ?? 0);
        const seatsPerRow = Number(body.seatsPerRow ?? 0);
        return {
          ...body,
          totalSeats: rows * seatsPerRow,
          seatLayout: seatLayout(rows, seatsPerRow),
        };
      }}
      toggle={{
        field: "isActive", onLabel: "Activate", offLabel: "Deactivate",
        run: (s: Screen) => screenApi.update(s._id, { isActive: !s.isActive }),
      }}
      deleteNote="Showtimes on this screen are not removed automatically."
    />
  );
}