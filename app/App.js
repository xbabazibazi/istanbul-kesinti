import { useEffect, useState, useCallback } from "react";
import { SafeAreaView, StatusBar, View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { theme } from "./src/theme";
import { adresleriOku, adresEkle, adresSil } from "./src/storage/adresler";
import { proMu as devProMu, proAyarla as devProAyarla } from "./src/storage/proDurumu";
import { satinAlmalariKur, proMu as gercekProMu, proDegisimineAbonolun } from "./src/iap/purchases";
import { bildirimKur, ilceyeAboneOl } from "./src/notifications/push";
import { AddressPickerScreen } from "./src/screens/AddressPickerScreen";
import { OutageListScreen } from "./src/screens/OutageListScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";

// Basit "kapı" mantığı: kayıtlı ilçe yoksa seçtir, varsa listeyi göster.
// (İleride react-navigation eklenebilir; iskelet için tek state yeter.)
export default function App() {
  const [hazir, setHazir] = useState(false);
  const [adresler, setAdresler] = useState([]);
  const [gercekPro, setGercekPro] = useState(false); // RevenueCat aboneliği
  const [devPro, setDevPro] = useState(false); // sadece __DEV__ build'lerde geçerli test bayrağı
  const [ekleModu, setEkleModu] = useState(false); // ilçe listesine ikinci+ ilçe eklerken true
  const [paywallAcik, setPaywallAcik] = useState(false);

  const pro = gercekPro || (__DEV__ && devPro);

  useEffect(() => {
    bildirimKur(); // Android bildirim kanalını hazırla
    satinAlmalariKur();
    Promise.all([adresleriOku(), devProMu(), gercekProMu()]).then(([liste, dev, gercek]) => {
      setAdresler(liste);
      setDevPro(dev);
      setGercekPro(gercek);
      setHazir(true);
    });
    return proDegisimineAbonolun(setGercekPro);
  }, []);

  const ilceEkle = useCallback(async (adres) => {
    await ilceyeAboneOl(adres.ilceKey);
    const yeni = await adresEkle(adres);
    setAdresler(yeni);
    setEkleModu(false);
  }, []);

  const ilceKaldir = useCallback(async (ilceKey) => {
    const yeni = await adresSil(ilceKey);
    setAdresler(yeni);
  }, []);

  // DEV: gerçek satın alma kurulana kadar Pro durumunu test etmek için (wordmark'a uzun bas).
  const proDegistir = useCallback(() => {
    setDevPro((onceki) => {
      devProAyarla(!onceki);
      return !onceki;
    });
  }, []);

  return (
    <SafeAreaView style={s.kok}>
      <StatusBar barStyle="dark-content" />
      {!hazir ? (
        <View style={s.orta}><ActivityIndicator color={theme.color.elektrik} /></View>
      ) : paywallAcik ? (
        <PaywallScreen
          onKapat={() => setPaywallAcik(false)}
          onBasarili={() => {
            setGercekPro(true);
            setPaywallAcik(false);
          }}
        />
      ) : adresler.length > 0 && !ekleModu ? (
        <OutageListScreen
          adresler={adresler}
          pro={pro}
          onIlceEkle={() => setEkleModu(true)}
          onIlceKaldir={ilceKaldir}
          onProDegistir={proDegistir}
          onPaywallAc={() => setPaywallAcik(true)}
        />
      ) : (
        <AddressPickerScreen
          onKaydedildi={ilceEkle}
          onIptal={adresler.length > 0 ? () => setEkleModu(false) : null}
          secilenIlceKeyleri={adresler.map((a) => a.ilceKey)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kok: {
    flex: 1,
    backgroundColor: theme.color.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  orta: { flex: 1, alignItems: "center", justifyContent: "center" },
});
