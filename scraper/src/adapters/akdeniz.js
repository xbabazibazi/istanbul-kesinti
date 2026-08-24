import { Adapter } from "./base.js";
import { ilceAnahtari } from "../normalize.js";

// AEDAŞ = Akdeniz Elektrik Dağıtım (Antalya, Burdur, Isparta). Keşfedilen uç
// (BEDAŞ'takine benzer şekilde, sitenin kendi JS bundle'ından çıkarıldı):
//   GET https://kesintiapi.ckenerji.com.tr/AEDAS/RetrieveOutages
//     -> parametresiz, TÜM aktif kesintileri (planlı + arıza) döner.
//     İL/İLÇE bilgisi YOK, sadece CBS_TM_NO (trafo no) var.
//   GET https://kesintiapi.ckenerji.com.tr/AEDAS/GetLocation?tmno=<CBS_TM_NO>
//     -> {results:[{ilce, mahalle}]} döner — trafo bazında konum eşlemesi.
// Captcha yok, kimlik doğrulama gerekmiyor.
const API_BASE = "https://kesintiapi.ckenerji.com.tr/AEDAS";
const KAYNAK_URL = "https://kesinti.akdenizedas.com.tr/";

// AEDAŞ'ın kendi il/ilçe hiyerarşisinden (ILLER, ILCELER?ilcode=X) çıkarıldı.
// ÖNEMLİ: "KEMER", "AKSU", "MERKEZ" birden fazla ilde tekrar ediyor — GetLocation
// sadece ilçe adı döndürdüğü için (il bilgisi yok) bu durumda hangi ile ait
// olduğunu kesin bilemiyoruz. Nüfusu/trafo sayısı daha büyük olan ile
// (listede önce gelene) düşüyoruz; bu, çok nadir bir yanlış il etiketlemesi
// riski taşır ama ilçe adı yine de doğru gösterilir.
const IL_ILCELERI = {
  Antalya: [
    "AKSEKİ", "AKSU", "ALANYA", "DEMRE", "DÖŞEMEALTI", "ELMALI", "FİNİKE", "GAZİPAŞA",
    "GÜNDOĞMUŞ", "İBRADI", "KAŞ", "KEMER", "KEPEZ", "KONYAALTI", "KORKUTELİ", "KUMLUCA",
    "MANAVGAT", "MURATPAŞA", "SERİK",
  ],
  Burdur: ["AĞLASUN", "ALTINYAYLA", "BUCAK", "ÇAVDIR", "ÇELTİKÇİ", "GÖLHİSAR", "KARAMANLI", "KEMER", "MERKEZ", "TEFENNİ", "YEŞİLOVA"],
  Isparta: ["AKSU", "ATABEY", "EĞİRDİR", "GELENDOST", "GÖNEN", "KEÇİBORLU", "MERKEZ", "ŞARKİKARAAĞAÇ", "SENİRKENT", "SÜTÇÜLER", "ULUBORLU", "YALVAÇ", "YENİŞARBADEMLİ"],
};

function ilBul(ilce) {
  for (const [il, ilceler] of Object.entries(IL_ILCELERI)) {
    if (ilceler.includes(ilce)) return il;
  }
  return "Antalya"; // bilinmeyen ilçe adı gelirse en büyük ile düş
}

async function konumCek(tmno) {
  try {
    const res = await fetch(`${API_BASE}/GetLocation?tmno=${tmno}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export class AkdenizAdapter extends Adapter {
  get saglayici() {
    return "AEDAŞ";
  }

  async fetchRaw() {
    const res = await fetch(`${API_BASE}/RetrieveOutages`);
    if (!res.ok) throw new Error(`RetrieveOutages ${res.status}`);
    const j = await res.json();
    const kayitlar = j.Outage ?? [];

    // Konum sorgusunu trafo başına 1 kere yap (aynı trafoda birden fazla kayıt olabilir).
    const tmnolar = [...new Set(kayitlar.map((k) => k.CBS_TM_NO).filter(Boolean))];
    const konumlar = new Map();
    for (const tmno of tmnolar) {
      const konum = await konumCek(tmno);
      if (konum) konumlar.set(tmno, konum);
    }
    return kayitlar.map((k) => ({ ...k, _konum: konumlar.get(k.CBS_TM_NO) }));
  }

  parse(raw) {
    const dizi = Array.isArray(raw) ? raw : [];
    return dizi
      .map((k) => {
        const konum = k._konum;
        if (!konum?.ilce || !k.RPTD_DATE || !k.EST_REPAIR_TIME) return null;
        const il = ilBul(konum.ilce);
        return {
          // OUTAGE_NO tek başına benzersiz DEĞİL: tek bir arıza olayı birden
          // fazla trafoyu (dolayısıyla farklı mahalleleri) etkileyebiliyor —
          // her satır aslında bir OUTAGE_NO + trafo kombinasyonu.
          id: `AEDAŞ:${k.OUTAGE_NO}:${k.CBS_TM_NO}`,
          hizmet: "elektrik",
          saglayici: "AEDAŞ",
          il,
          ilce: konum.ilce,
          ilceKey: `${ilceAnahtari(il)}_${ilceAnahtari(konum.ilce)}`,
          mahalle: konum.mahalle || "",
          baslangic: new Date(k.RPTD_DATE).toISOString(),
          bitis: new Date(k.EST_REPAIR_TIME).toISOString(),
          sebep: k.BILDIRIM_TURU === "Bildirimli" ? "Planlı bakım" : "Arıza",
          message: k.MESSAGE || "",
          kaynakUrl: KAYNAK_URL,
          cekilmeZamani: new Date().toISOString(),
        };
      })
      .filter(Boolean);
  }
}
