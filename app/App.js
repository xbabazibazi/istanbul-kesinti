import { useEffect, useState, useCallback } from "react";
import { SafeAreaView, StatusBar, View, ActivityIndicator, StyleSheet, Platform, BackHandler, Alert } from "react-native";
import { theme } from "./src/theme";
import { adresleriOku, adresEkle, adresSil } from "./src/storage/adresler";
import { proMu as devProMu, proAyarla as devProAyarla, MAX_UCRETSIZ_ILCE } from "./src/storage/proDurumu";
import {
  denemeBaslangiciniGarantiele,
  denemeSuresiIcindeMi,
  denemeBittiUyarisiGerekiyorMu,
  uyariGosterildiOlarakIsaretle,
  denemeKalanGunSayisi,
  denemeBitisTarihi,
} from "./src/storage/deneme";
import { satinAlmalariKur, proMu as gercekProMu, proDegisimineAbonolun } from "./src/iap/purchases";
import { bildirimKur, ilceyeAboneOl } from "./src/notifications/push";
import mobileAds from "react-native-google-mobile-ads";
import { AddressPickerScreen } from "./src/screens/AddressPickerScreen";
import { OutageListScreen } from "./src/screens/OutageListScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { OnizlemeScreen } from "./src/screens/OnizlemeScreen";

// Gerçek AdMob kimlikleri alınana kadar reklam tamamen kapalı (bkz. .env).
const REKLAM_KAPALI = process.env.EXPO_PUBLIC_REKLAM_KAPALI === "1";

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
  const [onizlemeAcik, setOnizlemeAcik] = useState(false); // il/ilçe seçici "sadece bak" modunda
  const [onizlemeAdres, setOnizlemeAdres] = useState(null); // {il, ilce, ilceKey} veya null
  const [denemeIcinde, setDenemeIcinde] = useState(false); // ücretsizde hatırlatma deneme süresi
  const [denemeKalanGun, setDenemeKalanGun] = useState(30);
  const [denemeBitisIso, setDenemeBitisIso] = useState(null);

  const pro = gercekPro || (__DEV__ && devPro);
  // Bildirimler (yeni kesinti + 1 gün önceden hatırlatma): Pro'da her zaman,
  // ücretsizde ilk 1 ay boyunca da açık (deneme).
  const bildirimlerAktif = pro || denemeIcinde;
  // Push aboneliğine gönderilen "son kullanma tarihi" — Pro'da süresiz (null),
  // ücretsizde denemenin bittiği tarih (sunucu bu tarihten sonra susar).
  const abonelikSonTarihi = pro ? null : denemeBitisIso;

  useEffect(() => {
    bildirimKur(); // Android bildirim kanalını hazırla
    satinAlmalariKur();
    // Reklam kapalıyken AdMob SDK'sını hiç başlatma — gerçek AdMob kimlikleri
    // gelene kadar test kimlikleriyle reklam altyapısı ayağa kalkmasın.
    if (!REKLAM_KAPALI) mobileAds().initialize();
    denemeBaslangiciniGarantiele();
    Promise.all([
      adresleriOku(),
      devProMu(),
      gercekProMu(),
      denemeSuresiIcindeMi(),
      denemeKalanGunSayisi(),
      denemeBitisTarihi(),
    ]).then(([liste, dev, gercek, deneme, kalanGun, bitisTarihi]) => {
      setAdresler(liste);
      setDevPro(dev);
      setGercekPro(gercek);
      setDenemeIcinde(deneme);
      setDenemeKalanGun(kalanGun);
      setDenemeBitisIso(bitisTarihi);
      setHazir(true);
    });
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

  // Pro'ya geçince, deneme süresine bağlı (expires_at dolu) abonelikleri
  // süresiz hale getir — yoksa sunucu deneme bitiş tarihinde susturmaya devam eder.
  useEffect(() => {
    if (!hazir || !pro || adresler.length === 0) return;
    adresler.forEach((a) => ilceyeAboneOl(a.ilceKey, null));
  }, [pro, hazir, adresler]);

  const ilceEkle = useCallback(async (adres) => {
    if (bildirimlerAktif) await ilceyeAboneOl(adres.ilceKey, abonelikSonTarihi);
    const yeni = await adresEkle(adres);
    setAdresler(yeni);
    setEkleModu(false);
  }, [bildirimlerAktif, abonelikSonTarihi]);

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

  // Önizlemedeki ilçeyi kalıcı takip listesine ekle — normal ekleme akışıyla
  // aynı Pro sınırı geçerli (bakmak ücretsiz, birden fazlasını TAKİP ETMEK Pro).
  const onizlemedenEkle = useCallback(() => {
    if (!onizlemeAdres) return;
    if (!pro && adresler.length >= MAX_UCRETSIZ_ILCE) {
      setOnizlemeAdres(null);
      setPaywallAcik(true);
      return;
    }
    ilceEkle(onizlemeAdres);
    setOnizlemeAdres(null);
  }, [onizlemeAdres, pro, adresler.length, ilceEkle]);

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
          abonelikSonTarihi={abonelikSonTarihi}
          onKapat={() => setAyarlarAcik(false)}
          onPaywallAc={() => {
            setAyarlarAcik(false);
            setPaywallAcik(true);
          }}
          onIlceKaldir={ilceKaldir}
        />
      ) : onizlemeAcik ? (
        <AddressPickerScreen
          onOnizle={(adres) => {
            setOnizlemeAcik(false);
            setOnizlemeAdres(adres);
          }}
          onIptal={() => setOnizlemeAcik(false)}
        />
      ) : onizlemeAdres ? (
        <OnizlemeScreen
          adres={onizlemeAdres}
          zatenTakipte={adresler.some((a) => a.ilceKey === onizlemeAdres.ilceKey)}
          onGeri={() => setOnizlemeAdres(null)}
          onEkle={onizlemedenEkle}
        />
      ) : adresler.length > 0 && !ekleModu ? (
        <OutageListScreen
          adresler={adresler}
          pro={pro}
          bildirimlerAktif={bildirimlerAktif}
          denemeKalanGun={denemeKalanGun}
          abonelikSonTarihi={abonelikSonTarihi}
          onIlceEkle={() => setEkleModu(true)}
          onIlceKaldir={ilceKaldir}
          onProDegistir={proDegistir}
          onPaywallAc={() => setPaywallAcik(true)}
          onAyarlarAc={() => setAyarlarAcik(true)}
          onOnizlemeAc={() => setOnizlemeAcik(true)}
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
