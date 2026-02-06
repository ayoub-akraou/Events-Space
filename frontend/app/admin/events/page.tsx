const adminEvents = [
  { title: "Atelier Design Sprint", status: "Brouillon", date: "12 févr 2026" },
  { title: "Conférence Tech & AI", status: "Publié", date: "14 févr 2026" },
  { title: "Meetup Produit", status: "Publié", date: "16 févr 2026" },
];

export default function AdminEventsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
          <h1 className="text-4xl font-semibold text-slate-900">Gestion des événements</h1>
        </div>
        <button className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30">
          Nouvel événement
        </button>
      </header>

      <div className="space-y-4">
        {adminEvents.map((event) => (
          <div
            key={event.title}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{event.status}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{event.title}</h2>
              <p className="text-sm text-slate-600">{event.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Modifier
              </button>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Publier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
