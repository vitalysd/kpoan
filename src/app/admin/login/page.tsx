import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "Вход в админку",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/products");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-cyan-700">КПОАН</p>
          <h1 className="text-3xl text-slate-950">Админ-панель</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

