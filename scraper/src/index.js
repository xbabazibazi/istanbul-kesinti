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

const BIR_GUN_MS = 24 * 60 * 60 * 1000;

async function main() {
  const oncekiler = (await oku()).kesintiler;

  const parcalar = await Promise.all(ADAPTERS.map(birAdapter));
  // Önceki kayıtlarla birleştir: sağlayıcı bir kesintiyi süresi dolmadan
  // listesinden kaldırsa bile, biz "kapandı" olarak 1 gün daha gösterebilelim.
  // Aynı id'de fresh veri her zaman eskisinin üstüne yazar (Map sırası sayesinde).
  const hepsi = [...oncekiler, ...parcalar.flat()];
  const tekil = [...new Map(hepsi.map((k) => [k.id, k])).values()];

  // Bitişinden 1 gün sonrasına kadar tut (o süre boyunca "kapandı" görünür), sonra kaldır
  const simdi = Date.now();
  const tutulacak = tekil.filter((k) => Date.parse(k.bitis) >= simdi - BIR_GUN_MS);

  const yeniler = yeniOlanlar(oncekiler, tutulacak);
  await yaz(tutulacak);
  if (yeniler.length) await bildirimGonder(yeniler);

  console.log(
    `[bitti] toplam=${tutulacak.length} yeni=${yeniler.length} @ ${new Date().toISOString()}`
  );
}

main().catch((e) => {
  console.error("[FATAL]", e);
  process.exit(1);
});
