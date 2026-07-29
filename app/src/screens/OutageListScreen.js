import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { theme } from "../theme";
import { kesintileriGetir } from "../api/client";
import { OutageCard } from "../components/OutageCard";
import { StatusHero } from "../components/StatusHero";

export function OutageListScreen({ adres, onAdresDegistir }) {
  const [durum, setDurum] = useState("yukleniyor");
  const [liste, setListe] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const getir = useCallback(async () => {
    try {
      setDurum((d) => (d === "hazir" ? d : "yukleniyor"));
      setListe(await kesintileriGetir(adres.ilceKey));
      setDurum("hazir");
    } catch {
      setDurum("hata");
    }
  }, [adres.ilceKey]);

  useEffect(() => { getir(); }, [getir]);
  async function yenile() { setYenileniyor(true); await getir(); setYenileniyor(false); }

  const baslik = (
    <View>
      <View style={s.topbar}>
        <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
        <Pressable onPress={onAdresDegistir} hitSlop={8}><Text style={s.degistir}>İlçeyi değiştir</Text></Pressable>
      </View>
      <StatusHero bolge={adres.ilce} sonraki={liste[0]} />
      {liste.length > 0 && <Text style={s.bolum}>Yaklaşan kesintiler</Text>}
    </View>
  );

  if (durum === "hata") {
    return (
      <View style={s.wrap}>
        <View style={s.hata}>
          <Text style={s.hataBaslik}>Kesintiler alınamadı</Text>
          <Text style={s.hataAlt}>Bağlantını kontrol et ve tekrar dene.</Text>
          <Pressable style={s.tekrar} onPress={getir}><Text style={s.tekrarYazi}>Tekrar dene</Text></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      {durum === "yukleniyor" ? (
        <View style={s.orta}><ActivityIndicator color={theme.color.elektrik} /></View>
      ) : (
        <FlatList
          data={liste}
          keyExtractor={(k) => k.id}
          renderItem={({ item }) => <OutageCard k={item} />}
          ListHeaderComponent={baslik}
          ListEmptyComponent={<Text style={s.bosNot}>Şu an listelenecek planlı kesinti yok.</Text>}
          ListFooterComponent={
            <Text style={s.ibare}>
              Veriler BEDAŞ ve AYEDAŞ kaynaklıdır. Resmî bir uygulama değildir; kesin bilgi için
              sağlayıcının kendi kanalını teyit edin.
            </Text>
          }
          contentContainerStyle={s.liste}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={theme.color.elektrik} />}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg },
  orta: { flex: 1, alignItems: "center", justifyContent: "center" },
  liste: { padding: theme.space.lg, paddingTop: theme.space.md },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md },
  wordmark: { fontSize: theme.font.title, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5 },
  degistir: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  bolum: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, letterSpacing: 0.5, textTransform: "uppercase", marginTop: theme.space.lg, marginBottom: theme.space.sm },
  bosNot: { fontSize: theme.font.body, color: theme.color.muted, marginTop: theme.space.md },
  ibare: { fontSize: theme.font.tiny, color: theme.color.muted, textAlign: "center", marginTop: theme.space.lg, lineHeight: 16 },
  hata: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space.xl },
  hataBaslik: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  hataAlt: { fontSize: theme.font.body, color: theme.color.muted, marginTop: 4, textAlign: "center" },
  tekrar: { marginTop: theme.space.md, backgroundColor: theme.color.ink, paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg, borderRadius: theme.radius.sm },
  tekrarYazi: { color: "#fff", fontWeight: "700" },
});
