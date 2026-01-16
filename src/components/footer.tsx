"use client";
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Send, Upload, MessageCircle } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FaTelegramPlane } from "react-icons/fa";

const formSchema = z.object({
    name: z.string().min(2, "Укажите ваше имя (минимум 2 символа)"),
    company: z.string().min(2, "Укажите название компании"),
    phone: z
        .string()
        .min(10, "Телефон слишком короткий")
        .regex(
            /^\+?\d[\d\s()-]{9,}$/,
            "Некорректный формат телефона (пример: +79081234567)"
        ),
    email: z.string().email("Пожалуйста, введите корректный email"),
    message: z.string().optional(),
    file: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
            message: "Максимальный размер файла — 10 МБ",
        })
        .refine(
            (file) =>
                !file ||
                [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ].includes(file.type),
            { message: "Разрешены только: PDF, Word, Excel" }
        ),
});

type FormValues = z.infer<typeof formSchema>;

export function Footer() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            company: "",
            phone: "",
            email: "",
            message: "",
            file: undefined,
        },
    });

    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const selectedFile = watch("file");

    const onSubmit = async (data: FormValues) => {
        setSubmitStatus("loading");
        setErrorMessage("");

        try {
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("company", data.company);
            formData.append("phone", data.phone);
            formData.append("email", data.email);
            if (data.message) formData.append("message", data.message);
            if (data.file) formData.append("file", data.file);

            const response = await fetch("/api/send-email", {
                method: "POST",
                body: formData,
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || "Ошибка при отправке");
            }

            setSubmitStatus("success");
            reset();
        } catch (err: any) {
            setSubmitStatus("error");
            setErrorMessage(err.message || "Что-то пошло не так...");
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
                            <h2 className="text-white mb-4">
                                Оставьте заявку — подготовим КП под ваши задачи
                            </h2>
                            <p className="text-slate-400 mb-8">
                                Заполните форму, и наш специалист свяжется с вами в течение 30 минут в рабочее время
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">
                                            Ваше имя *
                                        </label>
                                        <input
                                            {...register("name")}
                                            disabled={isSubmitting}
                                            className={`w-full px-4 py-3 bg-slate-800 border rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50 ${
                                                errors.name ? "border-red-600" : "border-slate-700"
                                            }`}
                                            placeholder="Иван Петров"
                                        />
                                        {errors.name && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">
                                            Компания *
                                        </label>
                                        <input
                                            {...register("company")}
                                            disabled={isSubmitting}
                                            className={`w-full px-4 py-3 bg-slate-800 border rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50 ${
                                                errors.company ? "border-red-600" : "border-slate-700"
                                            }`}
                                            placeholder="ООО «Название»"
                                        />
                                        {errors.company && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {errors.company.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">
                                            Телефон *
                                        </label>
                                        <input
                                            {...register("phone")}
                                            disabled={isSubmitting}
                                            className={`w-full px-4 py-3 bg-slate-800 border rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50 ${
                                                errors.phone ? "border-red-600" : "border-slate-700"
                                            }`}
                                            placeholder="+7 (___) ___-__-__"
                                        />
                                        {errors.phone && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 text-sm mb-2">
                                            Email *
                                        </label>
                                        <input
                                            {...register("email")}
                                            type="email"
                                            disabled={isSubmitting}
                                            className={`w-full px-4 py-3 bg-slate-800 border rounded text-white focus:outline-none focus:border-cyan-600 disabled:opacity-50 ${
                                                errors.email ? "border-red-600" : "border-slate-700"
                                            }`}
                                            placeholder="email@company.ru"
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">
                                        Что нужно?
                                    </label>
                                    <textarea
                                        {...register("message")}
                                        disabled={isSubmitting}
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

                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors bg-slate-800 ${
                                            errors.file
                                                ? "border-red-600"
                                                : "border-slate-700 hover:border-cyan-600"
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            id="footer-file-upload"
                                            className="hidden"
                                            disabled={isSubmitting}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setValue("file", file, { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        <label htmlFor="footer-file-upload" className="cursor-pointer block">
                                            <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                            <p className="text-slate-400 text-sm">
                                                {selectedFile ? selectedFile.name : "Выберите файл или перетащите сюда"}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-1">
                                                PDF, DOC, DOCX, XLS, XLSX (макс. 10 МБ)
                                            </p>
                                        </label>
                                    </div>

                                    {errors.file && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {errors.file.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>Отправка...</>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Запросить коммерческое предложение
                                        </>
                                    )}
                                </button>

                                {submitStatus === "success" && (
                                    <p className="text-green-400 text-center mt-4">
                                        Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.
                                    </p>
                                )}

                                {submitStatus === "error" && (
                                    <p className="text-red-400 text-center mt-4">{errorMessage}</p>
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
                                        <a href="tel:+79080942106" className="text-white text-lg hover:text-cyan-600 transition-colors">
                                            +7 (908) 094-21-06
                                        </a>
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
                                        <p className="text-white">г. Челябинск, ул. Ласковая, д. 20</p>
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
                                    <a href="https://wa.me/79823218085" className="w-12 h-12 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors">
                                        <IoLogoWhatsapp className="w-5 h-5 text-white" />
                                    </a>
                                    <a href="https://t.me/Alsu_Niz" className="w-12 h-12 bg-slate-700 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors">
                                        <FaTelegramPlane className="w-5 h-5 text-white" />
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