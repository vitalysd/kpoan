"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, Menu, X } from 'lucide-react';
import Image from "next/image";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const scrollToContacts = () => {
        const contactsSection = document.getElementById('contacts');
        contactsSection?.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        section?.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    const menuItems = [
        { label: 'Главная', id: 'hero' },
        { label: 'О компании', id: 'about' },
        { label: 'Преимущества', id: 'advantages' },
        { label: 'Ассортимент', id: 'assortment' },
        { label: 'Контакты', id: 'contacts' },
    ];

    return (
        <header
            ref={mobileMenuRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-slate-900/50 backdrop-blur-sm'
            }`}
        >
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            src="/logo.svg"
                            width={120}
                            height={50}
                            alt="ООО «КПОАН»"
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="group relative cursor-pointer text-white transition-colors text-sm"
                            >
                                {item.label}
                                <span className="absolute top-6 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300 origin-left" />
                            </button>
                        ))}
                    </nav>

                    {/* Contact Info & CTA */}
                    <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                        <a href="tel:+79080942106" className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm">
                            <Phone className="w-4 h-4" />
                            <span className="hidden xl:inline">+7 (908) 094-21-06</span>
                        </a>
                        <a href="mailto:info@kpoan.ru" className="hidden xl:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm">
                            <Mail className="w-4 h-4" />
                            <span>info@kpoan.ru</span>
                        </a>
                        <button
                            onClick={scrollToContacts}
                            className="cursor-pointer bg-cyan-500 hover:bg-cyan-700 text-white px-3 py-2 md:px-6 md:py-2.5 rounded transition-colors text-sm"
                        >
                            <span className="hidden sm:inline">Запросить КП</span>
                            <span className="sm:hidden">КП</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden text-white p-2"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <nav className="lg:hidden bg-slate-800 rounded-lg mt-2 mb-4 py-4 px-4 shadow-xl animate-fadeIn">
                        <div className="flex flex-col gap-3">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-left py-3 px-4 rounded"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <div className="border-t border-slate-700 pt-3 mt-2 flex flex-col gap-3">
                                <a
                                    href="tel:+79080942106"
                                    className="flex items-center gap-3 text-slate-300 hover:text-white py-3 px-4 rounded hover:bg-slate-700 transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>+7 (908) 094-21-06</span>
                                </a>
                                <a
                                    href="mailto:info@kpoan.ru"
                                    className="flex items-center gap-3 text-slate-300 hover:text-white py-3 px-4 rounded hover:bg-slate-700 transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>info@kpoan.ru</span>
                                </a>
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}