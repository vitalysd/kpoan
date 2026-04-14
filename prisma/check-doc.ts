import fs from "fs";

const DOC_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\-1871B~1.DOC";

const buffer = fs.readFileSync(DOC_PATH);
console.log(`Размер файла: ${buffer.length} байт`);

// Простой парсер OLE2 + Word .doc
// .doc файлы хранят текст в кодировке UTF-16LE (2 байта на символ)

// Пропускаем заголовок OLE2 (512 байт) и ищем текст
// WordDocument stream обычно содержит текст в UTF-16LE

function extractTextFromDoc(buffer: Buffer): string {
  let text = "";
  let currentWord = "";
  
  // Ищем последовательности UTF-16LE символов
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
    if (charCode === 7) { // Bell - часто конец абзаца в .doc
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

const extractedText = extractTextFromDoc(buffer);

// Очистим результат: уберём дубликаты и пустые строки
const lines = extractedText.split("\n")
  .map(l => l.replace(/\s+/g, " ").trim())
  .filter(l => l.length > 2);

// Уберём дубликаты подряд
const uniqueLines: string[] = [];
let prev = "";
for (const line of lines) {
  if (line !== prev) {
    uniqueLines.push(line);
    prev = line;
  }
}

console.log("\n=== ИЗВЛЕЧЁННЫЙ ТЕКСТ ===\n");
console.log(uniqueLines.join("\n").substring(0, 10000));
