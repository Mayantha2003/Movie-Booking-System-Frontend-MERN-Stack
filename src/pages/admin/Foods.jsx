import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import Thumb from "../../components/dashboard/Thumb";
import { formatMoney } from "../../components/dashboard/format";
import { getFoods, foodApi } from "../../service/admin";

const CATEGORIES = ["Popcorn", "Drinks", "Snacks", "Combos", "Other"].map((c) => ({ value: c, label: c }));

const fields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "category", label: "Category", type: "select", options: CATEGORIES, required: true, half: true },
  { name: "price", label: "Price (Rs.)", type: "number", required: true, half: true, min: 0 },
  { name: "description", label: "Description", type: "textarea" },
  { name: "image", label: "Image link", type: "url", placeholder: "https://…" },
  { name: "isVegetarian", label: "Vegetarian", type: "checkbox" },
];

const columns = [
  {
    key: "name", header: "Item",
    render: (f) => (
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={f.image} fallback="🍿" className="size-12 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{f.name}</p>
          {f.description && <p className="truncate text-xs text-gray-400">{f.description}</p>}
        </div>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (f) => f.category },
  { key: "price", header: "Price", render: (f) => formatMoney(f.price), className: "whitespace-nowrap" },
  { key: "veg", header: "Diet", render: (f) => (f.isVegetarian ? <Badge tone="green">Vegetarian</Badge> : <span className="text-gray-500">—</span>) },
  { key: "status", header: "Menu", render: (f) => (f.isAvailable ? <Badge tone="green">Available</Badge> : <Badge tone="gray">Hidden</Badge>) },
];

export default function Foods() {
  return (
    <CrudPage
      title="Foods" subtitle="Snacks and drinks customers can add to a booking."
      noun="Food item" plural="food items"
      fetcher={getFoods} api={foodApi}
      columns={columns} fields={fields}
      searchText={(f) => [f.name, f.category, f.description].join(" ")}
      rowName={(f) => f.name}
      toggle={{ field: "isAvailable", onLabel: "Show", offLabel: "Hide", run: (f) => foodApi.toggle(f._id) }}
      summary={(rows) => `${rows.filter((f) => f.isAvailable).length} on the menu · ${rows.length} in total`}
    />
  );
}