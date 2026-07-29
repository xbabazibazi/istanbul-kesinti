// Ad normalizasyonu. BEDAŞ temiz "mahalle" alanı vermiyor; ilçe (county) temiz.
// Mahalle bilgisi message metninde gömülü, o yüzden ayrı bir ayıklayıcı var.

const TR_MAP = { Ç: "C", Ğ: "G", İ: "I", I: "I", Ö: "O", Ş: "S", Ü: "U", Â: "A", Î: "I", Û: "U" };

export function anahtar(ad) {
  if (!ad) return "";
  let s = ad.toLocaleUpperCase("tr-TR");
  s = s.replace(/[ÇĞİIÖŞÜÂÎÛ]/g, (ch) => TR_MAP[ch] ?? ch);
  s = s.replace(/\bMAHALLES[İI]\b/g, " ").replace(/\bMAH\.?\b/g, " ");
  s = s.replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return s;
}
export const ilceAnahtari = anahtar;
export const mahalleAnahtari = anahtar;

// message içinden mahalle adlarını çıkar (en iyi çaba, görüntüleme için).
// Örn: "... ilce MERKEZ-ZAFER mah DUMLUPINAR sk / ZAFER mah ... sk bölgelerinde ..."
//   -> ["MERKEZ-ZAFER", "ZAFER"]
export function mahallelerAyikla(message) {
  if (!message) return [];
  let bolge = message.split(/bölgelerinde/i)[0] || "";
  bolge = bolge.replace(/^.*?\bilce\b\s*/i, ""); // baştaki "İL İLÇE ilce " kısmını at
  const set = new Set();
  for (const parca of bolge.split("/")) {
    const m = parca.match(/(.+?)\s+mah\b/i);
    if (m) set.add(m[1].trim());
  }
  return [...set];
}

// "2026-07-29 09:00:00" (saat dilimsiz) -> ISO, İstanbul +03:00
export function istanbulIso(s) {
  if (!s) return s;
  return s.trim().replace(" ", "T") + "+03:00";
}
