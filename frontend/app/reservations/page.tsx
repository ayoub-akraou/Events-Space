const reservations = [
  {
    id: "RES-2045",
    event: "Atelier Design Sprint",
    date: "12 févr 2026",
    status: "Confirmée",
  },
  {
    id: "RES-2046",
    event: "Conférence Tech & AI",
    date: "14 févr 2026",
    status: "En attente",
  },
];

export default function ReservationsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Espace participant</p>
        <h1 className="text-4xl font-semibold text-slate-900">Mes réservations</h1>
        <p className="mt-3 text-base text-slate-600">
          Suis l'avancement de tes demandes et télécharge tes tickets confirmés.
        </p>
      </header>

      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{reservation.id}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{reservation.event}</h2>
              <p className="text-sm text-slate-600">{reservation.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {reservation.status}
              </span>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Télécharger le ticket
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
