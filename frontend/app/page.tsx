export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Events</p>
            <p className="text-lg font-semibold">Events Space</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a className="hover:text-slate-900" href="/events">
            Événements
          </a>
          <a className="hover:text-slate-900" href="/reservations">
            Mes réservations
          </a>
          <a className="hover:text-slate-900" href="/admin">
            Admin
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            href="/login"
          >
            Connexion
          </a>
          <a
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
            href="/register"
          >
            Créer un compte
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              Nouveau catalogue
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Planifie, découvre et réserve des événements en quelques minutes.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Events Space centralise les événements publics et privés, propose des réservations
              simplifiées et donne aux administrateurs une vision claire de la participation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5">
                Explorer les événements
              </button>
              <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                Voir comment ça marche
              </button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-600">
              <div>
                <p className="text-2xl font-semibold text-slate-900">120+</p>
                <p>événements actifs</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">98%</p>
                <p>taux de confirmation</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">24/7</p>
                <p>accès mobile</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-teal-200/70 blur-xl" />
            <div className="absolute -bottom-8 right-0 h-32 w-32 rounded-full bg-amber-300/70 blur-2xl" />
            <div className="relative rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Prochaines dates</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Cette semaine
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { title: "Atelier Design Sprint", date: "Lun 12 Févr", city: "Casablanca" },
                  { title: "Conférence Tech & AI", date: "Mer 14 Févr", city: "Rabat" },
                  { title: "Meetup Produit", date: "Ven 16 Févr", city: "Tanger" },
                ].map((event) => (
                  <div
                    key={event.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.city}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Réservation express",
              desc: "Un parcours clair avec validation instantanée et suivi des statuts.",
            },
            {
              title: "Tableau de bord admin",
              desc: "Suivez les confirmations, les refus et les annulations en temps réel.",
            },
            {
              title: "Tickets PDF",
              desc: "Téléchargez un ticket officiel dès qu’une réservation est confirmée.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
            >
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
