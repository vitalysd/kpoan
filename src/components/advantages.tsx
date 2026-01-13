"use client";

import { Package2, DollarSign, Clock, Headphones, FileCheck } from 'lucide-react';

const advantages = [
    {
        icon: Package2,
        title: '10 000+ наименований',
        description: 'Широкий ассортимент оборудования и инструмента на складе и под заказ'
    },
    {
        icon: DollarSign,
        title: 'Гибкие условия',
        description: 'Отсрочка платежа для постоянных клиентов, работа по тендерам и 44/223-ФЗ'
    },
    {
        icon: Clock,
        title: 'Быстрая обработка',
        description: 'Коммерческое предложение в течение 2-4 часов, оперативная отгрузка'
    },
    {
        icon: Headphones,
        title: 'Персональный менеджер',
        description: 'Закрепленный специалист на весь цикл сделки, помощь с выбором'
    },
    {
        icon: FileCheck,
        title: 'Полный пакет документов',
        description: 'Сертификаты, паспорта, счета, акты — всё для бухгалтерии и отчетности'
    }
];

export function Advantages() {
    return (
        <section id="advantages" className="py-20 bg-slate-100">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="mb-4">Почему нас выбирают</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Мы знаем, что важно для промышленных компаний и строительных организаций
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advantages.map((advantage, index) => {
                        const Icon = advantage.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-14 h-14 bg-slate-700/10 rounded-lg flex items-center justify-center mb-4">
                                    <Icon className="w-7 h-7 text-cyan-600" />
                                </div>
                                <h4 className="mb-3">{advantage.title}</h4>
                                <p className="text-slate-600">{advantage.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
