// Veri kapısı: bir ilçe için yaklaşan kesintiler.
import { MOCK_KESINTILER } from "./mock.js";
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || null;

export async function kesintileriGetir(ilceKey) {
  let hepsi;
  if (API_BASE) {
    const res = await fetch(API_BASE, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("Veri alınamadı (" + res.status + ")");
    hepsi = (await res.json()).kesintiler ?? [];
  } else {
    hepsi = MOCK_KESINTILER;
  }
  return hepsi
    .filter((k) => k.ilceKey === ilceKey)
    .sort((a, b) => Date.parse(a.baslangic) - Date.parse(b.baslangic));
}
