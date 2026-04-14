import { FileSearch, ClipboardCheck, Package, Truck } from 'lucide-react';
import { Reveal } from "@/components/reveal";

const steps = [
    {
        number: 1,
        icon: FileSearch,
        title: 'Получение запроса',
        description: 'Вы отправляете спецификацию или техническое задание любым удобным способом'
    },
    {
        number: 2,
        icon: ClipboardCheck,
        title: 'Подготовка КП',
        description: 'Наш специалист анализирует запрос и готовит коммерческое предложение в течение 2-4 часов'
    },
    {
        number: 3,
        icon: Package,
        title: 'Согласование и оплата',
        description: 'Согласовываем условия, оформляем договор, выставляем счет. Возможна отсрочка платежа'
    },
    {
        number: 4,
        icon: Truck,
        title: 'Отгрузка и доставка',
        description: 'Комплектуем заказ, упаковываем и отправляем транспортной компанией по вашему адресу'
    }
];

const deliveryRegions = [
    { region: 'Москва и МО', time: '1-2 дня', icon: '🏢', iconLabel: 'Москва' },
    { region: 'Санкт-Петербург', time: '2-3 дня', icon: '🏛️', iconLabel: 'Санкт-Петербург' },
    { region: 'Центральная Россия', time: '3-5 дней', icon: '🚛', iconLabel: 'Доставка грузовиком' },
    { region: 'Урал и Сибирь', time: '5-7 дней', icon: '🚂', iconLabel: 'Доставка поездом' },
    { region: 'Дальний Восток', time: '7-10 дней', icon: '✈️', iconLabel: 'Доставка самолётом' }
];

export function WorkProcess() {
    return (
        <section className="py-20 bg-slate-100">
            <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="text-center mb-12">
                    <h2 className="mb-4">Как мы работаем</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Прозрачный процесс от запроса до получения оборудования
                    </p>
                </Reveal>

                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === steps.length - 1;

                            return (
                                <Reveal key={step.title} className="relative" delay={index * 90}>
                                    <div className="flex gap-6">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white z-10 relative">
                                                <span className="text-xl">{step.number}</span>
                                            </div>
                                            {!isLast && (
                                                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 pb-8">
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Icon className="w-6 h-6 text-cyan-600" />
                                                    <h4>{step.title}</h4>
                                                </div>
                                                <p className="text-slate-600">{step.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal className="bg-white rounded-lg shadow-lg p-8" delay={140}>
                        <h3 className="mb-6 text-center">Доставка по всей России</h3>

                        <div className="relative bg-slate-50 rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4" aria-hidden="true">🗺️</div>
                                <p className="sr-only">Карта России — доставка по всей стране</p>
                                <p className="text-slate-600">
                                    Работаем со всеми транспортными компаниями
                                </p>
                                <p className="text-slate-500 text-sm mt-2">
                                    ПЭК, Деловые Линии, СДЭК, Байкал-Сервис
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="mb-3">Типовые сроки доставки:</div>
                            {deliveryRegions.map((item) => (
                                <div key={item.region} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                                        <span className="sr-only">{item.iconLabel}</span>
                                        <span className="text-slate-700">{item.region}</span>
                                    </div>
                                    <span className="text-cyan-600">{item.time}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-slate-500 text-sm mt-4 text-center">
                            * Сроки указаны ориентировочные, зависят от наличия на складе и выбранной ТК
                        </p>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
