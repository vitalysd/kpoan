import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kpoan.ru'),
  icons: {
    icon: '/favicon.ico'
  },
  title: {
    default: 'ООО «КПОАН» — Комплексные поставки промышленного оборудования',
    template: '%s | ООО «КПОАН»',
  },
  description: 'Комплексные поставки оборудования и инструмента. Прямые контракты с производителями. Индивидуальный подбор под спецификацию. Доставка по всей России.',
  keywords: ["поставка промышленного оборудования",
    "промышленное оборудование",
    "электроинструмент оптом",
    "ручной инструмент",
    "поставки по тендерам",
    "госзакупки 44-ФЗ",
    "станки для металлообработки",
    "расходные материалы",
    "СИЗ оптом",
    "промышленные насосы",
    "доставка по России",
    "подбор оборудования",
    "крепёж оптом",
    "метизы оптом",
    "электрооборудование",
    "складская техника",
    "погрузчики",
    "инструмент для строительства",
    "прямые поставки",
    "223-ФЗ закупки"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ООО «КПОАН» — Комплексные поставки промышленного оборудования',
    description: 'Надежный поставщик промышленного оборудования и инструмента для предприятий, производств и строительных компаний по всей России.',
    siteName: 'ООО «КПОАН»',
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Комплексные поставки промышленного оборудования — ООО «КПОАН»',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ООО «КПОАН» — Комплексные поставки промышленного оборудования',
    description: 'Надежный поставщик промышленного оборудования и инструмента для предприятий, производств и строительных компаний по всей России.',
    images: ['/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ООО «КПОАН»",
    "url": process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpoan.ru",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpoan.ru"}/logo.svg`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-351-777-78-01",
      "email": "info@kpoan.ru",
      "contactType": "sales",
      "areaServed": "RU",
      "availableLanguage": "Russian",
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Челябинск",
      "streetAddress": "ул. Ласковая, д. 20",
      "addressCountry": "RU",
    },
    "sameAs": [
      "https://wa.me/79823218085",
      "https://t.me/Alsu_Niz",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ООО «КПОАН»",
    "url": process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpoan.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpoan.ru"}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://t.me" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
