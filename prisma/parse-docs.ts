import fs from "fs";

function extractTextFromDoc(buffer: Buffer): string {
  let text = "";
  let currentWord = "";
  
  for (let i = 512; i < buffer.length - 1; i += 2) {
    const charCode = buffer.readUInt16LE(i);
    
    if (charCode === 0) continue;
    if (charCode === 13 || charCode === 10) {
      if (currentWord.length > 1) {
        text += currentWord + "\n";
      }
      currentWord = "";
      continue;
    }
    if (charCode === 7) {
      if (currentWord.length > 1) {
        text += currentWord + "\n";
      }
      currentWord = "";
      continue;
    }
    if (charCode === 32) {
      currentWord += " ";
      continue;
    }
    if (charCode >= 32 && charCode < 65536 && charCode !== 0xFFFF) {
      currentWord += String.fromCharCode(charCode);
    }
  }
  
  if (currentWord.length > 1) {
    text += currentWord;
  }
  
  return text;
}

function parseDocProducts(buffer: Buffer): { category: string; products: string[] }[] {
  const text = extractTextFromDoc(buffer);
  
  const lines = text.split("\n")
    .map(l => l.replace(/\s+/g, " ").trim())
    .filter(l => l.length > 3);

  // Уберём дубликаты подряд
  const uniqueLines: string[] = [];
  let prev = "";
  for (const line of lines) {
    if (line !== prev) {
      uniqueLines.push(line);
      prev = line;
    }
  }

  // Парсим структуру: Раздел X.X ... = категория, остальное = товары
  const sections: { category: string; products: string[] }[] = [];
  let currentSection: { category: string; products: string[] } | null = null;
  let inHeader = true;

  for (const line of uniqueLines) {
    // Пропускаем заголовки
    if (line === "Наименование товара, его характеристики") {
      inHeader = false;
      continue;
    }
    if (line.startsWith("Раздел") && /\d+\.\d+/.test(line)) {
      // Новая секция
      if (currentSection && currentSection.products.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { category: line, products: [] };
      inHeader = false;
      continue;
    }

    // Пропускаем мусор и служебные строки
    if (
      line.length < 5 ||
      line.includes("Normal") ||
      line.includes("Heading") ||
      line.includes("Times New Roman") ||
      line.includes("Arial") ||
      line.includes("Symbol") ||
      line.startsWith("Table") ||
      line.startsWith("CompObj")
    ) {
      continue;
    }

    // Это товар, если мы внутри секции
    if (currentSection && !inHeader) {
      currentSection.products.push(line);
    }
  }

  // Добавляем последнюю секцию
  if (currentSection && currentSection.products.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

// Парсим все 4 файла
const FILES = [
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-1871B~1.DOC", name: "перечень продукции -1" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-24882~1.DOC", name: "перечень продукции-2" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-3CBCB~1.DOC", name: "перечень продукции-3" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-4AD1A~1.DOC", name: "перечень продукции-4" },
];

console.log("=== Парсинг .doc файлов ===\n");

let totalProducts = 0;
let totalSections = 0;

for (const file of FILES) {
  try {
    const buffer = fs.readFileSync(file.path);
    const sections = parseDocProducts(buffer);

    console.log(`📄 ${file.name}:`);
    for (const section of sections) {
      console.log(`  📁 ${section.category} (${section.products.length} товаров)`);
      // Покажем первые 2 товара
      for (const product of section.products.slice(0, 3)) {
        console.log(`    • ${product}`);
      }
      if (section.products.length > 3) {
        console.log(`    ... и ещё ${section.products.length - 3}`);
      }
    }

    // Если товаров мало, покажем все строки для отладки
    if (sections.length === 0) {
      const text = extractTextFromDoc(buffer);
      const allLines = text.split("\n")
        .map(l => l.replace(/\s+/g, " ").trim())
        .filter(l => l.length > 3)
        .slice(0, 30);
      console.log("  (нет секций, первые строки):");
      for (const line of allLines) {
        console.log(`    ${line}`);
      }
    }

    console.log("");

    totalSections += sections.length;
    totalProducts += sections.reduce((sum, s) => sum + s.products.length, 0);
  } catch (e: any) {
    console.log(`📄 ${file.name}: ОШИБКА — ${e.message}\n`);
  }
}

console.log(`\n=== ИТОГО ===`);
console.log(`Секций: ${totalSections}`);
console.log(`Товаров: ${totalProducts}`);
