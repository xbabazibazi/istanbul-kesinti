import { useEffect, useState, useCallback } from "react";
import { SafeAreaView, StatusBar, View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { theme } from "./src/theme";
import { adresleriOku, adresEkle, adresSil } from "./src/storage/adresler";
import { proMu, proAyarla } from "./src/storage/proDurumu";
import { bildirimKur, ilceyeAboneOl } from "./src/notifications/push";
import { AddressPickerScreen } from "./src/screens/AddressPickerScreen";
import { OutageListScreen } from "./src/screens/OutageListScreen";

// Basit "kapı" mantığı: kayıtlı ilçe yoksa seçtir, varsa listeyi göster.
// (İleride react-navigation eklenebilir; iskelet için tek state yeter.)
export default function App() {
  const [hazir, setHazir] = useState(false);
  const [adresler, setAdresler] = useState([]);
  const [pro, setPro] = useState(false);
  const [ekleModu, setEkleModu] = useState(false); // ilçe listesine ikinci+ ilçe eklerken true

  useEffect(() => {
    bildirimKur(); // Android bildirim kanalını hazırla
    Promise.all([adresleriOku(), proMu()]).then(([liste, proDurum]) => {
      setAdresler(liste);
      setPro(proDurum);
      setHazir(true);
    });
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
    setPro((onceki) => {
      proAyarla(!onceki);
      return !onceki;
    });
  }, []);

  return (
    <SafeAreaView style={s.kok}>
      <StatusBar barStyle="dark-content" />
      {!hazir ? (
        <View style={s.orta}><ActivityIndicator color={theme.color.elektrik} /></View>
      ) : adresler.length > 0 && !ekleModu ? (
        <OutageListScreen
          adresler={adresler}
          pro={pro}
          onIlceEkle={() => setEkleModu(true)}
          onIlceKaldir={ilceKaldir}
          onProDegistir={proDegistir}
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
