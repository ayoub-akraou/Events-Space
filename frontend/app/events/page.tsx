import Link from "next/link";
import { apiGet } from "../../lib/api";
import type { EventItem } from "../../lib/types";

export const dynamic = "force-dynamic";

async function getEvents() {
  try {
    return await apiGet<EventItem[]>("/events");
  } catch {
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Date a confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date a confirmer";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Catalogue</p>
        <h1 className="text-4xl font-semibold text-slate-900">Evenements publies</h1>
        <p className="mt-3 text-base text-slate-600">
          Choisis un evenement et reserve ta place en quelques clics.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-slate-600 shadow-lg shadow-slate-900/5">
          Aucun evenement disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {event.remainingCapacity ?? event.capacityMax} places restantes
                </span>
                <span className="text-xs font-semibold text-slate-500">{formatDate(event.startAt)}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">{event.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {event.location?.name ?? "Lieu a confirmer"}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Voir le detail
                </Link>
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Reserver
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

