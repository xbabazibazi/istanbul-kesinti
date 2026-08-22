// Sürekli çalışan mod (Docker için): sabit aralıklarla toplayıcıyı çalıştırır,
// her çalışmayı geçmişe kaydeder ve bakım panelini ayağa kaldırır.
import { calistir } from "./scrape.js";
import { gecmiseEkle, gecmisOku } from "./gecmis.js";
import { dashboardBaslat } from "./dashboard.js";

const ARALIK_MS = Number(process.env.ARALIK_DAKIKA || 60) * 60 * 1000;
const PORT = Number(process.env.PANEL_PORT || 8080);

let sonrakiCalismaZamani = null;

async function birTur() {
  let sonuc;
  try {
    sonuc = await calistir();
  } catch (err) {
    console.error("[FATAL]", err);
    sonuc = {
      zaman: new Date().toISOString(),
      basarili: false,
      toplamKayit: 0,
      yeniKayit: 0,
      adapterSonuclari: [{ saglayici: "?", basarili: false, kayitSayisi: 0, hata: err.message }],
    };
  }
  await gecmiseEkle(sonuc);
  sonrakiCalismaZamani = new Date(Date.now() + ARALIK_MS);
  return sonuc;
}

async function durumGetir() {
  const gecmis = await gecmisOku();
  return {
    sonCalisma: gecmis[0] || null,
    gecmis,
    sonrakiCalisma: sonrakiCalismaZamani
      ? sonrakiCalismaZamani.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
      : null,
  };
}

dashboardBaslat({
  port: PORT,
  kullaniciAdi: process.env.PANEL_KULLANICI,
  sifre: process.env.PANEL_SIFRE,
  durumGetir,
  manuelTetikle: birTur,
});

birTur();
setInterval(birTur, ARALIK_MS);
