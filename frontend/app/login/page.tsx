import LoginClient from "./LoginClient";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Suspense fallback={<div className="text-sm text-slate-600">Chargement...</div>}>
        <LoginClient />
      </Suspense>
    </div>
  );
}
