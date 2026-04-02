import type { ReactNode } from "react";

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-base text-slate-900">{title}</div>
      {children}
    </section>
  );
}
