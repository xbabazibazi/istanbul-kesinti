import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EAS_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId;

export function ilceKonusu(ilceKey) {
  return "ilce_" + ilceKey.replace(/\s+/g, "_");
}

export async function bildirimKur() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("kesinti", {
      name: "Kesinti bildirimleri",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}

export async function bildirimIzniIste() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Kullanıcıya sormadan mevcut izin durumunu okur — buton hangi metni göstereceğine karar vermek için.
export async function bildirimIzniDurumu() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

// Token'ı Supabase'e yazar (ilce_key değişirse aynı token üstüne günceller, bkz. on_conflict).
async function tokenıKaydet(ilceKey, expoToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("[abone] Supabase yapılandırılmamış, token kaydedilmedi");
    return false;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/push_tokens?on_conflict=expo_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ ilce_key: ilceKey, expo_token: expoToken }),
  });
  return res.ok;
}

export async function ilceyeAboneOl(ilceKey) {
  const izin = await bildirimIzniIste();
  if (!izin) return { ok: false, sebep: "izin-yok" };
  const konu = ilceKonusu(ilceKey);
  if (!EAS_PROJECT_ID) {
    console.log("[abone] EAS projectId bulunamadı, token alınamadı");
    return { ok: false, sebep: "projectId-yok" };
  }
  try {
    const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    const kaydedildi = await tokenıKaydet(ilceKey, expoToken);
    return { ok: kaydedildi, konu };
  } catch (err) {
    console.log("[abone] token alınamadı:", err.message);
    return { ok: false, sebep: "token-hatasi" };
  }
}
