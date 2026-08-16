import AsyncStorage from "@react-native-async-storage/async-storage";
const ANAHTAR = "kayitli_adresler_v1"; // [{il, ilce, ilceKey}, ...]
const ESKI_ANAHTAR = "kayitli_adres_v2"; // önceki tekil-adres sürümü, göç için

export async function adresleriOku() {
  const s = await AsyncStorage.getItem(ANAHTAR);
  if (s) return JSON.parse(s);
  // Eski tekil kayıttan göç (bir kereye mahsus)
  const eski = await AsyncStorage.getItem(ESKI_ANAHTAR);
  if (eski) {
    const liste = [JSON.parse(eski)];
    await AsyncStorage.setItem(ANAHTAR, JSON.stringify(liste));
    await AsyncStorage.removeItem(ESKI_ANAHTAR);
    return liste;
  }
  return [];
}

export async function adresEkle(adres) {
  const liste = await adresleriOku();
  if (liste.some((a) => a.ilceKey === adres.ilceKey)) return liste;
  const yeni = [...liste, adres];
  await AsyncStorage.setItem(ANAHTAR, JSON.stringify(yeni));
  return yeni;
}

export async function adresSil(ilceKey) {
  const liste = await adresleriOku();
  const yeni = liste.filter((a) => a.ilceKey !== ilceKey);
  await AsyncStorage.setItem(ANAHTAR, JSON.stringify(yeni));
  return yeni;
}
