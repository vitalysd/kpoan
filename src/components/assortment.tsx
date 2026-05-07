"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Wrench,
  Zap,
  Cog,
  Box,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

const assortmentData = [
  {
    id: "power-tools",
    icon: Wrench,
    title: "Электроинструмент и расходники",
    items: [
      "Дрели, перфораторы, шуруповерты (Bosch, Makita, DeWalt)",
      "Углошлифовальные машины (болгарки) всех размеров",
      "Пилы циркулярные, сабельные, лобзики",
      "Шлифмашины, полировальные машины",
      "Диски отрезные, шлифовальные, алмазные по камню",
      "Буры, сверла, коронки, биты, оснастка",
    ],
  },
  {
    id: "electrical",
    icon: Zap,
    title: "Электрооборудование и кабель",
    items: [
      "Кабельно-проводниковая продукция всех марок",
      "Автоматические выключатели, УЗО, дифавтоматы",
      "Щитовое оборудование и распределительные шкафы",
      "Электросчетчики, реле, контакторы",
      "Источники бесперебойного питания",
      "Светодиодные светильники и прожекторы",
    ],
  },
  {
    id: "machinery",
    icon: Cog,
    title: "Станки и промышленное оборудование",
    items: [
      "Токарные и фрезерные станки",
      "Сварочное оборудование (MIG, TIG, MMA)",
      "Компрессоры воздушные поршневые и винтовые",
      "Генераторы электрические бензиновые и дизельные",
      "Гидравлические прессы и станки",
      "Деревообрабатывающие станки",
    ],
  },
  {
    id: "consumables",
    icon: Box,
    title: "Метизы, крепеж, расходники",
    items: [
      "Болты, гайки, шпильки всех стандартов",
      "Анкеры, дюбели, саморезы",
      "Такелажная оснастка: стропы, цепи, тросы",
      "Абразивные материалы и круги",
      "Клеи, герметики, смазки промышленные",
      "Лента изоляционная, хомуты, стяжки",
    ],
  },
];

export function Assortment() {
  const [openId, setOpenId] = useState("power-tools");

  return (
    <section id="assortment" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="text-center mb-12">
          <h2 className="mb-4">Ассортимент поставляемой продукции</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Полный спектр оборудования для промышленных предприятий,
            строительных и сервисных компаний
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Accordion Menu */}
          <Reveal className="lg:col-span-1 space-y-2">
            {assortmentData.map((category) => {
              const Icon = category.icon;
              const isOpen = openId === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setOpenId(category.id)}
                  className={`cursor-pointer w-full text-left p-4 rounded-lg transition-all flex items-center gap-3 ${
                    isOpen
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isOpen ? "text-white" : "text-cyan-600"}`}
                  />
                  <span className="flex-1">{category.title}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                );
              })}
          </Reveal>

          {/* Right - Content */}
          <Reveal className="lg:col-span-2" delay={50}>
            {assortmentData.map((category) => {
              if (openId !== category.id) return null;

              return (
                <div key={category.id} className="bg-slate-50 rounded-lg p-8">
                  <h3 className="mb-6">{category.title}</h3>

                  <ul className="space-y-3 mb-8">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-200">
                    <Link
                      href="/catalog"
                      className="inline-flex items-center justify-center rounded bg-cyan-600 px-6 py-3 text-white transition-colors hover:bg-cyan-800"
                    >
                      Перейти в каталог
                    </Link>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
