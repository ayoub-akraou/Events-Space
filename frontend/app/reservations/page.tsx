import ReservationsClient from "./ReservationsClient";

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
      <ReservationsClient />
    </div>
  );
}
