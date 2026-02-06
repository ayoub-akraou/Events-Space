const mockEvents = [
  {
    id: "design-sprint",
    title: "Atelier Design Sprint",
    date: "12 févr 2026",
    location: "Casablanca",
    seats: 12,
  },
  {
    id: "tech-ai",
    title: "Conférence Tech & AI",
    date: "14 févr 2026",
    location: "Rabat",
    seats: 8,
  },
  {
    id: "product-meetup",
    title: "Meetup Produit",
    date: "16 févr 2026",
    location: "Tanger",
    seats: 4,
  },
];

export default function EventsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Catalogue</p>
        <h1 className="text-4xl font-semibold text-slate-900">Événements publiés</h1>
        <p className="mt-3 text-base text-slate-600">
          Choisis un événement et réserve ta place en quelques clics.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {mockEvents.map((event) => (
          <article
            key={event.id}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {event.seats} places restantes
              </span>
              <span className="text-xs font-semibold text-slate-500">{event.date}</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{event.location}</p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={`/events/${event.id}`}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Voir le détail
              </a>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Réserver
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
