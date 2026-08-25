import AsyncStorage from "@react-native-async-storage/async-storage";

const BASLANGIC_ANAHTARI = "hatirlatma_deneme_baslangic_v1";
const UYARI_GOSTERILDI_ANAHTARI = "hatirlatma_deneme_uyari_gosterildi_v1";
const DENEME_SURESI_MS = 30 * 24 * 60 * 60 * 1000; // 1 ay

// Ücretsiz kullanıcıya ilk kurulumdan itibaren 1 ay boyunca Pro'nun
// hatırlatma bildirimi özelliğini deneme olarak açar. Süre dolunca
// Pro'ya geçmesi önerilir (bkz. denemeBittiUyarisiGoster).
export async function denemeBaslangiciniGarantiele() {
  const mevcut = await AsyncStorage.getItem(BASLANGIC_ANAHTARI);
  if (!mevcut) {
    await AsyncStorage.setItem(BASLANGIC_ANAHTARI, new Date().toISOString());
  }
}

export async function denemeSuresiIcindeMi() {
  const baslangic = await AsyncStorage.getItem(BASLANGIC_ANAHTARI);
  if (!baslangic) return true; // henüz kaydedilmediyse (ilk açılış anı) izin ver
  return Date.now() - Date.parse(baslangic) < DENEME_SURESI_MS;
}

// Deneme süresi bugün itibariyle bittiyse ve uyarı daha önce gösterilmediyse true döner;
// çağıran taraf true aldığında uyarıyı gösterip gosterildiOlarakIsaretle()'yi çağırmalı.
export async function denemeBittiUyarisiGerekiyorMu() {
  const [baslangic, gosterildi] = await Promise.all([
    AsyncStorage.getItem(BASLANGIC_ANAHTARI),
    AsyncStorage.getItem(UYARI_GOSTERILDI_ANAHTARI),
  ]);
  if (!baslangic || gosterildi) return false;
  return Date.now() - Date.parse(baslangic) >= DENEME_SURESI_MS;
}

export async function uyariGosterildiOlarakIsaretle() {
  await AsyncStorage.setItem(UYARI_GOSTERILDI_ANAHTARI, "1");
}

// Ekranda "deneme: X gün kaldı" göstermek için. Deneme bitmişse/yoksa 0 döner.
export async function denemeKalanGunSayisi() {
  const baslangic = await AsyncStorage.getItem(BASLANGIC_ANAHTARI);
  if (!baslangic) return 30;
  const kalanMs = DENEME_SURESI_MS - (Date.now() - Date.parse(baslangic));
  return Math.max(0, Math.ceil(kalanMs / (24 * 60 * 60 * 1000)));
}

// Push aboneliğine "son kullanma tarihi" olarak gönderilir — sunucu (Supabase)
// deneme süresi dolan, Pro olmayan cihazlara bildirim göndermeyi bu tarihe göre
// kesiyor. Böylece deneme içindeyken abone olunmuş bir cihaz da süre bitince
// gerçekten susar (sadece istemci tarafında gizlenmiş olmaz).
export async function denemeBitisTarihi() {
  const baslangic = await AsyncStorage.getItem(BASLANGIC_ANAHTARI);
  const baslangicMs = baslangic ? Date.parse(baslangic) : Date.now();
  return new Date(baslangicMs + DENEME_SURESI_MS).toISOString();
}
