import {
  BatteryCharging,
  Box,
  Drill,
  Gauge,
  HardHat,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIconsBySlug: Record<string, LucideIcon> = {
  "abrazivnye-materialy": Gauge,
  "benzoinstrument-sadovaya-tekhnika": Drill,
  "dorozhnoe-i-garazhnoe-oborudovanie": Settings,
  "izmeritelnyj-instrument": Gauge,
  "kompressory-pnevmoinstrument-rashodniki": Settings,
  "lestnicy-lesa-vyshki": HardHat,
  "metallicheskaya-mebel": ShieldCheck,
  "nasosy-i-nasosnye-stancii": BatteryCharging,
  "pusko-zaryadnye-ustrojstva": BatteryCharging,
  "promyshlennoe-oborudovanie": Settings,
  radiostancii: Box,
  "rashodnye-materialy-dlya-elektroinstrumenta": Drill,
};

export const getCategoryIcon = (slug: string): LucideIcon =>
  categoryIconsBySlug[slug] ?? Settings;
