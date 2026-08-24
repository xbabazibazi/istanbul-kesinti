import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Linking, Alert, ScrollView } from "react-native";
import { theme } from "../theme";
import { kesintileriGetir } from "../api/client";
import { OutageCard } from "../components/OutageCard";
import { ReklamBanner } from "../components/ReklamBanner";
import { StatusHero } from "../components/StatusHero";
import { gorulenleriOku, gorulenleriYaz } from "../storage/seenOutages";
import { bildirimIzniDurumu, ilceyeAboneOl, hatirlaticiKur } from "../notifications/push";
import { MAX_UCRETSIZ_ILCE } from "../storage/proDurumu";

export function OutageListScreen({ adresler, pro, onIlceEkle, onIlceKaldir, onProDegistir, onPaywallAc }) {
  const [seciliIlceKey, setSeciliIlceKey] = useState(adresler[0].ilceKey);
  const [durum, setDurum] = useState("yukleniyor");
  const [liste, setListe] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [yeniVar, setYeniVar] = useState(false);
  const [bildirimAcik, setBildirimAcik] = useState(null); // null = henüz kontrol edilmedi

  // Seçili ilçe listeden kaldırılırsa (örn. "Kaldır" ile) ilk ilçeye geri dön.
  useEffect(() => {
    if (!adresler.some((a) => a.ilceKey === seciliIlceKey)) {
      setSeciliIlceKey(adresler[0]?.ilceKey);
    }
  }, [adresler, seciliIlceKey]);

  const adres = adresler.find((a) => a.ilceKey === seciliIlceKey) ?? adresler[0];

  const getir = useCallback(async () => {
    try {
      setDurum((d) => (d === "hazir" ? d : "yukleniyor"));
      const veri = await kesintileriGetir(adres.ilceKey);
      setListe(veri);
      const gorulenler = await gorulenleriOku();
      setYeniVar(veri.some((k) => !gorulenler.includes(k.id)));
      setDurum("hazir");
      if (pro) {
        const simdi = Date.now();
        veri.filter((k) => Date.parse(k.bitis) >= simdi).forEach(hatirlaticiKur);
      }
    } catch {
      setDurum("hata");
    }
  }, [adres.ilceKey, pro]);

  useEffect(() => { getir(); }, [getir]);
  useEffect(() => { bildirimIzniDurumu().then(setBildirimAcik); }, []);

  async function yenile() { setYenileniyor(true); await getir(); setYenileniyor(false); }
  async function zilBasildi() {
    await gorulenleriYaz(liste.map((k) => k.id));
    setYeniVar(false);
  }
  async function bildirimAcButonu() {
    const sonuclar = await Promise.all(adresler.map((a) => ilceyeAboneOl(a.ilceKey)));
    setBildirimAcik(sonuclar.some((s) => s.ok));
  }
  function ilceEkleBasildi() {
    if (!pro && adresler.length >= MAX_UCRETSIZ_ILCE) {
      Alert.alert(
        "Pro'ya geç",
        "Ücretsiz sürümde en fazla 1 ilçe takip edebilirsin. Birden fazla ilçeyi (ev, iş, aile) aynı anda takip etmek için Pro'ya geç.",
        [
          { text: "Vazgeç", style: "cancel" },
          { text: "Pro'ya geç", onPress: onPaywallAc },
        ]
      );
      return;
    }
    onIlceEkle();
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
        {/* DEV: gerçek satın alma kurulana kadar Pro durumunu test etmek için uzun bas.
            __DEV__ kontrolü olmadan bu, yayınlanan build'de herkesin Pro'yu
            ücretsiz açabileceği bir açık olurdu. */}
        <Pressable onLongPress={__DEV__ ? onProDegistir : undefined}>
          <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
        </Pressable>
        <View style={s.topbarSag}>
          <Pressable onPress={zilBasildi} hitSlop={8} style={s.zil}>
            <View style={[s.zilNokta, yeniVar && s.zilNoktaAktif]} />
          </Pressable>
          {pro && <View style={s.proRozet}><Text style={s.proRozetYazi}>PRO</Text></View>}
        </View>
      </View>

      {adresler.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cipSatiri} contentContainerStyle={s.cipIcerik}>
          {adresler.map((a) => (
            <Pressable
              key={a.ilceKey}
              onPress={() => setSeciliIlceKey(a.ilceKey)}
              onLongPress={() => ilceKaldirBasildi(a)}
              style={[s.cip, a.ilceKey === seciliIlceKey && s.cipAktif]}
            >
              <Text style={[s.cipYazi, a.ilceKey === seciliIlceKey && s.cipYaziAktif]}>{a.ilce}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {bildirimAcik === false && (
        <Pressable style={s.bildirimBtn} onPress={bildirimAcButonu}>
          <Text style={s.bildirimBtnYazi}>🔔 Bildirimleri Aç</Text>
        </Pressable>
      )}
      <StatusHero bolge={adres.ilce} sonraki={yaklasanlar[0]} />

      <View style={s.altSatir}>
        {adresler.length > 1 && <Text style={s.altSatirIpucu}>İlçeyi değiştirmek için üstteki sekmeye dokun, kaldırmak için basılı tut.</Text>}
        <Pressable onPress={ilceEkleBasildi} hitSlop={8} style={s.ilceEkleBtn}>
          <Text style={s.ilceEkleYazi}>{pro ? "+ İlçe ekle" : "+ İlçe ekle (Pro)"}</Text>
        </Pressable>
      </View>
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
      <ReklamBanner pro={pro} />
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
  zil: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  zilNokta: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.color.line },
  zilNoktaAktif: { backgroundColor: theme.color.danger },
  proRozet: { backgroundColor: theme.color.ink, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  proRozetYazi: { color: theme.color.elektrik, fontSize: theme.font.tiny, fontWeight: "800", letterSpacing: 0.6 },
  cipSatiri: { marginBottom: theme.space.md },
  cipIcerik: { gap: theme.space.sm },
  cip: { paddingHorizontal: theme.space.md, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line },
  cipAktif: { backgroundColor: theme.color.ink, borderColor: theme.color.ink },
  cipYazi: { fontSize: theme.font.small, fontWeight: "700", color: theme.color.ink },
  cipYaziAktif: { color: "#fff" },
  bildirimBtn: { backgroundColor: theme.color.elektrik, borderRadius: theme.radius.md, paddingVertical: theme.space.sm, alignItems: "center", marginBottom: theme.space.md },
  bildirimBtnYazi: { color: theme.color.ink, fontWeight: "800", fontSize: theme.font.body },
  altSatir: { marginTop: theme.space.md },
  altSatirIpucu: { fontSize: theme.font.tiny, color: theme.color.muted, marginBottom: theme.space.sm },
  ilceEkleBtn: { alignSelf: "flex-start" },
  ilceEkleYazi: { fontSize: theme.font.small, color: theme.color.muted, fontWeight: "700" },
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
