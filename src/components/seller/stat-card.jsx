export default function StatCard({ label, value, hint, hintTone = "subtle", icon: Icon }) {
  const hintColor =
    hintTone === "positive"
      ? "text-emerald-700"
      : hintTone === "accent"
      ? "text-brand-tertiary"
      : "text-brand-subtle";

  return (
    <div className="bg-card p-5 rounded-card border border-brand-line shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold text-brand-subtle uppercase tracking-wide block">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-input bg-accent flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-brand-tertiary" />
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-brand-primary mt-1.5">{value}</div>
      {hint && <span className={`text-[11px] font-semibold mt-1 inline-block ${hintColor}`}>{hint}</span>}
    </div>
  );
}