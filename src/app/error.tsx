"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error("Page error:", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-dashed border-red-300 bg-white px-8 py-16 text-center shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold text-red-700">
          Что-то пошло не так
        </h1>
        <p className="mb-6 text-slate-600">
          Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
