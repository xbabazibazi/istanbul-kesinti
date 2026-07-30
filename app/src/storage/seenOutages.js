import AsyncStorage from "@react-native-async-storage/async-storage";
const ANAHTAR = "gorulen_kesinti_id_v1";

export async function gorulenleriOku() {
  const s = await AsyncStorage.getItem(ANAHTAR);
  return s ? JSON.parse(s) : [];
}
export async function gorulenleriYaz(idler) {
  await AsyncStorage.setItem(ANAHTAR, JSON.stringify(idler));
}
