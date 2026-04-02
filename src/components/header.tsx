"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, Menu, X } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'О компании', id: 'about', href: '/#about' },
    { label: 'Преимущества', id: 'advantages', href: '/#advantages' },
    { label: 'Ассортимент', id: 'assortment', href: '/#assortment' },
    { label: 'Контакты', id: 'contacts', href: '/#contacts' },
] as const;

const sectionIds = menuItems
    .filter((item) => item.id)
    .map((item) => item.id);

const topSectionIds = ['hero', 'categories'];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const hasSolidBackground = !isHomePage || isScrolled;

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

    useEffect(() => {
        if (!isHomePage) {
            return;
        }

        const observedIds = [...topSectionIds, ...sectionIds];
        const sections = observedIds
            .map((id) => document.getElementById(id))
            .filter((section): section is HTMLElement => section instanceof HTMLElement);

        if (!sections.length) return;

        const updateActiveSection = () => {
            const offset = 140;
            const currentSection = [...sections]
                .reverse()
                .find((section) => section.getBoundingClientRect().top - offset <= 0);
            setActiveSection(currentSection?.id ?? null);
        };

        updateActiveSection();

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visibleSections.length > 0) {
                    setActiveSection(visibleSections[0].target.id);
                    return;
                }

                updateActiveSection();
            },
            {
                rootMargin: '-35% 0px -45% 0px',
                threshold: [0.2, 0.35, 0.5, 0.75],
            }
        );

        sections.forEach((section) => observer.observe(section));
        window.addEventListener('scroll', updateActiveSection, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', updateActiveSection);
        };
    }, [isHomePage]);

    const scrollToSection = (id: string) => {
        if (!isHomePage) return;
        const section = document.getElementById(id);
        if (section) {
            const headerOffset = 96;
            const sectionTop = section.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
            setActiveSection(id);
        }
        setIsMobileMenuOpen(false);
    };

    const isItemActive = (item: typeof menuItems[number]) => {
        if (item.id) {
            return isHomePage && activeSection === item.id;
        }

        if (item.href === '/') {
            return isHomePage && (activeSection === null || topSectionIds.includes(activeSection));
        }

        return pathname === item.href;
    };

    return (
        <header
            ref={mobileMenuRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                hasSolidBackground
                    ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg'
                    : 'bg-slate-900/50 backdrop-blur-sm'
            }`}
        >
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.svg"
                            width={120}
                            height={50}
                            alt="ООО «КПОАН»"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                        {menuItems.map((item) => {
                            const isActive = isItemActive(item);

                            return item.id && isHomePage ? (
                                <button
                                    key={item.label}
                                    onClick={() => scrollToSection(item.id!)}
                                    className={`group relative cursor-pointer transition-colors text-sm ${
                                        isActive ? 'text-cyan-400' : 'text-white hover:text-cyan-200'
                                    }`}
                                >
                                    {item.label}
                                    <span className={`absolute top-6 left-0 h-0.5 bg-cyan-500 transition-all duration-300 origin-left ${
                                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                                </button>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`group relative transition-colors text-sm ${
                                        isActive ? 'text-cyan-400' : 'text-white hover:text-cyan-200'
                                    }`}
                                >
                                    {item.label}
                                    <span className={`absolute top-6 left-0 h-0.5 bg-cyan-500 transition-all duration-300 origin-left ${
                                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                                </Link>
                            );
                        })}
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
                        <Link
                            href="/#contacts"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="bg-cyan-500 hover:bg-cyan-700 text-white px-3 py-2 md:px-6 md:py-2.5 rounded transition-colors text-sm"
                        >
                            <span className="hidden sm:inline">Запросить КП</span>
                            <span className="sm:hidden">КП</span>
                        </Link>

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
                            {menuItems.map((item) => {
                                const isActive = isItemActive(item);

                                return item.id && isHomePage ? (
                                    <button
                                        key={item.label}
                                        onClick={() => scrollToSection(item.id!)}
                                        className={`transition-colors text-left py-3 px-4 rounded ${
                                            isActive
                                                ? 'bg-slate-700 text-cyan-400'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`transition-colors text-left py-3 px-4 rounded ${
                                            isActive
                                                ? 'bg-slate-700 text-cyan-400'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
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
