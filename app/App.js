import { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "./src/theme";
import { adresiOku } from "./src/storage/savedAddress";
import { bildirimKur } from "./src/notifications/push";
import { AddressPickerScreen } from "./src/screens/AddressPickerScreen";
import { OutageListScreen } from "./src/screens/OutageListScreen";

// Basit "kapı" mantığı: adres yoksa seçtir, varsa listeyi göster.
// (İleride react-navigation eklenebilir; iskelet için tek state yeter.)
export default function App() {
  const [hazir, setHazir] = useState(false);
  const [adres, setAdres] = useState(null);

  useEffect(() => {
    bildirimKur(); // Android bildirim kanalını hazırla
    adresiOku().then((a) => { setAdres(a); setHazir(true); });
  }, []);

  return (
    <SafeAreaView style={s.kok}>
      <StatusBar barStyle="dark-content" />
      {!hazir ? (
        <View style={s.orta}><ActivityIndicator color={theme.color.elektrik} /></View>
      ) : adres ? (
        <OutageListScreen adres={adres} onAdresDegistir={() => setAdres(null)} />
      ) : (
        <AddressPickerScreen onKaydedildi={setAdres} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kok: { flex: 1, backgroundColor: theme.color.bg },
  orta: { flex: 1, alignItems: "center", justifyContent: "center" },
});
