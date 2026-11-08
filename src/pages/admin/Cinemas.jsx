import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import { getCinemas, cinemaApi } from "../../service/admin";

const fields = [
  { name: "name", label: "Cinema name", type: "text", required: true, half: true },
  { name: "location", label: "Location", type: "text", required: true, half: true, placeholder: "e.g. Colombo 03" },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true, half: true },
  { name: "state", label: "Province / state", type: "text", half: true },
  { name: "pincode", label: "Postal code", type: "text", half: true },
  { name: "contactNumber", label: "Contact number", type: "tel", half: true },
  { name: "email", label: "Email", type: "email" },
  { name: "facilities", label: "Facilities", type: "list", placeholder: "Parking, Food court, Wheelchair access" },
  { name: "isActive", label: "Open for bookings", type: "checkbox", defaultValue: true },
];

const columns = [
  {
    key: "name", header: "Cinema",
    render: (c) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{c.name}</p>
        <p className="truncate text-xs text-gray-400">{c.location}</p>
      </div>
    ),
  },
  { key: "city", header: "City", render: (c) => c.city },
  { key: "contact", header: "Contact", render: (c) => c.contactNumber || c.email || "—" },
  { key: "facilities", header: "Facilities", render: (c) => (c.facilities ?? []).join(", ") || "—", hideOnMobile: true },
  { key: "status", header: "Status", render: (c) => (c.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Inactive</Badge>) },
];

export default function Cinemas() {
  return (
    <CrudPage
      title="Cinemas" subtitle="The venues that host your screens and showtimes."
      noun="Cinema" plural="cinemas"
      fetcher={getCinemas} api={cinemaApi}
      columns={columns} fields={fields}
      searchText={(c) => [c.name, c.location, c.city, c.email].join(" ")}
      rowName={(c) => c.name}
      toggle={{
        field: "isActive", onLabel: "Activate", offLabel: "Deactivate",
        run: (c) => cinemaApi.update(c._id, { isActive: !c.isActive }),
      }}
      summary={(rows) => `${rows.filter((c) => c.isActive).length} active · ${rows.length} in total`}
      deleteNote="Its screens and showtimes are not removed automatically."
    />
  );
}