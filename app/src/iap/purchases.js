import Purchases from "react-native-purchases";
import { Platform } from "react-native";

const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const PRO_ENTITLEMENT = "pro";

let yapilandirildi = false;

function apiAnahtari() {
  return Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
}

function entitlementAktifMi(customerInfo) {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
}

// API anahtarı henüz tanımlanmadıysa (RevenueCat kurulumu tamamlanana kadar)
// sessizce devre dışı kalır; proMu() her zaman false döner.
export function satinAlmalariKur() {
  const anahtar = apiAnahtari();
  if (!anahtar || yapilandirildi) return;
  Purchases.configure({ apiKey: anahtar });
  yapilandirildi = true;
}

export function satinAlmalarAktifMi() {
  return yapilandirildi;
}

export async function proMu() {
  if (!yapilandirildi) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return entitlementAktifMi(customerInfo);
  } catch {
    return false;
  }
}

// Abonelik başka bir cihazda satın alınmış/iptal edilmiş olabilir; değişiklikleri
// canlı yakalamak için kullanılır. Dönen fonksiyon dinleyiciyi kaldırır.
export function proDegisimineAbonolun(geriCagir) {
  if (!yapilandirildi) return () => {};
  const dinleyici = (customerInfo) => geriCagir(entitlementAktifMi(customerInfo));
  Purchases.addCustomerInfoUpdateListener(dinleyici);
  return () => Purchases.removeCustomerInfoUpdateListener(dinleyici);
}

export async function teklifleriGetir() {
  if (!yapilandirildi) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function satinAl(paket) {
  const { customerInfo } = await Purchases.purchasePackage(paket);
  return entitlementAktifMi(customerInfo);
}

export async function geriYukle() {
  const customerInfo = await Purchases.restorePurchases();
  return entitlementAktifMi(customerInfo);
}
