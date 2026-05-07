"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAdmin } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAdmin, undefined);

  return (
    <form action={action} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Пароль администратора
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
        />
      </div>

      {state?.error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {isPending ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}

