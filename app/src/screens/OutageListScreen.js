import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Linking } from "react-native";
import { theme } from "../theme";
import { kesintileriGetir } from "../api/client";
import { OutageCard } from "../components/OutageCard";
import { StatusHero } from "../components/StatusHero";
import { gorulenleriOku, gorulenleriYaz } from "../storage/seenOutages";
import { bildirimIzniDurumu, ilceyeAboneOl } from "../notifications/push";

export function OutageListScreen({ adres, onAdresDegistir }) {
  const [durum, setDurum] = useState("yukleniyor");
  const [liste, setListe] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [yeniVar, setYeniVar] = useState(false);
  const [bildirimAcik, setBildirimAcik] = useState(null); // null = henüz kontrol edilmedi

  const getir = useCallback(async () => {
    try {
      setDurum((d) => (d === "hazir" ? d : "yukleniyor"));
      const veri = await kesintileriGetir(adres.ilceKey);
      setListe(veri);
      const gorulenler = await gorulenleriOku();
      setYeniVar(veri.some((k) => !gorulenler.includes(k.id)));
      setDurum("hazir");
    } catch {
      setDurum("hata");
    }
  }, [adres.ilceKey]);

  useEffect(() => { getir(); }, [getir]);
  useEffect(() => { bildirimIzniDurumu().then(setBildirimAcik); }, []);

  async function yenile() { setYenileniyor(true); await getir(); setYenileniyor(false); }
  async function zilBasildi() {
    await gorulenleriYaz(liste.map((k) => k.id));
    setYeniVar(false);
  }
  async function bildirimAcButonu() {
    const sonuc = await ilceyeAboneOl(adres.ilceKey);
    setBildirimAcik(sonuc.ok);
  }

  const simdi = Date.now();
  const yaklasanlar = liste.filter((k) => Date.parse(k.bitis) >= simdi);
  const kapananlar = liste
    .filter((k) => Date.parse(k.bitis) < simdi)
    .sort((a, b) => Date.parse(b.bitis) - Date.parse(a.bitis));

  const veriParcalari = [
    ...(yaklasanlar.length ? [{ anahtar: "baslik-yaklasan", tip: "baslik", metin: "Yaklaşan kesintiler" }] : []),
    ...yaklasanlar.map((k) => ({ anahtar: k.id, tip: "kart", kesinti: k })),
    ...(kapananlar.length ? [{ anahtar: "baslik-kapanan", tip: "baslik", metin: "Kapanan kesintiler" }] : []),
    ...kapananlar.map((k) => ({ anahtar: k.id, tip: "kart", kesinti: k, kapandi: true })),
  ];

  const baslik = (
    <View>
      <View style={s.topbar}>
        <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
        <View style={s.topbarSag}>
          <Pressable onPress={zilBasildi} hitSlop={8} style={s.zil}>
            <View style={[s.zilNokta, yeniVar && s.zilNoktaAktif]} />
          </Pressable>
          <Pressable onPress={onAdresDegistir} hitSlop={8}><Text style={s.degistir}>İlçeyi değiştir</Text></Pressable>
        </View>
      </View>
      {bildirimAcik === false && (
        <Pressable style={s.bildirimBtn} onPress={bildirimAcButonu}>
          <Text style={s.bildirimBtnYazi}>🔔 Bildirimleri Aç</Text>
        </Pressable>
      )}
      <StatusHero bolge={adres.ilce} sonraki={yaklasanlar[0]} />
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
          data={veriParcalari}
          keyExtractor={(item) => item.anahtar}
          renderItem={({ item }) =>
            item.tip === "baslik" ? (
              <Text style={s.bolum}>{item.metin}</Text>
            ) : (
              <OutageCard k={item.kesinti} kapandiMi={item.kapandi} />
            )
          }
          ListHeaderComponent={baslik}
          ListEmptyComponent={<Text style={s.bosNot}>Şu an listelenecek planlı kesinti yok.</Text>}
          ListFooterComponent={
            <Text style={s.ibare}>
              İstanbul Kesinti, BEDAŞ veya herhangi bir resmi kurum tarafından geliştirilmemiştir ve
              onlarla bağlantılı değildir. Veriler{" "}
              <Text
                style={s.ibareLink}
                onPress={() => Linking.openURL("https://www.bedas.com.tr/elektrik-kesintisi-sorgulama")}
              >
                BEDAŞ'ın resmi sitesinden
              </Text>{" "}
              derlenir; kesin ve güncel bilgi için sağlayıcının kendi kanallarını teyit edin.
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
  topbarSag: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  wordmark: { fontSize: theme.font.title, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5 },
  degistir: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  zil: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  zilNokta: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.color.line },
  zilNoktaAktif: { backgroundColor: theme.color.danger },
  bildirimBtn: { backgroundColor: theme.color.elektrik, borderRadius: theme.radius.md, paddingVertical: theme.space.sm, alignItems: "center", marginBottom: theme.space.md },
  bildirimBtnYazi: { color: theme.color.ink, fontWeight: "800", fontSize: theme.font.body },
  bolum: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, letterSpacing: 0.5, textTransform: "uppercase", marginTop: theme.space.lg, marginBottom: theme.space.sm },
  bosNot: { fontSize: theme.font.body, color: theme.color.muted, marginTop: theme.space.md },
  ibare: { fontSize: theme.font.tiny, color: theme.color.muted, textAlign: "center", marginTop: theme.space.lg, lineHeight: 16 },
  ibareLink: { color: theme.color.elektrik, fontWeight: "700" },
  hata: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space.xl },
  hataBaslik: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  hataAlt: { fontSize: theme.font.body, color: theme.color.muted, marginTop: 4, textAlign: "center" },
  tekrar: { marginTop: theme.space.md, backgroundColor: theme.color.ink, paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg, borderRadius: theme.radius.sm },
  tekrarYazi: { color: "#fff", fontWeight: "700" },
});
