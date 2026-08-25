import { useEffect, useState, useCallback } from "react";
import { SafeAreaView, StatusBar, View, ActivityIndicator, StyleSheet, Platform, BackHandler, Alert } from "react-native";
import { theme } from "./src/theme";
import { adresleriOku, adresEkle, adresSil } from "./src/storage/adresler";
import { proMu as devProMu, proAyarla as devProAyarla } from "./src/storage/proDurumu";
import {
  denemeBaslangiciniGarantiele,
  denemeSuresiIcindeMi,
  denemeBittiUyarisiGerekiyorMu,
  uyariGosterildiOlarakIsaretle,
  denemeKalanGunSayisi,
} from "./src/storage/deneme";
import { satinAlmalariKur, proMu as gercekProMu, proDegisimineAbonolun } from "./src/iap/purchases";
import { bildirimKur, ilceyeAboneOl } from "./src/notifications/push";
import mobileAds from "react-native-google-mobile-ads";
import { AddressPickerScreen } from "./src/screens/AddressPickerScreen";
import { OutageListScreen } from "./src/screens/OutageListScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

// Basit "kapı" mantığı: kayıtlı ilçe yoksa seçtir, varsa listeyi göster.
// (İleride react-navigation eklenebilir; iskelet için tek state yeter.)
export default function App() {
  const [hazir, setHazir] = useState(false);
  const [adresler, setAdresler] = useState([]);
  const [gercekPro, setGercekPro] = useState(false); // RevenueCat aboneliği
  const [devPro, setDevPro] = useState(false); // sadece __DEV__ build'lerde geçerli test bayrağı
  const [ekleModu, setEkleModu] = useState(false); // ilçe listesine ikinci+ ilçe eklerken true
  const [paywallAcik, setPaywallAcik] = useState(false);
  const [ayarlarAcik, setAyarlarAcik] = useState(false);
  const [denemeIcinde, setDenemeIcinde] = useState(false); // ücretsizde hatırlatma deneme süresi
  const [denemeKalanGun, setDenemeKalanGun] = useState(30);

  const pro = gercekPro || (__DEV__ && devPro);
  // Bildirimler (yeni kesinti + 1 gün önceden hatırlatma): Pro'da her zaman,
  // ücretsizde ilk 1 ay boyunca da açık (deneme).
  const bildirimlerAktif = pro || denemeIcinde;

  useEffect(() => {
    bildirimKur(); // Android bildirim kanalını hazırla
    satinAlmalariKur();
    mobileAds().initialize();
    denemeBaslangiciniGarantiele();
    Promise.all([adresleriOku(), devProMu(), gercekProMu(), denemeSuresiIcindeMi(), denemeKalanGunSayisi()]).then(
      ([liste, dev, gercek, deneme, kalanGun]) => {
        setAdresler(liste);
        setDevPro(dev);
        setGercekPro(gercek);
        setDenemeIcinde(deneme);
        setDenemeKalanGun(kalanGun);
        setHazir(true);
      }
    );
    denemeBittiUyarisiGerekiyorMu().then((gerekli) => {
      if (!gerekli) return;
      uyariGosterildiOlarakIsaretle();
      Alert.alert(
        "Ücretsiz deneme süren bitti",
        "1 aylık ücretsiz bildirim deneme süren doldu. Kesinti bildirimleri ve hatırlatmalara devam etmek için Pro'ya geçebilirsin.",
        [
          { text: "Belki sonra", style: "cancel" },
          { text: "Pro'ya geç", onPress: () => setPaywallAcik(true) },
        ]
      );
    });
    return proDegisimineAbonolun(setGercekPro);
  }, []);

  // Android donanım geri tuşu: paywall, ayarlar veya "ilçe ekle" modundayken
  // uygulamadan çıkmak yerine o ekranı kapatsın.
  useEffect(() => {
    const geriTusu = () => {
      if (paywallAcik) {
        setPaywallAcik(false);
        return true;
      }
      if (ayarlarAcik) {
        setAyarlarAcik(false);
        return true;
      }
      if (ekleModu && adresler.length > 0) {
        setEkleModu(false);
        return true;
      }
      return false;
    };
    const abonelik = BackHandler.addEventListener("hardwareBackPress", geriTusu);
    return () => abonelik.remove();
  }, [paywallAcik, ayarlarAcik, ekleModu, adresler.length]);

  const ilceEkle = useCallback(async (adres) => {
    if (bildirimlerAktif) await ilceyeAboneOl(adres.ilceKey);
    const yeni = await adresEkle(adres);
    setAdresler(yeni);
    setEkleModu(false);
  }, [bildirimlerAktif]);

  const ilceKaldir = useCallback(async (ilceKey) => {
    const yeni = await adresSil(ilceKey);
    setAdresler(yeni);
    if (yeni.length === 0) setAyarlarAcik(false); // ayarlardan son ilçe kaldırılırsa seçim ekranına düş
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
      ) : ayarlarAcik ? (
        <SettingsScreen
          adresler={adresler}
          pro={pro}
          denemeKalanGun={denemeKalanGun}
          bildirimlerAktif={bildirimlerAktif}
          onKapat={() => setAyarlarAcik(false)}
          onPaywallAc={() => {
            setAyarlarAcik(false);
            setPaywallAcik(true);
          }}
          onIlceKaldir={ilceKaldir}
        />
      ) : adresler.length > 0 && !ekleModu ? (
        <OutageListScreen
          adresler={adresler}
          pro={pro}
          bildirimlerAktif={bildirimlerAktif}
          denemeKalanGun={denemeKalanGun}
          onIlceEkle={() => setEkleModu(true)}
          onIlceKaldir={ilceKaldir}
          onProDegistir={proDegistir}
          onPaywallAc={() => setPaywallAcik(true)}
          onAyarlarAc={() => setAyarlarAcik(true)}
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
