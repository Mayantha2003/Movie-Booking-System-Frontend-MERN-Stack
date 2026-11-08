import { AlertIcon, CheckIcon } from "../common/Icons";

// tone: "error" | "success"
const Banner = ({ tone = "error", children }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={`mb-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
      tone === "error"
        ? "border-danger/40 bg-danger/10 text-red-800"
        : "border-success/40 bg-success/10 text-green-800"
    }`}
  >
    <span className="mt-0.5 shrink-0">{tone === "error" ? <AlertIcon /> : <CheckIcon />}</span>
    <span>{children}</span>
  </div>
);

export default Banner;