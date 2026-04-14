import fs from "fs";

const XML_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\YANDEX~1.XML";
const content = fs.readFileSync(XML_PATH, "utf-8");

// Найдём секцию offers (товары)
const offersStart = content.indexOf("<offers>");
const offersEnd = content.indexOf("</offers>");

if (offersStart !== -1 && offersEnd !== -1) {
  // Выведем первые 5000 символов offers
  console.log(content.substring(offersStart, offersStart + 5000));
  console.log("\n\n... (ещё часть) ...\n");
  // Также посмотрим середину
  const mid = Math.floor((offersStart + offersEnd) / 2);
  console.log(content.substring(mid, mid + 3000));
} else {
  console.log("Секция offers не найдена");
  console.log("Размер файла:", content.length);
}
