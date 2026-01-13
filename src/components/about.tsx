"use client";

import { Award, MapPin, Handshake, Shield, Package, ClipboardCheck, FileText, CreditCard } from 'lucide-react';
import Image from "next/image";

export function About() {
    return (
        <section id="about" className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Left - Text */}
                    <div>
                        <h2 className="mb-6">ООО «КПОАН»</h2>
                        <p className="text-slate-600 mb-8 text-lg">
                            Надежный поставщик промышленного оборудования и инструмента для предприятий, производств и строительных компаний по всей России.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-700/10 rounded flex items-center justify-center flex-shrink-0">
                                    <Award className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="mb-1">Более 15 лет на рынке</div>
                                    <p className="text-slate-600 text-sm">Проверенная репутация и стабильные поставки</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-700/10 rounded flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="mb-1">Работа по всей России</div>
                                    <p className="text-slate-600 text-sm">Поставки в любой регион РФ, логистика под ключ</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-700/10 rounded flex items-center justify-center flex-shrink-0">
                                    <Handshake className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="mb-1">Прямое сотрудничество с заводами</div>
                                    <p className="text-slate-600 text-sm">Конкурентные цены без посредников</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-700/10 rounded flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="mb-1">Официальный статус дилера</div>
                                    <p className="text-slate-600 text-sm">Сертифицированная продукция с гарантией</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Image */}
                    <div className="relative rounded-lg overflow-hidden shadow-xl">
                        <Image
                            src="/about.png"
                            className="w-full h-full object-cover"
                            width={500}
                            height={500}
                            alt="Поставки инструмента"
                        />
                    </div>
                </div>

                {/* Info Strip */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-8 rounded-lg">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Package className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="mb-1">Комплексные поставки</div>
                        <p className="text-slate-600 text-sm">Весь спектр оборудования в одном КП</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <ClipboardCheck className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="mb-1">Подбор по ТЗ</div>
                        <p className="text-slate-600 text-sm">Персональный менеджер и консультации</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <FileText className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="mb-1">Сопровождение тендеров</div>
                        <p className="text-slate-600 text-sm">Помощь в оформлении документов</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <CreditCard className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="mb-1">Работа по договорам</div>
                        <p className="text-slate-600 text-sm">Безнал, отсрочка, гибкие условия</p>
                    </div>
                </div>
            </div>
        </section>
    );
}