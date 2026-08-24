// TOPLAYICI ÇEKİRDEĞİ — hem tek seferlik CLI (index.js) hem sürekli çalışan
// daemon (daemon.js) tarafından kullanılır. Akış: her adapter'ı çek+parse ->
// doğrula -> birleştir -> yenileri bul -> sakla -> yeniler için bildirim.
// Bir adapter patlarsa DİĞERLERİ devam eder (biri bozulunca hepsi düşmesin).

import { BedasAdapter } from "./adapters/bedas.js";
import { AkdenizAdapter } from "./adapters/akdeniz.js";
import { gecerliMi } from "./schema.js";
import { oku, yaz, yeniOlanlar } from "./store.js";
import { bildirimGonder } from "./notify.js";

const ADAPTERS = [new BedasAdapter(), new AkdenizAdapter()];
const BIR_GUN_MS = 24 * 60 * 60 * 1000;

async function birAdapter(adapter) {
  try {
    const raw = await adapter.fetchRaw();
    const kesintiler = adapter.parse(raw).filter(gecerliMi);
    console.log(`[ok] ${adapter.saglayici}: ${kesintiler.length} kayıt`);
    return { saglayici: adapter.saglayici, basarili: true, kayitSayisi: kesintiler.length, hata: null, kesintiler };
  } catch (err) {
    // KRİTİK: endpoint sessizce bozulur (örn. WAF engeli) — bu, "bağlantı" panelinde görünür olsun diye ayrı bir hata alanı taşır.
    console.error(`[ALARM] ${adapter.saglayici} çekilemedi: ${err.message}`);
    return { saglayici: adapter.saglayici, basarili: false, kayitSayisi: 0, hata: err.message, kesintiler: [] };
  }
}

// Dönen özet, hem CLI loglarında hem daemon'un geçmiş kaydında/dashboard'unda kullanılır.
export async function calistir() {
  const oncekiler = (await oku()).kesintiler;

  const adapterSonuclari = await Promise.all(ADAPTERS.map(birAdapter));
  // Önceki kayıtlarla birleştir: sağlayıcı bir kesintiyi süresi dolmadan
  // listesinden kaldırsa bile, biz "kapandı" olarak 1 gün daha gösterebilelim.
  // Aynı id'de fresh veri her zaman eskisinin üstüne yazar (Map sırası sayesinde).
  const hepsi = [...oncekiler, ...adapterSonuclari.flatMap((s) => s.kesintiler)];
  const tekil = [...new Map(hepsi.map((k) => [k.id, k])).values()];

  // Bitişinden 1 gün sonrasına kadar tut (o süre boyunca "kapandı" görünür), sonra kaldır
  const simdi = Date.now();
  const tutulacak = tekil.filter((k) => Date.parse(k.bitis) >= simdi - BIR_GUN_MS);

  const yeniler = yeniOlanlar(oncekiler, tutulacak);
  await yaz(tutulacak);
  if (yeniler.length) await bildirimGonder(yeniler);

  const sonuc = {
    zaman: new Date().toISOString(),
    basarili: adapterSonuclari.some((s) => s.basarili),
    toplamKayit: tutulacak.length,
    yeniKayit: yeniler.length,
    adapterSonuclari: adapterSonuclari.map(({ kesintiler, ...ozet }) => ozet),
  };
  console.log(`[bitti] toplam=${sonuc.toplamKayit} yeni=${sonuc.yeniKayit} @ ${sonuc.zaman}`);
  return sonuc;
}
