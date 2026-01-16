"use client";

import { FileText, Upload, CheckCircle } from 'lucide-react';
import Image from "next/image";

export function Hero() {
    const scrollToContacts = () => {
        const contactsSection = document.getElementById('contacts');
        contactsSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="hero" className="relative bg-slate-900 pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Column - Content */}
                    <div>
                        <h1 className="text-white mb-4 md:mb-6 text-2xl md:text-4xl lg:text-5xl">
                            Комплексные поставки промышленного оборудования по всей России
                        </h1>
                        <p className="text-slate-300 text-base md:text-xl mb-6 md:mb-8 max-w-xl">
                            Прямые контракты с производителями. Индивидуальный подбор под спецификацию. Работа с тендерами и госзакупками.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-8 md:mb-12">
                            <button
                                onClick={scrollToContacts}
                                className="cursor-pointer bg-cyan-500 hover:bg-cyan-700 text-white px-5 py-3 md:px-8 md:py-4 rounded transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="hidden sm:inline">Запросить коммерческое предложение</span>
                                <span className="sm:hidden">Запросить КП</span>
                            </button>
                            <button
                                onClick={scrollToContacts}
                                className="cursor-pointer border-2 border-white text-white hover:bg-white hover:text-slate-900 px-5 py-3 md:px-8 md:py-4 rounded transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <Upload className="w-4 h-4 md:w-5 md:h-5" />
                                Отправить спецификацию
                            </button>
                        </div>

                        {/* Trust Bar */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 text-slate-300 border-t border-slate-700 pt-4 md:pt-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 flex-shrink-0" />
                                <span className="text-sm md:text-base">10 000+ позиций</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 flex-shrink-0" />
                                <span className="text-sm md:text-base">Быстрая доставка по России</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 flex-shrink-0" />
                                <span className="text-sm md:text-base">Официальные дилеры</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Image/Map */}
                    <div className="relative">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                            <Image
                                src="/hero.jpg"
                                className="w-full h-full object-cover"
                                width={500}
                                height={500}
                                alt="Поставки оборудования"
                            />
                            {/* Overlay with regions highlight */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent">
                                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                                        <div className="text-white mb-2 text-sm md:text-base">Поставки по всей России</div>
                                        <div className="flex flex-wrap gap-1.5 md:gap-2 text-xs">
                                            <span className="bg-cyan-500 text-white px-3 py-1 rounded">Москва</span>
                                            <span className="bg-cyan-500 text-white px-3 py-1 rounded">Санкт-Петербург</span>
                                            <span className="bg-cyan-500 text-white px-3 py-1 rounded">Екатеринбург</span>
                                            <span className="bg-cyan-500 text-white px-3 py-1 rounded">Новосибирск</span>
                                            <span className="bg-slate-700 text-white px-3 py-1 rounded">+83 региона</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}