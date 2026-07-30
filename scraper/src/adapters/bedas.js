import { readFile } from "node:fs/promises";
import { Adapter } from "./base.js";
import { ilceAnahtari, mahallelerAyikla, istanbulIso } from "../normalize.js";

// BEDAŞ = İstanbul Avrupa yakası. Keşfedilen uç:
//   POST https://www.bedas.com.tr/elektrik-getir
//   Gövde: form-urlencoded { countryName: "İSTANBUL", cityName: "<İLÇE>" } — İLÇE BAZINDA sorgulanıyor.
//   ÖNEMLİ: Boş/joker gövde ("{}") HİÇBİR ZAMAN tüm listeyi döndürmüyor — sadece [] veriyor.
//   Bu yanıltıcı bir "başarı" gibi görünüyordu (0 kayıt = "kesinti yok" sanılıyordu), gerçekte
//   yanlış istekti. Siteye ait select#city-items'daki TAM metinlerle sorgulanmalı.
//   Form-urlencoded gövdeyi düz sunucudan (tarayıcı olmadan) atmak WAF'a takılıyordu; sebep
//   eksik Origin/Referer/Sec-Fetch-* header'larıydı (çerez/oturum gerekmiyor, cookie yok).
const RAW_ENDPOINT = process.env.BEDAS_ENDPOINT || "https://www.bedas.com.tr/elektrik-getir";
const KAYNAK_URL = "https://www.bedas.com.tr/elektrik-kesintisi-sorgulama";

// BEDAŞ'ın kendi il çe seçicisindeki TAM metinler (Avrupa yakası, 25 ilçe).
const BEDAS_ILCELERI = [
  "ARNAVUTKÖY", "AVCILAR", "BAĞCILAR", "BAHÇELİEVLER", "BAKIRKÖY", "BAŞAKŞEHİR",
  "BAYRAMPAŞA", "BEŞİKTAŞ", "BEYLİKDÜZÜ", "BEYOĞLU", "BÜYÜKÇEKMECE", "ÇATALCA",
  "ESENLER", "ESENYURT", "EYÜPSULTAN", "FATİH", "GAZİOSMANPAŞA", "GÜNGÖREN",
  "KAĞITHANE", "KÜÇÜKÇEKMECE", "SARIYER", "SİLİVRİ", "ŞİŞLİ", "SULTANGAZİ", "ZEYTİNBURNU",
];

async function ilceyiCek(ilce) {
  const body = new URLSearchParams({ countryName: "İSTANBUL", cityName: ilce }).toString();
  const res = await fetch(RAW_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      accept: "*/*",
      origin: "https://www.bedas.com.tr",
      referer: KAYNAK_URL,
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "x-requested-with": "XMLHttpRequest",
    },
    body,
  });
  if (!res.ok) throw new Error(`${ilce} ${res.status}`);
  const dizi = await res.json();
  return Array.isArray(dizi) ? dizi : [];
}

export class BedasAdapter extends Adapter {
  get saglayici() {
    return "BEDAŞ";
  }

  async fetchRaw() {
    if (process.env.USE_MOCK) {
      const buf = await readFile(new URL("../../mock/bedas.raw.json", import.meta.url));
      return JSON.parse(buf.toString());
    }
    const hepsi = [];
    for (const ilce of BEDAS_ILCELERI) {
      try {
        hepsi.push(...(await ilceyiCek(ilce)));
      } catch (err) {
        // Bir ilçe patlarsa diğerleri devam etsin; toplu hata index.js'te zaten yakalanıyor.
        console.error(`[ALARM] BEDAŞ ${ilce} çekilemedi: ${err.message}`);
      }
    }
    return hepsi;
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
