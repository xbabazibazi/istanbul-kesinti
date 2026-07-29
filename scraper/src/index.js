// TOPLAYICI ORKESTRASYON — cron/serverless bunu 3-4 saatte bir çalıştırır.
// Akış: her adapter'ı çek+parse -> doğrula -> birleştir -> yenileri bul
//       -> sakla -> yeniler için bildirim.
// Bir adapter patlarsa DİĞERLERİ devam eder (biri bozulunca hepsi düşmesin).

import { BedasAdapter } from "./adapters/bedas.js";
import { gecerliMi } from "./schema.js";
import { oku, yaz, yeniOlanlar } from "./store.js";
import { bildirimGonder } from "./notify.js";

const ADAPTERS = [new BedasAdapter()];

async function birAdapter(adapter) {
  try {
    const raw = await adapter.fetchRaw();
    const kesintiler = adapter.parse(raw).filter(gecerliMi);
    console.log(`[ok] ${adapter.saglayici}: ${kesintiler.length} kayıt`);
    return kesintiler;
  } catch (err) {
    // KRİTİK: endpoint sessizce bozulur. Buradan kendine alarm at (mail/Telegram).
    console.error(`[ALARM] ${adapter.saglayici} çekilemedi: ${err.message}`);
    return [];
  }
}

async function main() {
  const oncekiler = (await oku()).kesintiler;

  const parcalar = await Promise.all(ADAPTERS.map(birAdapter));
  const hepsi = parcalar.flat();

  // id'ye göre tekilleştir (aynı kesinti iki kez gelirse)
  const tekil = [...new Map(hepsi.map((k) => [k.id, k])).values()];

  // Geçmişi geç, sadece bugünden sonrasını tut
  const simdi = Date.now();
  const gelecek = tekil.filter((k) => Date.parse(k.bitis) >= simdi);

  const yeniler = yeniOlanlar(oncekiler, gelecek);
  await yaz(gelecek);
  if (yeniler.length) await bildirimGonder(yeniler);

  console.log(
    `[bitti] toplam=${gelecek.length} yeni=${yeniler.length} @ ${new Date().toISOString()}`
  );
}

main().catch((e) => {
  console.error("[FATAL]", e);
  process.exit(1);
});
