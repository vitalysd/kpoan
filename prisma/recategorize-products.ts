import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Rule = {
  slug: string;
  patterns: string[];
};

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string;
  category: { slug: string; name: string };
  brand: { name: string };
};

const rules: Rule[] = [
  {
    slug: "skladskoe-i-gruzopodemnoe-oborudovanie",
    patterns: [
      "штабелер",
      "штабелёр",
      "штабел",
      "ричтрак",
      "рохл",
      "таль",
      "тельфер",
      "лебедк",
      "строп",
      "грузопод",
      "захват",
      "погрузчик",
      "паллет",
      "вилочн",
      "кранов",
      "кран-балк",
      "тележк",
      "такел",
      "коуш",
      "талреп",
      "зажим трос",
      "карабин",
      "канат",
      "трос",
      "вертлюг",
      "ролик подв",
      "для штабел",
      "для тележ",
      "для ричтрак",
    ],
  },
  {
    slug: "dorozhnoe-i-garazhnoe-oborudovanie",
    patterns: [
      "домкрат",
      "подкатн",
      "трансмиссион",
      "буксировоч",
      "шиномонтаж",
      "балансиров",
      "автомобильн",
      "гараж",
      "стойка для авто",
      "кран гараж",
      "пресс гидравлич",
      "съемник",
      "съёмник",
    ],
  },
  {
    slug: "pusko-zaryadnye-ustrojstva",
    patterns: [
      "пуско-заряд",
      "пускозаряд",
      "зарядное устр",
      "зарядный устр",
      "бустер",
      "пзу",
      "зарядное",
    ],
  },
  {
    slug: "uborochnaya-tekhnika",
    patterns: [
      "пылесос",
      "пылесбор",
      "поломоеч",
      "подметал",
      "мойк",
      "убороч",
      "для dvc",
      "для dcl",
      "для drc",
      "для машины поломоеч",
      "для машины подметал",
    ],
  },
  {
    slug: "teplovoe-oborudovanie",
    patterns: [
      "теплов",
      "обогреват",
      "конвектор",
      "калорифер",
      "инфракрасн",
      "тепловентилятор",
    ],
  },
  {
    slug: "nasosy-i-nasosnye-stancii",
    patterns: [
      "насос",
      "насосн",
      "мотопомп",
      "гидроаккумулятор",
      "дренажн",
      "скважин",
      "циркуляцион",
    ],
  },
  {
    slug: "benzoinstrument-sadovaya-tekhnika",
    patterns: [
      "бензопил",
      "бензокос",
      "бензотриммер",
      "газонокос",
      "кусторез",
      "садов",
      "воздуходув",
      "опрыскивател",
      "мотобур",
      "культиватор",
      "триммер",
      "цепная пила",
      "цепной пила",
    ],
  },
  {
    slug: "radiostancii",
    patterns: [
      "радиостанц",
      "walkie",
      "антенна для радиостан",
    ],
  },
  {
    slug: "izmeritelnyj-instrument",
    patterns: [
      "рулетк",
      "уровн",
      "нивелир",
      "дальномер",
      "лазерн",
      "штангенциркул",
      "микрометр",
      "угломер",
      "линейк",
      "индикатор",
    ],
  },
  {
    slug: "lestnicy-lesa-vyshki",
    patterns: [
      "лестниц",
      "стремянк",
      "вышк",
      "тура",
      "подмост",
      "строительн лес",
    ],
  },
  {
    slug: "metallicheskaya-mebel",
    patterns: [
      "верстак",
      "шкаф",
      "тумба",
      "стеллаж",
      "тележка инструмент",
      "ящик для инструмент",
      "сейф",
    ],
  },
  {
    slug: "hozyajstvennyj-inventar",
    patterns: [
      "лопат",
      "метл",
      "швабр",
      "ведр",
      "совок",
      "грабл",
      "тяпк",
    ],
  },
  {
    slug: "elektrotekhnicheskie-izdeliya",
    patterns: [
      "розетк",
      "выключател",
      "удлинител",
      "кабел",
      "провод",
      "автоматический выключател",
      "щиток",
      "светильник",
      "ламп",
    ],
  },
  {
    slug: "svarochnoe-oborudovanie-i-komplektuyushchie",
    patterns: [
      "свар",
      "электрод",
      "горелк",
      "инвертор",
      "полуавтомат",
      "редуктор газ",
      "плазморез",
      "резак",
      "маска свар",
      "проволока свар",
      "клемма масс",
      "кабель свар",
      "аргон",
    ],
  },
  {
    slug: "kompressory-pnevmoinstrument-rashodniki",
    patterns: [
      "компрессор",
      "пневм",
      "краскопульт",
      "бетонолом",
      "отбойн",
      "молоток пневм",
      "нейлер",
      "степлер",
      "лубрикатор",
      "фитинг",
      "продувоч",
      "шлифмашинка цангов",
      "дрель реверсивн",
      "шуруповерт 9030",
      "шуруповерт 9540",
      "резьбонарезн",
    ],
  },
  {
    slug: "elektroinstrument",
    patterns: [
      "шуруповерт",
      "дрел",
      "перфоратор",
      "лобзик",
      "рубанок",
      "фрезер",
      "реноватор",
      "штроборез",
      "миксер",
      "сабельная пила",
      "сабельной пила",
      "дисковая пила",
      "дисковой пила",
      "циркулярн",
      "ушм",
      "угловая шлифмашин",
      "угловой шлифмашин",
      "гайковерт",
      "электроножниц",
      "отрезная машин",
      "отрезной машин",
    ],
  },
  {
    slug: "abrazivnye-materialy",
    patterns: [
      "абразив",
      "круг отрезн",
      "круг шлиф",
      "круг лепестк",
      "диск отрезн",
      "диск зачист",
      "лента шлиф",
      "шлифовальн лент",
      "алмазн диск",
    ],
  },
  {
    slug: "rashodnye-materialy-dlya-elektroinstrumenta",
    patterns: [
      "сверл",
      " бур ",
      "бита",
      "битодерж",
      "коронк",
      "полотн",
      "пильн диск",
      "зубил",
      "долот",
      "фреза",
      "фрезы",
      "насадк",
      "оснастк",
      "щетка чаш",
      "шлифлист",
      "пика",
    ],
  },
  {
    slug: "ruchnoj-slesarnyj-instrument",
    patterns: [
      " ключ ",
      "ключ гаеч",
      "отвертк",
      "пассатиж",
      "плоскогубц",
      "кусачк",
      "ножовк",
      "молоток",
      "напильник",
      "зубило",
      "струбцин",
      "тиски",
    ],
  },
  {
    slug: "stroitelnoe-oborudovanie-i-materialy",
    patterns: [
      "арматур",
      "бетон",
      "виброплит",
      "вибротрамб",
      "вибратор",
      "бадья",
      "бетономешал",
      "тачка стро",
      "кельм",
      "шпател",
      "правило",
      "болт мебельн",
      "болт к.п.",
      "болт полн.резьба",
      "шпилька резьб",
      "анкер",
      "дюбел",
      "шуруп",
      "саморез",
      "гвозд",
      "заклеп",
      "крепеж",
      "din",
      "гост",
      "метиз",
      "оц.",
      "оцинк",
      "к.п.",
      "белзан",
      "речмз",
    ],
  },
];

