import AsyncStorage from "@react-native-async-storage/async-storage";
const ANAHTAR = "pro_durumu_v1";

// NOT: Gerçek satın alma/abonelik entegrasyonu henüz yok — bu, mağaza ürünleri
// kurulana kadar kullanılan geçici bir yerel bayrak. Gerçek IAP eklenince
// proMu() buradaki AsyncStorage yerine satın alma durumunu okuyacak şekilde
// değiştirilecek; çağıran taraflar (App.js vb.) aynı kalabilir.
export const MAX_UCRETSIZ_ILCE = 1;

export async function proMu() {
  const s = await AsyncStorage.getItem(ANAHTAR);
  return s === "1";
}

export async function proAyarla(deger) {
  await AsyncStorage.setItem(ANAHTAR, deger ? "1" : "0");
}
