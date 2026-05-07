import Link from "next/link";
import { LogOut, Package, Plus } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <Link href="/admin/products" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded bg-slate-900 text-white">
              <Package className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.16em] text-cyan-700">КПОАН</span>
              <span className="block text-xl font-semibold text-slate-950">Управление товарами</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              Добавить товар
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </form>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}

