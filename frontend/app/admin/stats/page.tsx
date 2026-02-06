const stats = [
  { label: "Événements publiés", value: "24" },
  { label: "Réservations confirmées", value: "312" },
  { label: "En attente", value: "42" },
  { label: "Taux de remplissage", value: "86%" },
];

export default function AdminStatsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
        <h1 className="text-4xl font-semibold text-slate-900">Indicateurs clés</h1>
        <p className="mt-3 text-base text-slate-600">
          Visualise l'activité et les taux de remplissage par événement.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
