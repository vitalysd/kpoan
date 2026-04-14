import XLSX from "xlsx";

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\01-01-~1.XLS";

const wb = XLSX.readFile(EXCEL_PATH);
console.log("Листы:", wb.SheetNames);

// Проверяем все листы
for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  console.log(`\n=== Лист: ${sheetName} ===`);
  console.log(`Всего строк: ${data.length}`);
  console.log("\nПервые 10 строк:");
  for (let i = 0; i < 10 && i < data.length; i++) {
    console.log(`[${i}]`, JSON.stringify(data[i]));
  }
}
