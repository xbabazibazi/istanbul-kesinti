// Çalışma geçmişi — dashboard'un "bağlantı kontrolü / veri geliş gidişi"
// panelini beslemek için son N çalışmanın özetini diskte tutar.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DOSYA = fileURLToPath(new URL("../data/gecmis.json", import.meta.url));
const MAX_KAYIT = 200;

export async function gecmisOku() {
  try {
    return JSON.parse((await readFile(DOSYA)).toString());
  } catch {
    return [];
  }
}

export async function gecmiseEkle(sonuc) {
  const mevcut = await gecmisOku();
  const yeni = [sonuc, ...mevcut].slice(0, MAX_KAYIT);
  await mkdir(dirname(DOSYA), { recursive: true });
  await writeFile(DOSYA, JSON.stringify(yeni, null, 2));
  return yeni;
}
