// Depolama SOYUTLAMASI. v1'de tek JSON dosyası; üretimde tek satır değişiklikle
// Firestore'a geçersin. Uygulama bu katmanı hiç bilmez, sadece API'yi görür.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DOSYA = fileURLToPath(new URL("../data/kesintiler.json", import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jihjwemjqgrysbinskun.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "";
const BUCKET = "veri";
const DOSYA_ADI = "kesintiler.json";

export async function oku() {
  try {
    return JSON.parse((await readFile(DOSYA)).toString());
  } catch {
    return { kesintiler: [], guncelleme: null };
  }
}

export async function yaz(kesintiler) {
  const veri = { kesintiler, guncelleme: new Date().toISOString() };
  await mkdir(dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(veri, null, 2));
  await depoyaYukle(veri);
}

// raw.githubusercontent.com üretim trafiğinde IP başına rate-limit'e (429)
// takılıyordu; uygulama artık veriyi buradan okuyor. SUPABASE_SECRET_KEY yoksa
// (örn. yerel spare PC'de) sessizce atlanır, GitHub Actions'ta zaten tanımlı.
export async function depoyaYukle(veri) {
  if (!SUPABASE_SECRET_KEY) {
    console.log("[depo] SUPABASE_SECRET_KEY yok, Supabase Storage'a yüklenmedi");
    return false;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${DOSYA_ADI}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
          "content-type": "application/json",
          "x-upsert": "true",
        },
        body: JSON.stringify(veri),
      }
    );
    if (!res.ok) {
      console.error(`[depo] Supabase Storage yükleme hatası: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[depo] Supabase Storage yükleme hatası: ${err.message}`);
    return false;
  }
}

// Mevcut kayıtlarla karşılaştır; yalnızca YENİ id'leri döndür (bildirim için).
export function yeniOlanlar(oncekiler, simdikiler) {
  const eski = new Set(oncekiler.map((k) => k.id));
  return simdikiler.filter((k) => !eski.has(k.id));
}