function normalize(text: string): string {
  return text
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/ё/gi, "е")
    .toLowerCase();
}

function classifyProduct(product: ProductRow): string {
  const haystack = ` ${normalize(`${product.name} ${product.sku ?? ""} ${product.brand.name}`)} `;

  let bestSlug: string | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (haystack.includes(pattern)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestSlug = rule.slug;
    }
  }

  if (bestSlug) {
    return bestSlug;
  }

  if (
    product.category.slug !== "promyshlennoe-oborudovanie" &&
    product.category.slug !== "svarochnoe-oborudovanie-i-komplektuyushchie"
  ) {
    return product.category.slug;
  }

  return "promyshlennoe-oborudovanie";
}

async function main() {
  const apply = process.argv.includes("--apply");
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true },
  });

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      category: { select: { slug: true, name: true } },
      brand: { select: { name: true } },
    },
  });

  const distribution = new Map<string, number>();
  const updatesByCategory = new Map<string, string[]>();
  const samplesByCategory = new Map<string, string[]>();
  let unchanged = 0;

  for (const product of products) {
    const targetSlug = classifyProduct(product);
    distribution.set(targetSlug, (distribution.get(targetSlug) ?? 0) + 1);

    if (!samplesByCategory.has(targetSlug)) {
      samplesByCategory.set(targetSlug, []);
    }

    const sampleBucket = samplesByCategory.get(targetSlug)!;
    if (sampleBucket.length < 5) {
      sampleBucket.push(product.name);
    }

    if (product.category.slug === targetSlug) {
      unchanged += 1;
      continue;
    }

    if (!updatesByCategory.has(targetSlug)) {
      updatesByCategory.set(targetSlug, []);
    }

    updatesByCategory.get(targetSlug)!.push(product.id);
  }

  const summary = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      count: distribution.get(category.slug) ?? 0,
      sample: samplesByCategory.get(category.slug) ?? [],
    }))
    .sort((a, b) => b.count - a.count);

  console.log(`Всего товаров: ${products.length}`);
  console.log(`Без изменений: ${unchanged}`);
  console.log(`К изменению: ${products.length - unchanged}`);
  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log("\nDry run завершён. Для записи в БД запустите с --apply");
    return;
  }

  for (const [targetSlug, productIds] of updatesByCategory) {
    const category = categoryBySlug.get(targetSlug);

    if (!category) {
      throw new Error(`Категория ${targetSlug} не найдена в БД`);
    }

    for (let index = 0; index < productIds.length; index += 500) {
      const chunk = productIds.slice(index, index + 500);
      await prisma.product.updateMany({
        where: { id: { in: chunk } },
        data: { categoryId: category.id },
      });
    }
  }

  console.log("\nПерекатегоризация завершена.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
