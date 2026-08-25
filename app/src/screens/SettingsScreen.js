import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert, BackHandler } from "react-native";
import { theme } from "../theme";
import { bildirimIzniDurumu, ilceyeAboneOl } from "../notifications/push";

export function SettingsScreen({ adresler, pro, denemeKalanGun, onKapat, onPaywallAc, onIlceKaldir }) {
  const [bildirimAcik, setBildirimAcik] = useState(null);

  useEffect(() => {
    bildirimIzniDurumu().then(setBildirimAcik);
  }, []);

  useEffect(() => {
    const geriTusu = () => {
      onKapat();
      return true;
    };
    const abonelik = BackHandler.addEventListener("hardwareBackPress", geriTusu);
    return () => abonelik.remove();
  }, [onKapat]);

  async function bildirimAcButonu() {
    const sonuclar = await Promise.all(adresler.map((a) => ilceyeAboneOl(a.ilceKey)));
    setBildirimAcik(sonuclar.some((s) => s.ok));
  }

  function ilceKaldirBasildi(a) {
    Alert.alert(
      `${a.ilce} kaldırılsın mı?`,
      "Bu ilçeyi takip listenden çıkaracaksın.",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Kaldır", style: "destructive", onPress: () => onIlceKaldir(a.ilceKey) },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View style={s.ust}>
        <Text style={s.h1}>Ayarlar</Text>
        <Pressable onPress={onKapat} hitSlop={8}><Text style={s.kapat}>Kapat</Text></Pressable>
      </View>

      <Text style={s.bolum}>Üyelik</Text>
      <View style={s.kart}>
        {pro ? (
          <>
            <Text style={s.kartBaslik}>Pro aktif ✓</Text>
            <Text style={s.kartAlt}>Sınırsız ilçe/il takibi, reklamsız kullanım, hatırlatma bildirimleri.</Text>
          </>
        ) : (
          <>
            <Text style={s.kartBaslik}>Ücretsiz sürüm</Text>
            <Text style={s.kartAlt}>
              {denemeKalanGun > 0
                ? `Hatırlatma bildirimi deneme süren: ${denemeKalanGun} gün kaldı. Süre bitince ve birden fazla ilçe eklemek istediğinde Pro'ya geçebilirsin.`
                : "Hatırlatma bildirimi deneme süren bitti. Devam etmek ve birden fazla ilçe eklemek için Pro'ya geç."}
            </Text>
            <Pressable style={s.buton} onPress={onPaywallAc}>
              <Text style={s.butonYazi}>Pro'ya geç ve fiyatları gör →</Text>
            </Pressable>
          </>
        )}
      </View>

      <Text style={s.bolum}>Bildirimler</Text>
      <View style={s.kart}>
        <Text style={s.kartBaslik}>Yeni kesinti bildirimleri</Text>
        <Text style={s.kartAlt}>
          {bildirimAcik === true ? "Açık" : bildirimAcik === false ? "Kapalı" : "Kontrol ediliyor…"}
        </Text>
        {bildirimAcik === false && (
          <Pressable style={s.buton} onPress={bildirimAcButonu}>
            <Text style={s.butonYazi}>Bildirimleri Aç</Text>
          </Pressable>
        )}
        {bildirimAcik === true && (
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={s.link}>Kapatmak için telefon bildirim ayarlarını aç ›</Text>
          </Pressable>
        )}
      </View>

      <Text style={s.bolum}>Görünüm</Text>
      <View style={s.kart}>
        <Text style={s.kartBaslik}>Açık tema</Text>
        <Text style={s.kartAlt}>Karanlık tema henüz yok, yakında eklenecek.</Text>
      </View>

      <Text style={s.bolum}>Takip ettiğim ilçeler</Text>
      {adresler.map((a) => (
        <View key={a.ilceKey} style={s.ilceSatiri}>
          <Text style={s.ilceYazi}>
            {a.ilce} <Text style={s.ilceIl}>· {a.il}</Text>
          </Text>
          <Pressable onPress={() => ilceKaldirBasildi(a)} hitSlop={8}>
            <Text style={s.kaldirYazi}>Kaldır</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: theme.space.lg, paddingTop: theme.space.xl * 1.5, minHeight: "100%" },
  ust: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.xl },
  h1: { fontSize: theme.font.hero, fontWeight: "800", color: theme.color.ink, letterSpacing: -0.5 },
  kapat: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  bolum: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, marginBottom: theme.space.sm, marginTop: theme.space.lg, letterSpacing: 0.5, textTransform: "uppercase" },
  kart: { backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, ...theme.shadow.card },
  kartBaslik: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  kartAlt: { fontSize: theme.font.small, color: theme.color.muted, marginTop: 4, lineHeight: 19 },
  buton: { backgroundColor: theme.color.elektrik, borderRadius: theme.radius.sm, paddingVertical: theme.space.sm, alignItems: "center", marginTop: theme.space.md },
  butonYazi: { color: theme.color.ink, fontWeight: "800", fontSize: theme.font.small },
  link: { color: theme.color.elektrik, fontWeight: "700", fontSize: theme.font.small, marginTop: theme.space.md },
  ilceSatiri: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, marginBottom: theme.space.sm },
  ilceYazi: { fontSize: theme.font.body, fontWeight: "700", color: theme.color.ink },
  ilceIl: { fontWeight: "500", color: theme.color.muted },
  kaldirYazi: { fontSize: theme.font.small, color: theme.color.danger, fontWeight: "700" },
});
