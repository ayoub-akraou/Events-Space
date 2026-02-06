"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../../lib/api";
import type { EventItem, Location } from "../../../lib/types";
import { useAuth } from "../../providers/AuthProvider";

type AdminEventItem = EventItem & {
  confirmedReservations?: number;
};

type EventFormState = {
  title: string;
  description: string;
  startAtLocal: string;
  endAtLocal: string;
  capacityMax: string;
  locationId: string;
};

type LocationFormState = {
  name: string;
  addressLine: string;
  city: string;
  country: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoFromLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function statusBadge(status: EventItem["status"]) {
  switch (status) {
    case "DRAFT":
      return { label: "Brouillon", className: "bg-slate-100 text-slate-700" };
    case "PUBLISHED":
      return { label: "Publie", className: "bg-emerald-100 text-emerald-700" };
    case "CANCELED":
      return { label: "Annule", className: "bg-rose-100 text-rose-700" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-700" };
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

function createEmptyEventForm(): EventFormState {
  return {
    title: "",
    description: "",
    startAtLocal: "",
    endAtLocal: "",
    capacityMax: "30",
    locationId: "",
  };
}

export default function AdminEventsClient() {
  const apiBase = getApiBase();
  const { token } = useAuth();

  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<EventFormState>(() => createEmptyEventForm());
  const [creating, setCreating] = useState(false);

  const [locationForm, setLocationForm] = useState<LocationFormState>({
    name: "",
    addressLine: "",
    city: "",
    country: "",
  });
  const [creatingLocation, setCreatingLocation] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(() => createEmptyEventForm());
  const [savingEdit, setSavingEdit] = useState(false);

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchEvents = async () => {
    if (!authHeaders) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/events/admin`, {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Impossible de charger les evenements.");
      }
      const data = (await res.json()) as AdminEventItem[];
      setEvents(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    if (!authHeaders) return;
    setLoadingLocations(true);
    try {
      const res = await fetch(`${apiBase}/locations`, { headers: authHeaders });
      if (!res.ok) {
        throw new Error("Impossible de charger les lieux.");
      }
      const data = (await res.json()) as Location[];
      setLocations(data);
      setCreateForm((prev) => ({
        ...prev,
        locationId: prev.locationId || (data[0]?.id ?? ""),
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (!authHeaders) return;
    fetchEvents();
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  const handleCreateEvent = async () => {
    if (!authHeaders) return;
    setError(null);
    setCreating(true);
    try {
      const startAt = toIsoFromLocalInput(createForm.startAtLocal);
      const endAt = createForm.endAtLocal ? toIsoFromLocalInput(createForm.endAtLocal) : null;

      if (!createForm.title.trim()) {
        throw new Error("Le titre est obligatoire.");
      }
      if (!startAt) {
        throw new Error("La date de debut est obligatoire.");
      }
      const capacity = Number.parseInt(createForm.capacityMax, 10);
      if (!Number.isFinite(capacity) || capacity <= 0) {
        throw new Error("La capacite doit etre un nombre > 0.");
      }
      if (!createForm.locationId) {
        throw new Error("Selectionne un lieu.");
      }

      const res = await fetch(`${apiBase}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim() || undefined,
          startAt,
          endAt: endAt ?? undefined,
          capacityMax: capacity,
          locationId: createForm.locationId,
        }),
      });

      if (!res.ok) {
        throw new Error("Creation impossible.");
      }

      await res.json();
      setCreateForm(createEmptyEventForm());
      setShowCreate(false);
      await fetchEvents();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!authHeaders) return;
    setError(null);
    setCreatingLocation(true);
    try {
      if (!locationForm.name.trim()) {
        throw new Error("Le nom du lieu est obligatoire.");
      }

      const res = await fetch(`${apiBase}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          name: locationForm.name.trim(),
          addressLine: locationForm.addressLine.trim() || undefined,
          city: locationForm.city.trim() || undefined,
          country: locationForm.country.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("Creation du lieu impossible.");
      }
      const created = (await res.json()) as Location;
      setLocationForm({ name: "", addressLine: "", city: "", country: "" });
      await fetchLocations();
      setCreateForm((prev) => ({ ...prev, locationId: created.id }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreatingLocation(false);
    }
  };

  const publishEvent = async (eventId: string) => {
    if (!authHeaders) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/events/${eventId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Publication impossible.");
      }
      await fetchEvents();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const cancelEvent = async (eventId: string) => {
    if (!authHeaders) return;
    const ok = window.confirm("Annuler cet evenement ? Les reservations seront bloquees.");
    if (!ok) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/events/${eventId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Annulation impossible.");
      }
      await fetchEvents();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEditing = (event: AdminEventItem) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title ?? "",
      description: event.description ?? "",
      startAtLocal: toLocalInputValue(event.startAt),
      endAtLocal: toLocalInputValue(event.endAt),
      capacityMax: String(event.capacityMax ?? 30),
      locationId: event.locationId ?? "",
    });
    setShowCreate(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setSavingEdit(false);
  };

  const saveEditing = async () => {
    if (!authHeaders || !editingId) return;
    setError(null);
    setSavingEdit(true);
    try {
      const startAt = toIsoFromLocalInput(editForm.startAtLocal);
      const endAt = editForm.endAtLocal ? toIsoFromLocalInput(editForm.endAtLocal) : null;
      const capacity = Number.parseInt(editForm.capacityMax, 10);

      if (!editForm.title.trim()) {
        throw new Error("Le titre est obligatoire.");
      }
      if (!startAt) {
        throw new Error("La date de debut est obligatoire.");
      }
      if (!Number.isFinite(capacity) || capacity <= 0) {
        throw new Error("La capacite doit etre un nombre > 0.");
      }
      if (!editForm.locationId) {
        throw new Error("Selectionne un lieu.");
      }

      const res = await fetch(`${apiBase}/events/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          startAt,
          endAt: endAt ?? undefined,
          capacityMax: capacity,
          locationId: editForm.locationId,
        }),
      });
      if (!res.ok) {
        throw new Error("Modification impossible.");
      }
      await res.json();
      setEditingId(null);
      await fetchEvents();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Evenements</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cree, modifie, publie et annule les evenements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            onClick={fetchEvents}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Rafraichir"}
          </button>
          <button
            className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5"
            onClick={() => setShowCreate((prev) => !prev)}
          >
            {showCreate ? "Fermer" : "Nouvel evenement"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
          <h3 className="text-lg font-semibold text-slate-900">Creer un evenement</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              placeholder="Titre"
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="min-h-[110px] rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              placeholder="Description (optionnel)"
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <label className="grid gap-2 text-sm text-slate-600">
              Date debut
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                type="datetime-local"
                value={createForm.startAtLocal}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, startAtLocal: e.target.value }))
                }
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-600">
              Date fin (optionnel)
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                type="datetime-local"
                value={createForm.endAtLocal}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, endAtLocal: e.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-600">
              Capacite max
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                inputMode="numeric"
                value={createForm.capacityMax}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, capacityMax: e.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-600">
              Lieu
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                value={createForm.locationId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, locationId: e.target.value }))}
                disabled={loadingLocations}
              >
                {locations.length === 0 ? (
                  <option value="">Aucun lieu</option>
                ) : (
                  locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:opacity-60"
              onClick={handleCreateEvent}
              disabled={creating}
            >
              {creating ? "Creation..." : "Creer"}
            </button>
            <button
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
              onClick={() => setShowCreate(false)}
              disabled={creating}
            >
              Annuler
            </button>
          </div>

          <div className="mt-8 border-t border-slate-200/70 pt-6">
            <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Ajouter un lieu
            </h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                placeholder="Nom du lieu"
                value={locationForm.name}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                placeholder="Adresse (optionnel)"
                value={locationForm.addressLine}
                onChange={(e) =>
                  setLocationForm((prev) => ({ ...prev, addressLine: e.target.value }))
                }
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Ville (optionnel)"
                value={locationForm.city}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, city: e.target.value }))}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Pays (optionnel)"
                value={locationForm.country}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <button
              className="mt-4 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
              onClick={handleCreateLocation}
              disabled={creatingLocation}
            >
              {creatingLocation ? "Creation..." : "Creer le lieu"}
            </button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-slate-600 shadow-lg shadow-slate-900/5">
          Aucun evenement. Cree ton premier evenement pour demarrer.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const badge = statusBadge(event.status);
            const confirmed = event.confirmedReservations ?? 0;
            const remaining = event.remainingCapacity ?? event.capacityMax;
            const isEditing = editingId === event.id;
            return (
              <div
                key={event.id}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatDateTime(event.startAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-900">{event.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {event.location?.name ?? "Lieu"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Capacite: {event.capacityMax}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Confirmes: {confirmed}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Restantes: {remaining}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => startEditing(event)}
                      disabled={isEditing}
                    >
                      Modifier
                    </button>

                    {event.status === "DRAFT" && (
                      <button
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
                        onClick={() => publishEvent(event.id)}
                      >
                        Publier
                      </button>
                    )}
                    {event.status === "PUBLISHED" && (
                      <button
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20"
                        onClick={() => cancelEvent(event.id)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Modification
                    </h4>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <input
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                        placeholder="Titre"
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      />
                      <textarea
                        className="min-h-[110px] rounded-2xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
                        placeholder="Description (optionnel)"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                      />
                      <label className="grid gap-2 text-sm text-slate-600">
                        Date debut
                        <input
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                          type="datetime-local"
                          value={editForm.startAtLocal}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, startAtLocal: e.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm text-slate-600">
                        Date fin (optionnel)
                        <input
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                          type="datetime-local"
                          value={editForm.endAtLocal}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, endAtLocal: e.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm text-slate-600">
                        Capacite max
                        <input
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900"
                          inputMode="numeric"
                          value={editForm.capacityMax}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, capacityMax: e.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm text-slate-600">
                        Lieu
                        <select
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                          value={editForm.locationId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, locationId: e.target.value }))
                          }
                        >
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:opacity-60"
                        onClick={saveEditing}
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
                        onClick={cancelEditing}
                        disabled={savingEdit}
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

