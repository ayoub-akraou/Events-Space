import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "../../../lib/api";
import type { EventItem } from "../../../lib/types";
import ReserveAction from "./ReserveAction";

export const dynamic = "force-dynamic";

type EventDetailProps = {
  params: { id: string };
};

async function getEvent(id: string) {
  try {
    return await apiGet<EventItem>(`/events/${id}`);
  } catch {
    return null;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "A confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "A confirmer";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const event = await getEvent(params.id);
  if (!event) {
    notFound();
  }

  const remaining = event.remainingCapacity ?? event.capacityMax;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <Link href="/events" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
        {"<-"} Retour au catalogue
      </Link>
      <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">{event.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {formatDateTime(event.startAt)}
              {event.endAt ? ` - ${formatDateTime(event.endAt)}` : ""}
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            {remaining} places restantes
          </span>
        </div>
        <p className="mt-6 text-base leading-relaxed text-slate-600">
          {event.description ?? "Aucune description disponible pour cet evenement."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lieu</p>
            <p className="text-lg font-semibold text-slate-900">
              {event.location?.name ?? "Lieu a confirmer"}
            </p>
            <p className="text-sm text-slate-600">{event.location?.addressLine ?? ""}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reference</p>
            <p className="text-lg font-semibold text-slate-900">EVT-{params.id.toUpperCase()}</p>
            <p className="text-sm text-slate-600">Ouvert aux participants inscrits</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ReserveAction eventId={event.id} disabled={remaining <= 0} />
          <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
            Ajouter a mon agenda
          </button>
        </div>
      </div>
    </div>
  );
}

