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
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-dashed border-red-300 bg-white px-8 py-16 text-center shadow-sm">
        <div className="mb-3 text-2xl font-semibold text-red-700">
          Что-то пошло не так
        </div>
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
    </div>
  );
}
