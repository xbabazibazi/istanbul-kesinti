import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// Gerçek AdMob hesabı kurulunca EXPO_PUBLIC_ADMOB_BANNER_ID'yi doldur;
// tanımsızken Google'ın resmi test reklam birimine düşer (geliştirme/inceleme
// sürecinde gerçek reklam göstermemek için önemli — AdMob politikası).
const BIRIM_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER;

// Mağaza ekran görüntüsü alan CI build'i bunu "1" yapar; AdMob'un "Test mode"
// yazan yer tutucu reklamı görsellere karışmasın diye. Normal yayın
// build'lerinde tanımsızdır, yani reklam her zamanki gibi görünür.
const REKLAM_KAPALI = process.env.EXPO_PUBLIC_REKLAM_KAPALI === "1";

// Pro kullanıcıya hiç render edilmez (reklamsız kullanım Pro'nun temel vaadi).
export function ReklamBanner({ pro }) {
  if (pro || REKLAM_KAPALI) return null;
  return (
    <View style={s.wrap}>
      <BannerAd unitId={BIRIM_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 8 },
});
