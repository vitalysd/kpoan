import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { getCatalogCategories } from "@/lib/catalog";

const featuredCategoryOrder = [
    "elektroinstrument",
    "promyshlennoe-oborudovanie",
    "svarochnoe-oborudovanie-i-komplektuyushchie",
    "dorozhnoe-i-garazhnoe-oborudovanie",
    "skladskoe-i-gruzopodemnoe-oborudovanie",
    "benzoinstrument-sadovaya-tekhnika",
    "ruchnoj-slesarnyj-instrument",
    "elektrotekhnicheskie-izdeliya",
] as const;

const categoryTitleOverrides: Record<string, string> = {
    elektroinstrument: "Электроинструмент и расходники",
    "promyshlennoe-oborudovanie": "Станки и промышленное оборудование",
};

export async function Categories() {
    const catalogCategories = await getCatalogCategories();
    const categoryMap = new Map(catalogCategories.map((category) => [category.slug, category]));
    const featuredCategories = featuredCategoryOrder
        .map((slug) => categoryMap.get(slug))
        .filter((category) => category !== undefined);

    return (
        <section id="categories" className="py-12 md:py-20 bg-slate-50">
            <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="text-center mb-8 md:mb-12">
                    <h2 className="mb-3 md:mb-4">Оборудование и инструменты под ваши задачи</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base px-4">
                        Категории для снабжения производства, стройки, сервиса и хозяйственных задач
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {featuredCategories.map((category, index) => {
                        const Icon = category.icon;
                        const title = categoryTitleOverrides[category.slug] ?? category.name;
                        return (
                            <Reveal
                                key={category.id}
                                delay={index * 70}
                            >
                                <Link
                                href={`/catalog?category=${category.slug}`}
                                className="bg-white p-5 md:p-6 rounded-lg border-2 border-transparent hover:border-cyan-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group block"
                            >
                                <div className="w-11 h-11 md:w-12 md:h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:bg-cyan-500 transition-colors">
                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-slate-700 group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="mb-2 text-sm md:text-base">{title}</h4>
                                <p className="text-slate-600 text-xs md:text-sm mb-3 md:mb-4">{category.description}</p>
                                <div className="flex items-center gap-2 text-cyan-500 group-hover:gap-3 transition-all">
                                    <span className="text-xs md:text-sm">Открыть каталог</span>
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                </Link>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
