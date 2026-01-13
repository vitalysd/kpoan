"use client";

import { Wrench, Hammer, Zap, Cog, Box, Truck, HardHat, Settings } from 'lucide-react';

const categories = [
    {
        icon: Wrench,
        title: 'Электроинструмент',
        description: 'Дрели, перфораторы, шлифмашины, пилы от ведущих производителей',
        link: '#assortment'
    },
    {
        icon: Hammer,
        title: 'Ручной инструмент',
        description: 'Профессиональный инструмент для любых монтажных и ремонтных работ',
        link: '#assortment'
    },
    {
        icon: Zap,
        title: 'Электрооборудование',
        description: 'Кабели, щитовое оборудование, источники питания, автоматика',
        link: '#assortment'
    },
    {
        icon: Cog,
        title: 'Станки и оснастка',
        description: 'Металлообрабатывающее и деревообрабатывающее оборудование',
        link: '#assortment'
    },
    {
        icon: Box,
        title: 'Расходные материалы',
        description: 'Диски, сверла, буры, абразивы, крепеж, метизы в наличии',
        link: '#assortment'
    },
    {
        icon: Truck,
        title: 'Складская техника',
        description: 'Погрузчики, тележки, подъемники, стеллажи и стропы',
        link: '#assortment'
    },
    {
        icon: HardHat,
        title: 'СИЗ и спецодежда',
        description: 'Средства индивидуальной защиты, спецобувь, перчатки',
        link: '#assortment'
    },
    {
        icon: Settings,
        title: 'Промышленные насосы',
        description: 'Насосное оборудование для воды, химии и нефтепродуктов',
        link: '#assortment'
    }
];

export function Categories() {
    return (
        <section id="categories" className="py-12 md:py-20 bg-slate-50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="mb-3 md:mb-4">Оборудование и инструменты под ваши задачи</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base px-4">
                        Широкий ассортимент продукции для промышленности, строительства и ремонта
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <a
                                key={index}
                                href={category.link}
                                className="bg-white p-5 md:p-6 rounded-lg border-2 border-transparent hover:border-cyan-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className="w-11 h-11 md:w-12 md:h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:bg-cyan-500 transition-colors">
                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-slate-700 group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="mb-2 text-sm md:text-base">{category.title}</h4>
                                <p className="text-slate-600 text-xs md:text-sm mb-3 md:mb-4">{category.description}</p>
                                <div className="flex items-center gap-2 text-cyan-500 group-hover:gap-3 transition-all">
                                    <span className="text-xs md:text-sm">Запросить прайс</span>
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
