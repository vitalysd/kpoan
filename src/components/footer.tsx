"use client";

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Upload, MessageCircle } from 'lucide-react';

interface FormData {
    name: string;
    company: string;
    phone: string;
    email: string;
    message: string;
    file: File | null;
}

export function Footer() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        company: '',
        phone: '',
        email: '',
        message: '',
        file: null,
    });

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     alert('Спасибо за обращение! Мы подготовим коммерческое предложение и свяжемся с вами в ближайшее время.');
    //     setFormData({
    //         name: '',
    //         company: '',
    //         phone: '',
    //         email: '',
    //         message: '',
    //         file: null
    //     });
    // };

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('company', formData.company);
        data.append('phone', formData.phone);
        data.append('email', formData.email);
        data.append('message', formData.message);
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                body: data,
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Ошибка отправки');
            }

            setStatus('success');
            setFormData({ name: '', company: '', phone: '', email: '', message: '', file: null });
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Что-то пошло не так');
        }
    };

    return (
        <section id="contacts" className="bg-slate-900">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Main CTA Section */}
                <div className="py-20 border-b border-slate-800">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Left - Form */}
                        <div>
                            <h2 className="text-white mb-4">Оставьте заявку — подготовим КП под ваши задачи</h2>
                            <p className="text-slate-400 mb-8">
                                Заполните форму, и наш специалист свяжется с вами в течение 30 минут в рабочее время
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">Ваше имя *</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="Иван Петров"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">Компания *</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="ООО «Название»"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">Телефон *</label>
                                        <input
                                            type="tel"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="+7 (___) ___-__-__"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="email@company.ru"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">Что нужно?</label>
                                    <textarea
                                        disabled={status === 'loading'}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                        placeholder="Опишите, какое оборудование требуется, или прикрепите спецификацию ниже..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm mb-2 flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Прикрепить файл (спецификация, ТЗ)
                                    </label>
                                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-cyan-600 transition-colors bg-slate-800">
                                        <input
                                            type="file"
                                            disabled={status === 'loading'}
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                            className="hidden"
                                            id="footer-file-upload"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <label htmlFor="footer-file-upload" className="cursor-pointer block">
                                            <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                            <p className="text-slate-400 text-sm">
                                                {formData.file ? formData.file.name : 'Выберите файл или перетащите сюда'}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX, XLS, XLSX (макс. 10 МБ)</p>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="cursor-pointer w-full md:w-auto bg-cyan-600 hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>Отправка...</>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Запросить коммерческое предложение
                                        </>
                                    )}
                                </button>

                                {status === 'success' && (
                                    <p className="text-green-400 text-center">Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
                                )}

                                {status === 'error' && (
                                    <p className="text-red-400 text-center">{errorMessage}</p>
                                )}

                                <p className="text-slate-500 text-xs">
                                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                                </p>
                            </form>
                        </div>

                        {/* Right - Contacts */}
                        <div className="lg:pl-12">
                            <h3 className="text-white mb-6">Контактная информация</h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-1">Телефон</div>
                                        <a href="tel:+78001234567" className="text-white text-lg hover:text-cyan-600 transition-colors">
                                            +7 (800) 123-45-67
                                        </a>
                                        <p className="text-slate-500 text-sm mt-1">Бесплатно по России</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-1">Email</div>
                                        <a href="mailto:info@kpoan.ru" className="text-white hover:text-cyan-600 transition-colors">
                                            info@kpoan.ru
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-1">Адрес офиса</div>
                                        <p className="text-white">г. Москва, ул. Промышленная, д. 15</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-1">Режим работы</div>
                                        <p className="text-white">Пн-Пт: 9:00 - 18:00</p>
                                        <p className="text-slate-500 text-sm">Сб-Вс: выходной</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messengers */}
                            <div className="bg-slate-800 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageCircle className="w-5 h-5 text-cyan-600" />
                                    <span className="text-white">Пишите в мессенджерах</span>
                                </div>
                                <div className="flex gap-3">
                                    <a href="#" className="w-12 h-12 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors">
                                        <span className="text-white text-lg">W</span>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors">
                                        <span className="text-white text-lg">T</span>
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors">
                                        <span className="text-white text-lg">V</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
                        <div>
                            <p>© 2026 ООО «КПОАН». Все права защищены.</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
                            <a href="#" className="hover:text-white transition-colors">Реквизиты</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}