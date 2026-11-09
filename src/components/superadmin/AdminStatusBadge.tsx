import type { UserStatus } from "../../types/api";
import Badge from "../dashboard/Badge";

const MAP: Record<UserStatus, ["green" | "red" | "gray", string]> = {
  ACTIVE: ["green", "Active"],
  BLOCKED: ["red", "Blocked"],
  INACTIVE: ["gray", "Inactive"],
};

export default function AdminStatusBadge({ status = "ACTIVE" }: { status?: UserStatus }) {
  const [tone, label] = MAP[status] ?? ["gray", status];
  return <Badge tone={tone}>{label}</Badge>;
}