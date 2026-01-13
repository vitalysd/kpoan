"use client";

import { Building2, Factory, Warehouse, TrendingUp } from 'lucide-react';

const clientTypes = [
    {
        icon: Factory,
        title: 'Промпредприятия',
        description: 'Машиностроение, металлургия, химия'
    },
    {
        icon: Building2,
        title: 'Строительные компании',
        description: 'Генподрядчики, субподрядчики'
    },
    {
        icon: Warehouse,
        title: 'Логистические центры',
        description: 'Склады, транспортные компании'
    },
    {
        icon: TrendingUp,
        title: 'Торговые сети',
        description: 'СТО, сервисные центры'
    }
];

export function SocialProof() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="mb-4">Нам доверяют</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Более 500 постоянных клиентов по всей России
                    </p>
                </div>

                {/* Client Types */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {clientTypes.map((type, index) => {
                        const Icon = type.icon;
                        return (
                            <div key={index} className="text-center p-6 bg-slate-50 rounded-lg">
                                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Icon className="w-7 h-7 text-cyan-600" />
                                </div>
                                <div className="mb-2">{type.title}</div>
                                <p className="text-slate-600 text-sm">{type.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
