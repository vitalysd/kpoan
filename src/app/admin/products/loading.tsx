export default function AdminProductsLoading() {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-label="Товары загружаются">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="h-[50px] rounded bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-14 rounded bg-slate-200" />
            <div className="h-[50px] rounded bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-[50px] rounded bg-slate-100" />
          </div>
          <div className="flex items-end">
            <div className="h-[50px] w-24 rounded bg-slate-200" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 rounded bg-slate-200" />
            <div className="h-4 w-56 rounded bg-slate-100" />
          </div>
          <div className="h-10 w-36 rounded bg-cyan-100" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Товар</th>
                <th className="px-5 py-3 font-medium">Бренд</th>
                <th className="px-5 py-3 font-medium">Категория</th>
                <th className="px-5 py-3 font-medium">Цена</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4">
                    <div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-9 w-28 animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

