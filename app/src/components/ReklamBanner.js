import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// Gerçek AdMob hesabı kurulunca EXPO_PUBLIC_ADMOB_BANNER_ID'yi doldur;
// tanımsızken Google'ın resmi test reklam birimine düşer (geliştirme/inceleme
// sürecinde gerçek reklam göstermemek için önemli — AdMob politikası).
const BIRIM_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER;

// Pro kullanıcıya hiç render edilmez (reklamsız kullanım Pro'nun temel vaadi).
export function ReklamBanner({ pro }) {
  if (pro) return null;
  return (
    <View style={s.wrap}>
      <BannerAd unitId={BIRIM_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 8 },
});
