import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              Nouveau catalogue
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Planifie, decouvre et reserve des evenements en quelques minutes.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Events Space centralise les evenements publics et prives, propose des reservations
              simplifiees et donne aux administrateurs une vision claire de la participation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5"
                href="/events"
              >
                Explorer les evenements
              </Link>
              <Link
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                href="/register"
              >
                Creer un compte
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-600">
              <div>
                <p className="text-2xl font-semibold text-slate-900">120+</p>
                <p>evenements actifs</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">98%</p>
                <p>taux de confirmation</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">24/7</p>
                <p>acces mobile</p>
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
                  { title: "Atelier Design Sprint", date: "Lun 12 Fevr", city: "Casablanca" },
                  { title: "Conference Tech & AI", date: "Mer 14 Fevr", city: "Rabat" },
                  { title: "Meetup Produit", date: "Ven 16 Fevr", city: "Tanger" },
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
              title: "Reservation express",
              desc: "Un parcours clair avec validation instantanee et suivi des statuts.",
            },
            {
              title: "Tableau de bord admin",
              desc: "Suivez les confirmations, les refus et les annulations en temps reel.",
            },
            {
              title: "Tickets PDF",
              desc: "Telechargez un ticket officiel des qu'une reservation est confirmee.",
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

