export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="bg-card/95 backdrop-blur border-b border-brand-line sticky top-0 z-30 px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-extrabold text-brand-primary truncate">{title}</h1>
        {subtitle && <p className="text-xs text-brand-subtle mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}