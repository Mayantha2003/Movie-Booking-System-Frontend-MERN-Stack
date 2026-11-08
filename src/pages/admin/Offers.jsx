import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import { formatDate, formatMoney } from "../../components/dashboard/format";
import { getOffers, offerApi } from "../../service/admin";

const TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed amount (Rs.)" },
];

const fields = [
  { name: "code", label: "Offer code", type: "text", required: true, half: true, uppercase: true, lockOnEdit: true, placeholder: "SAVE20", hint: "Customers type this at checkout." },
  { name: "discountType", label: "Discount type", type: "select", options: TYPES, required: true, half: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "discountValue", label: "Discount value", type: "number", required: true, half: true, min: 1 },
  { name: "maxDiscount", label: "Maximum discount (Rs.)", type: "number", half: true, min: 0, hint: "Caps a percentage discount." },
  { name: "minAmount", label: "Minimum booking (Rs.)", type: "number", half: true, min: 0 },
  { name: "usageLimit", label: "Usage limit", type: "number", half: true, min: 1, integer: true, hint: "Leave empty for unlimited." },
  { name: "validFrom", label: "Valid from", type: "date", required: true, half: true },
  { name: "validTo", label: "Valid until", type: "date", required: true, half: true },
];

const stateOf = (o) => {
  if (new Date(o.validTo) < new Date()) return <Badge tone="gray">Expired</Badge>;
  return o.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Paused</Badge>;
};

const columns = [
  {
    key: "code", header: "Offer",
    render: (o) => (
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold tracking-wide text-white">{o.code}</p>
        <p className="line-clamp-2 text-xs text-gray-400">{o.description}</p>
      </div>
    ),
  },
  {
    key: "discount", header: "Discount", className: "whitespace-nowrap",
    render: (o) => (o.discountType === "percentage" ? `${o.discountValue}%` : formatMoney(o.discountValue)),
  },
  {
    key: "valid", header: "Valid", className: "whitespace-nowrap",
    render: (o) => `${formatDate(o.validFrom)} – ${formatDate(o.validTo)}`,
  },
  { key: "used", header: "Used", render: (o) => `${o.usedCount ?? 0}${o.usageLimit ? ` / ${o.usageLimit}` : ""}`, className: "whitespace-nowrap" },
  { key: "status", header: "Status", render: stateOf },
];

const validate = (v) => {
  const errors = {};
  if (v.discountType === "percentage" && Number(v.discountValue) > 100) errors.discountValue = "A percentage cannot be more than 100.";
  if (v.validFrom && v.validTo && v.validTo < v.validFrom) errors.validTo = "The end date must not be before the start date.";
  return errors;
};

export default function Offers() {
  return (
    <CrudPage
      title="Offers" subtitle="Promo codes customers can apply at checkout."
      noun="Offer" plural="offers"
      fetcher={getOffers} api={offerApi}
      columns={columns} fields={fields} validate={validate}
      searchText={(o) => [o.code, o.description].join(" ")}
      rowName={(o) => o.code}
      toggle={{ field: "isActive", onLabel: "Resume", offLabel: "Pause", run: (o) => offerApi.toggle(o._id) }}
      summary={(rows) => `${rows.filter((o) => o.isActive && new Date(o.validTo) >= new Date()).length} live · ${rows.length} in total`}
    />
  );
}