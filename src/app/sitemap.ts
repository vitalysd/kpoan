import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kpoan.ru';

  // Статические страницы
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Динамические страницы каталога (по категориям)
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: 'asc' },
    });

    for (const cat of categories) {
      routes.push({
        url: `${siteUrl}/catalog?category=${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // Если БД недоступна — возвращаем хотя бы статические маршруты
  }

  return routes;
}
