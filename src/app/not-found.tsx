import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-8xl font-bold text-slate-200">404</div>
        <h1 className="mb-3 text-2xl font-semibold text-slate-900">
          Страница не найдена
        </h1>
        <p className="mb-8 text-slate-600">
          Запрашиваемая страница не существует или была перемещена.
          Проверьте адрес или вернитесь на главную.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
          >
            На главную
          </Link>
          <Link
            href="/catalog"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-500 hover:text-cyan-700"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </main>
  );
}
