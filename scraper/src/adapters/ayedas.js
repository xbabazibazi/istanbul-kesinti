import { readFile } from "node:fs/promises";
import { Adapter } from "./base.js";
import { ilceAnahtari, istanbulIso } from "../normalize.js";

// AYEDAŞ = İstanbul Anadolu yakası. GERÇEK uç henüz keşfedilmedi (BEDAŞ gibi
// F12 → Network ile bul). Şimdilik mock; şema BEDAŞ ile aynı hizaya çekildi.
const RAW_ENDPOINT = process.env.AYEDAS_ENDPOINT || null;
const KAYNAK_URL = "https://www.ayedas.com.tr/kesinti-sorgulama";

export class AyedasAdapter extends Adapter {
  get saglayici() {
    return "AYEDAŞ";
  }

  async fetchRaw() {
    if (process.env.USE_MOCK || !RAW_ENDPOINT) {
      const buf = await readFile(new URL("../../mock/ayedas.raw.json", import.meta.url));
      return JSON.parse(buf.toString());
    }
    const res = await fetch(RAW_ENDPOINT, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`AYEDAŞ ${res.status}`);
    return res.json();
  }

  parse(raw) {
    const dizi = raw?.data ?? [];
    return dizi.map((r) => {
      const ilce = r.town || "";
      return {
        id: `AYEDAŞ:${r.id}`,
        hizmet: "elektrik",
        saglayici: "AYEDAŞ",
        il: "İstanbul",
        ilce,
        ilceKey: ilceAnahtari(ilce),
        mahalle: r.district || "",
        baslangic: istanbulIso(r.start),
        bitis: istanbulIso(r.end),
        sebep: r.reason || "Planlı bakım",
        message: r.message || "",
        lat: r.lat,
        lng: r.lng,
        kaynakUrl: KAYNAK_URL,
        cekilmeZamani: new Date().toISOString(),
      };
    });
  }
}
