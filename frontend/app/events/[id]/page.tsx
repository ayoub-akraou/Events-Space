type EventDetailProps = {
  params: { id: string };
};

export default function EventDetailPage({ params }: EventDetailProps) {
  const event = {
    title: "Atelier Design Sprint",
    date: "12 févr 2026 · 09:00 - 17:00",
    location: "Casablanca",
    address: "Technopark, Rue Ghandi",
    seats: 12,
    description:
      "Un atelier intensif pour aligner équipes produit, design et business autour d'un prototype actionnable.",
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <a href="/events" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
        ← Retour au catalogue
      </a>
      <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">{event.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{event.date}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            {event.seats} places restantes
          </span>
        </div>
        <p className="mt-6 text-base leading-relaxed text-slate-600">{event.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lieu</p>
            <p className="text-lg font-semibold text-slate-900">{event.location}</p>
            <p className="text-sm text-slate-600">{event.address}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Référence</p>
            <p className="text-lg font-semibold text-slate-900">EVT-{params.id.toUpperCase()}</p>
            <p className="text-sm text-slate-600">Ouvert aux participants inscrits</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
            Demander une réservation
          </button>
          <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
            Ajouter à mon agenda
          </button>
        </div>
      </div>
    </div>
  );
}
