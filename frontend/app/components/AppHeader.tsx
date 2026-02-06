"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`text-sm font-semibold transition ${
        active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Events</p>
            <p className="text-base font-semibold text-slate-900">Space</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/events" label="Evenements" />
          <NavLink href="/reservations" label="Mes reservations" />
          {user?.role === "ADMIN" && <NavLink href="/admin" label="Admin" />}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
          ) : user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 md:flex">
                <span className="max-w-[220px] truncate">
                  {user.fullName ? user.fullName : user.email}
                </span>
                {user.role === "ADMIN" && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    Admin
                  </span>
                )}
              </div>
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                onClick={handleLogout}
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                href="/login"
              >
                Connexion
              </Link>
              <Link
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                href="/register"
              >
                Creer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

