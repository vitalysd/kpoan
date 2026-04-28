import type { MetadataRoute } from 'next';
import { catalogCategories } from '@/data/catalog';
import { prisma, runWithPrismaRetry } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const isSeedCatalogMode =
  process.env.CATALOG_DATA_SOURCE === 'seed' ||
  process.env.NODE_ENV === 'production';

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
  if (isSeedCatalogMode) {
    for (const category of catalogCategories) {
      routes.push({
        url: `${siteUrl}/catalog?category=${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    return routes;
  }

  try {
    const categories = await runWithPrismaRetry(
      () =>
        prisma.category.findMany({
          select: { slug: true, updatedAt: true },
          orderBy: { name: 'asc' },
        }),
      { label: 'Sitemap categories query' },
    );

    for (const cat of categories) {
      routes.push({
        url: `${siteUrl}/catalog?category=${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    for (const category of catalogCategories) {
      routes.push({
        url: `${siteUrl}/catalog?category=${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return routes;
}
