import {
  BatteryCharging,
  Box,
  Drill,
  Gauge,
  Flame,
  Hammer,
  HardHat,
  KeyRound,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIconsBySlug: Record<string, LucideIcon> = {
  "abrazivnye-materialy": Gauge,
  "benzoinstrument-sadovaya-tekhnika": Drill,
  "dorozhnoe-i-garazhnoe-oborudovanie": Settings,
  "elektroinstrument": Drill,
  "elektrotekhnicheskie-izdeliya": BatteryCharging,
  "hozyajstvennyj-inventar": HardHat,
  "izmeritelnyj-instrument": Gauge,
  "kompressory-pnevmoinstrument-rashodniki": Settings,
  "lestnicy-lesa-vyshki": HardHat,
  "metallicheskaya-mebel": ShieldCheck,
  "nasosy-i-nasosnye-stancii": BatteryCharging,
  "promyshlennoe-oborudovanie": Settings,
  vibrooborudovanie: Settings,
  "gazosvarochnoe-oborudovanie": Flame,
  "zamki-i-furnitura": KeyRound,
  "pusko-zaryadnye-ustrojstva": BatteryCharging,
  radiostancii: Box,
  "rashodnye-materialy-dlya-elektroinstrumenta": Drill,
  "ruchnoj-slesarnyj-instrument": Hammer,
  "skladskoe-i-gruzopodemnoe-oborudovanie": ShieldCheck,
  "stroitelnoe-oborudovanie-i-materialy": ShieldCheck,
  "svarochnoe-oborudovanie-i-komplektuyushchie": Settings,
  "teplovoe-oborudovanie": BatteryCharging,
  "uborochnaya-tekhnika": Drill,
};

export const getCategoryIcon = (slug: string): LucideIcon =>
  categoryIconsBySlug[slug] ?? Settings;
