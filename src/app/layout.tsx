import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";


export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico'
  },
  title: 'ООО «КПОАН»',
  description: 'Комплексные поставки оборудования и инструмента',
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
  openGraph: {
    title: 'ООО «КПОАН»',
    description: 'Надежный поставщик промышленного оборудования и инструмента для предприятий, производств и строительных компаний по всей России.',
    url: 'https://kpoan.ru',
    siteName: 'ООО «КПОАН»',
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Комплексные поставки оборудования и инструмента',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
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
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
