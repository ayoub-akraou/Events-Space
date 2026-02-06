const adminReservations = [
  { id: "RES-2046", name: "Nora Zahra", event: "Conférence Tech & AI", status: "En attente" },
  { id: "RES-2047", name: "Karim B.", event: "Meetup Produit", status: "Confirmée" },
];

export default function AdminReservationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin</p>
        <h1 className="text-4xl font-semibold text-slate-900">Gestion des réservations</h1>
      </header>

      <div className="space-y-4">
        {adminReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{reservation.id}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{reservation.name}</h2>
              <p className="text-sm text-slate-600">{reservation.event}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                {reservation.status}
              </span>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Refuser
              </button>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Confirmer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
