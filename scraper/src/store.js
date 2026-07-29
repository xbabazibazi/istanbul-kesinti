// Depolama SOYUTLAMASI. v1'de tek JSON dosyası; üretimde tek satır değişiklikle
// Firestore'a geçersin. Uygulama bu katmanı hiç bilmez, sadece API'yi görür.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DOSYA = fileURLToPath(new URL("../data/kesintiler.json", import.meta.url));

export async function oku() {
  try {
    return JSON.parse((await readFile(DOSYA)).toString());
  } catch {
    return { kesintiler: [], guncelleme: null };
  }
}

export async function yaz(kesintiler) {
  await mkdir(dirname(DOSYA), { recursive: true });
  await writeFile(
    DOSYA,
    JSON.stringify({ kesintiler, guncelleme: new Date().toISOString() }, null, 2)
  );
}

// Mevcut kayıtlarla karşılaştır; yalnızca YENİ id'leri döndür (bildirim için).
export function yeniOlanlar(oncekiler, simdikiler) {
  const eski = new Set(oncekiler.map((k) => k.id));
  return simdikiler.filter((k) => !eski.has(k.id));
}
