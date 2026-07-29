import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

export async function ilceyeAboneOl(ilceKey) {
  const izin = await bildirimIzniIste();
  if (!izin) return { ok: false, sebep: "izin-yok" };
  const konu = ilceKonusu(ilceKey);
  // TODO: token al + backend'e {token, konu} gönder (FCM/Expo Push)
  console.log("[abone] konu:", konu);
  return { ok: true, konu };
}
