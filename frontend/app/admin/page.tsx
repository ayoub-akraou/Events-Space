const quickActions = [
  { title: "Créer un événement", desc: "Prépare un nouvel événement avant publication." },
  { title: "Confirmer une réservation", desc: "Gère les demandes en attente." },
  { title: "Voir les indicateurs", desc: "Analyse la participation globale." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
        <h1 className="text-4xl font-semibold text-slate-900">Tableau de bord</h1>
        <p className="mt-3 text-base text-slate-600">
          Supervise les événements, les réservations et les indicateurs clés.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <h2 className="text-xl font-semibold text-slate-900">{action.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{action.desc}</p>
            <button className="mt-6 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Ouvrir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
