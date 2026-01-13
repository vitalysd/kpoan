"use client";

import { useState } from 'react';
import { Upload, Calendar, Send } from 'lucide-react';

interface FormData {
    company: string;
    contactPerson: string;
    phone: string;
    email: string;
    tenderNumber: string;
    deadline: string;
    description: string;
    file: File | null;
}

export function Tenders() {
    const [formData, setFormData] = useState<FormData>({
        company: '',
        contactPerson: '',
        phone: '',
        email: '',
        tenderNumber: '',
        deadline: '',
        description: '',
        file: null,
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const data = new FormData();
        data.append('company', formData.company);
        data.append('contactPerson', formData.contactPerson);
        data.append('phone', formData.phone);
        data.append('email', formData.email);
        data.append('tenderNumber', formData.tenderNumber);
        data.append('deadline', formData.deadline);
        data.append('description', formData.description);
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
            // Очистка формы после успеха
            setFormData({
                company: '',
                contactPerson: '',
                phone: '',
                email: '',
                tenderNumber: '',
                deadline: '',
                description: '',
                file: null,
            });
            // Сброс input file (чтобы имя файла исчезло)
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Что-то пошло не так');
        }
    };

    return (
        <section id="tenders" className="py-20 bg-slate-900">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-0">
                        {/* Left - Info */}
                        <div className="p-8 lg:p-12 bg-slate-50">
                            <h2 className="mb-6">Тендеры и закупки</h2>
                            <div className="space-y-4 text-slate-700">
                                <p className="text-lg">
                                    Работаем по <strong>44-ФЗ и 223-ФЗ</strong>. Готовим коммерческие предложения под требования закупок.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                                        <span>Быстрая подготовка технико-коммерческих предложений</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                                        <span>Помощь в формировании спецификаций</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                                        <span>Полный пакет документов для тендерной документации</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                                        <span>Сопровождение на всех этапах закупки</span>
                                    </li>
                                </ul>

                                <div className="bg-white p-6 rounded-lg mt-8 border-l-4 border-cyan-600">
                                    <div className="mb-2">Оперативная работа</div>
                                    <p className="text-slate-600">
                                        Понимаем важность сроков. КП формируем в течение <strong>2-4 часов</strong> после получения спецификации.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right - Form */}
                        <div className="p-8 lg:p-12">
                            <h3 className="mb-6">Сообщите о вашей закупке</h3>

                            <form onSubmit={handleSubmit2} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2">Название компании *</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="ООО «Название»"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-2">Контактное лицо *</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2">Телефон *</label>
                                        <input
                                            type="tel"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="+7 (___) ___-__-__"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="email@company.ru"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2">Номер закупки/тендера</label>
                                        <input
                                            type="text"
                                            disabled={status === 'loading'}
                                            value={formData.tenderNumber}
                                            onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                            placeholder="№ закупки"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Срок подачи предложения *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            disabled={status === 'loading'}
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm mb-2">Описание закупки</label>
                                    <textarea
                                        disabled={status === 'loading'}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                                        placeholder="Кратко опишите, что требуется..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Прикрепить спецификацию/техническое задание
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-cyan-600 transition-colors">
                                        <input
                                            type="file"
                                            disabled={status === 'loading'}
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer block">
                                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-slate-600">
                                                {formData.file ? formData.file.name : 'Нажмите для загрузки или перетащите файл'}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX, XLS, XLSX (макс. 10 МБ)</p>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="cursor-pointer w-full bg-cyan-600 hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>Отправка...</>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Отправить запрос
                                        </>
                                    )}
                                </button>

                                {status === 'success' && (
                                    <p className="text-green-400 text-center">Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
                                )}

                                {status === 'error' && (
                                    <p className="text-red-400 text-center">{errorMessage}</p>
                                )}

                                <p className="text-slate-500 text-xs text-center">
                                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
