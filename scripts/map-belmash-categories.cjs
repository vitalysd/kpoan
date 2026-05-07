/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL, PRISMA_DATABASE_URL or POSTGRES_URL is required.");
}

process.env.DATABASE_URL ??= databaseUrl;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

const targetByImportedCategorySlug = {
  "tovary-dlya-sada-i-ogoroda-drovokoly": "benzoinstrument-sadovaya-tekhnika",
  "elektroinstrument-frezery": "elektroinstrument",
  "stanochnoe-oborudovanie-elektrorubanki": "elektroinstrument",

  "rashodnye-materialy-zatochnye-diski": "abrazivnye-materialy",
  "rashodnye-materialy-shlifovalnye-vtulki": "abrazivnye-materialy",
  "rashodnye-materialy-shlifovalnye-diski": "abrazivnye-materialy",
  "rashodnye-materialy-shlifovalnye-lenty": "abrazivnye-materialy",
  "rashodnye-materialy-schetki-dlya-brashirovalnogo-ustroystva-wb-150": "abrazivnye-materialy",

  "rashodnye-materialy-diskovye-frezy": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-perehodnye-kolca": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-pilnye-diski": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-pilnye-polotna": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-rezbovye-vtulki": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-remni": "rashodnye-materialy-dlya-elektroinstrumenta",
  "rashodnye-materialy-strogalnye-nozhi": "rashodnye-materialy-dlya-elektroinstrumenta",
};

const defaultTargetSlug = "promyshlennoe-oborudovanie";

async function main() {
  const belmashBrand = await prisma.brand.findUnique({
    where: { slug: "belmash" },
    select: { id: true },
  });

  if (!belmashBrand) {
    console.log("BELMASH brand not found. Nothing to map.");
    return;
  }

  const importedCategories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          brandId: belmashBrand.id,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const targetSlugs = new Set([
    defaultTargetSlug,
    ...Object.values(targetByImportedCategorySlug),
  ]);

  const targetCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: [...targetSlugs],
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  const targetsBySlug = new Map(targetCategories.map((category) => [category.slug, category]));
  const missingTargets = [...targetSlugs].filter((slug) => !targetsBySlug.has(slug));
  if (missingTargets.length > 0) {
    throw new Error(`Missing target categories: ${missingTargets.join(", ")}`);
  }

  const operations = importedCategories
    .filter((category) => !targetSlugs.has(category.slug))
    .map((category) => {
      const targetSlug = targetByImportedCategorySlug[category.slug] ?? defaultTargetSlug;
      const target = targetsBySlug.get(targetSlug);
      return {
        source: category,
        target,
      };
    });

  const grouped = new Map();
  for (const operation of operations) {
    const key = operation.target.slug;
    const current = grouped.get(key) ?? {
      target: operation.target,
      productCount: 0,
      sourceCategories: [],
    };
    current.productCount += operation.source._count.products;
    current.sourceCategories.push(operation.source.slug);
    grouped.set(key, current);
  }

  console.log(
    JSON.stringify(
      [...grouped.values()].map((group) => ({
        target: `${group.target.name} (${group.target.slug})`,
        productCount: group.productCount,
        sourceCategoryCount: group.sourceCategories.length,
      })),
      null,
      2,
    ),
  );

  if (isDryRun) return;

  for (const operation of operations) {
    await prisma.product.updateMany({
      where: {
        brandId: belmashBrand.id,
        categoryId: operation.source.id,
      },
      data: {
        categoryId: operation.target.id,
      },
    });
  }

  const staleCategoryIds = operations.map((operation) => operation.source.id);
  const deleteResult = await prisma.category.deleteMany({
    where: {
      id: {
        in: staleCategoryIds,
      },
      products: {
        none: {},
      },
    },
  });

  const remainingBelmashCategories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          brandId: belmashBrand.id,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  console.log(`Deleted ${deleteResult.count} empty imported categories.`);
  console.log("Remaining BELMASH categories:");
  console.log(JSON.stringify(remainingBelmashCategories, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
