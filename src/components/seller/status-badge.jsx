import { ORDER_STATUS_LABEL } from "@/lib/seller-demo-data";

const STYLES = {
  placed: "bg-accent text-brand-tertiary",
  preparing: "bg-brand-tertiary/10 text-brand-tertiary",
  ready_for_pickup: "bg-emerald-100 text-emerald-800",
  out_for_delivery: "bg-emerald-100 text-emerald-800",
  completed: "bg-muted text-brand-subtle",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
        STYLES[status] || "bg-muted text-brand-subtle"
      } ${className}`}
    >
      {ORDER_STATUS_LABEL[status] || status}
    </span>
  );
}