import AsyncStorage from "@react-native-async-storage/async-storage";
const ANAHTAR = "kayitli_adres_v2"; // {il, ilce, ilceKey}

export async function adresiKaydet(adres) {
  await AsyncStorage.setItem(ANAHTAR, JSON.stringify(adres));
}
export async function adresiOku() {
  const s = await AsyncStorage.getItem(ANAHTAR);
  return s ? JSON.parse(s) : null;
}
export async function adresiSil() {
  await AsyncStorage.removeItem(ANAHTAR);
}
