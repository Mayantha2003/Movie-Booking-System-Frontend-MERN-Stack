import Badge from "../dashboard/Badge";

const MAP = {
  ACTIVE: ["green", "Active"],
  BLOCKED: ["red", "Blocked"],
  INACTIVE: ["gray", "Inactive"],
};

export default function AdminStatusBadge({ status = "ACTIVE" }) {
  const [tone, label] = MAP[status] ?? ["gray", status];
  return <Badge tone={tone}>{label}</Badge>;
}