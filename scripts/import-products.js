const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const XML_FILE = path.join(__dirname, '..', 'src', 'data', 'products.xml');

// Статистика
const stats = {
  total: 0,
  success: 0,
  skipped: 0,
  errors: 0,
  brandsCreated: 0,
  brandsFound: 0,
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function extractTag(buffer, tagName) {
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;
  
  const openIdx = buffer.indexOf(openTag);
  if (openIdx === -1) return null;
  
  const closeIdx = buffer.indexOf(closeTag, openIdx + openTag.length);
  if (closeIdx === -1) return null;
  
  return buffer.substring(openIdx + openTag.length, closeIdx).trim();
}

async function main() {
  console.log('🚀 Начинаем импорт товаров...');
  console.log(`📁 Файл: ${XML_FILE}`);
  
  const startTime = Date.now();
  
  // Создаём PrismaClient с увеличенным пулом
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PRISMA_DATABASE_URL,
      },
    },
  });
  
  // Получаем первую категорию
  const firstCategory = await prisma.category.findFirst();
  if (!firstCategory) {
    console.error('❌ Нет категорий в БД!');
    await prisma.$disconnect();
    process.exit(1);
  }
  
  const defaultCategoryId = firstCategory.id;
  console.log(`✓ Категория: ${firstCategory.name}`);
  
  // Кэш брендов
  const brandCache = new Map();
  
  // Предзагружаем все существующие бренды
  const existingBrands = await prisma.brand.findMany();
  existingBrands.forEach(brand => {
    brandCache.set(brand.name.toLowerCase(), brand);
  });
  console.log(`✓ Загружено ${brandCache.size} существующих брендов`);
  
  // Читаем XML
  const readStream = fs.createReadStream(XML_FILE, { 
    encoding: 'utf8', 
    highWaterMark: 64 * 1024 
  });
  
  let buffer = '';
  const batchSize = 500; // Пакет для вставки
  let pendingProducts = [];
  
  const processBatch = async () => {
    if (pendingProducts.length === 0) return;
    
    try {
      const batch = pendingProducts.splice(0, batchSize);
      
      // Получаем/создаём бренды пакетом
      const brandNames = [...new Set(batch.map(p => p.brandName))];
      for (const brandName of brandNames) {
        if (!brandCache.has(brandName)) {
          const slug = slugify(brandName);
          let brand = await prisma.brand.findUnique({ where: { slug } });
          if (!brand) {
            brand = await prisma.brand.create({ data: { name: brandName, slug } });
            stats.brandsCreated++;
          } else {
            stats.brandsFound++;
          }
          brandCache.set(brandName, brand);
        }
      }
      
      // Создаём товары
      for (const product of batch) {
        const brand = brandCache.get(product.brandName);
        if (!brand) continue;
        
        const slug = slugify(product.name) + '-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        
        try {
          await prisma.product.create({
            data: {
              slug,
              name: product.name,
              shortDescription: null,
              price: 0,
              brandId: brand.id,
              categoryId: defaultCategoryId,
            },
          });
          stats.success++;
        } catch (err) {
          // Пропускаем дубликаты slug
          if (err.code === 'P2002') {
            stats.skipped++;
          } else {
            throw err;
          }
        }
      }
      
      if (stats.total % 1000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⏳ ${stats.total} товаров, ${stats.success} добавлено (${elapsed}с)`);
      }
    } catch (err) {
      console.error('❌ Ошибка пакета:', err.message);
      stats.errors += batchSize;
    }
  };
  
  let offersFound = false;
  
  readStream.on('data', (chunk) => {
    buffer += chunk;
    
    // Ищем <offers>
    if (!offersFound) {
      const offersIdx = buffer.indexOf('<offers>');
      if (offersIdx === -1) {
        buffer = buffer.slice(-500);
        return;
      }
      buffer = buffer.substring(offersIdx + 8);
      offersFound = true;
      console.log('✓ Найдена секция <offers>');
    }
    
    // Обрабатываем товары
    while (true) {
      const openIdx = buffer.indexOf('<ДетальнаяЗапись>');
      if (openIdx === -1) {
        buffer = buffer.slice(-500);
        break;
      }
      
      const closeIdx = buffer.indexOf('</ДетальнаяЗапись>', openIdx);
      if (closeIdx === -1) {
        buffer = buffer.substring(openIdx);
        break;
      }
      
      const offerBlock = buffer.substring(openIdx, closeIdx + 18);
      buffer = buffer.substring(closeIdx + 18);
      stats.total++;
      
      // Парсим
      const name = extractTag(offerBlock, 'Наименование');
      if (!name) {
        stats.skipped++;
        continue;
      }
      
      const brandName = extractTag(offerBlock, 'Производитель') || 
                        extractTag(offerBlock, 'ТорговаяМарка') || 
                        'Без бренда';
      
      pendingProducts.push({ name, brandName });
      
      // Обрабатываем пакет
      if (pendingProducts.length >= batchSize * 2) {
        processBatch();
      }
    }
  });
  
  readStream.on('end', async () => {
    // Последний пакет
    await processBatch();
    
    console.log('\n✅ Импорт завершён!');
    console.log('\n📊 Статистика:');
    console.log(`   Всего: ${stats.total}`);
    console.log(`   Добавлено: ${stats.success}`);
    console.log(`   Пропущено: ${stats.skipped}`);
    console.log(`   Ошибок: ${stats.errors}`);
    console.log(`   Брендов создано: ${stats.brandsCreated}`);
    console.log(`   Брендов найдено: ${stats.brandsFound}`);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱  Время: ${elapsed}с`);
    
    await prisma.$disconnect();
    process.exit(0);
  });
  
  readStream.on('error', async (err) => {
    console.error('❌ Ошибка:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  });
}

main().catch(async (err) => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
