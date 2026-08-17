// Veri kapısı: bir ilçe için yaklaşan kesintiler.
import { MOCK_KESINTILER } from "./mock.js";
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || null;
// raw.githubusercontent.com üretim trafiğinde IP başına rate-limit'e (429)
// takıldığı için birincil kaynak Supabase Storage'a taşındı; bu sadece yedek.
const API_YEDEK = process.env.EXPO_PUBLIC_API_YEDEK || null;

async function veriGetir(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error("Veri alınamadı (" + res.status + ")");
  return (await res.json()).kesintiler ?? [];
}

export async function kesintileriGetir(ilceKey) {
  let hepsi;
  if (API_BASE) {
    try {
      hepsi = await veriGetir(API_BASE);
    } catch (err) {
      if (!API_YEDEK) throw err;
      hepsi = await veriGetir(API_YEDEK);
    }
  } else {
    hepsi = MOCK_KESINTILER;
  }
  return hepsi
    .filter((k) => k.ilceKey === ilceKey)
    .sort((a, b) => Date.parse(a.baslangic) - Date.parse(b.baslangic));
}
