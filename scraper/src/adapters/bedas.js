import { readFile } from "node:fs/promises";
import { Adapter } from "./base.js";
import { ilceAnahtari, mahallelerAyikla, istanbulIso } from "../normalize.js";

// BEDAŞ = İstanbul Avrupa yakası. Keşfedilen uç:
//   POST https://www.bedas.com.tr/elektrik-getir
// Yanıt: [{ ..., plannedOutage: { reason, city, county, startDateTime,
//   endDateTime, message, lat, lon } }, ...]  (tüm İstanbul listesi döner)

const RAW_ENDPOINT = process.env.BEDAS_ENDPOINT || "https://www.bedas.com.tr/elektrik-getir";
const KAYNAK_URL = "https://www.bedas.com.tr/elektrik-kesintisi-sorgulama";

// ⚠️ POST gövdesi boş string olunca WAF isteği reddediyor ("Request Rejected").
// "{}" gönderince geçiyor ve tüm listeyi döndürüyor — doğrulanmış (bkz. proje notları).
const POST_BODY = process.env.BEDAS_BODY || "{}";

export class BedasAdapter extends Adapter {
  get saglayici() {
    return "BEDAŞ";
  }

  async fetchRaw() {
    if (process.env.USE_MOCK) {
      const buf = await readFile(new URL("../../mock/bedas.raw.json", import.meta.url));
      return JSON.parse(buf.toString());
    }
    const res = await fetch(RAW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: POST_BODY || undefined,
    });
    if (!res.ok) throw new Error(`BEDAŞ ${res.status}`);
    return res.json();
  }

  parse(raw) {
    const dizi = Array.isArray(raw) ? raw : raw?.value ?? raw?.items ?? raw?.data ?? [];
    return dizi
      .map((kayit) => {
        const p = kayit.plannedOutage ?? kayit;
        if (!p) return null;
        const ilce = p.county || "";
        const mahalleler = mahallelerAyikla(p.message);
        return {
          id: `BEDAŞ:${p.id ?? kayit.id}`,
          hizmet: "elektrik",
          saglayici: "BEDAŞ",
          il: "İstanbul",
          ilce,
          ilceKey: ilceAnahtari(ilce),
          mahalle: mahalleler.join(", "),
          baslangic: istanbulIso(p.startDateTime),
          bitis: istanbulIso(p.endDateTime),
          sebep: p.reason || "Planlı bakım",
          message: p.message || "",
          lat: p.lat != null ? parseFloat(String(p.lat).trim()) : undefined,
          lng: p.lon != null ? parseFloat(String(p.lon).trim()) : undefined,
          kaynakUrl: KAYNAK_URL,
          cekilmeZamani: new Date().toISOString(),
        };
      })
      .filter(Boolean);
  }
}
