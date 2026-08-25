import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, BackHandler } from "react-native";
import { theme } from "../theme";
import { kesintileriGetir } from "../api/client";
import { OutageCard } from "../components/OutageCard";
import { StatusHero } from "../components/StatusHero";

// Herhangi bir ilçeye ÜCRETSİZ ve SINIRSIZ bakma ekranı — takip listesine
// EKLEMEZ, sadece o anki kesinti durumunu gösterir. Kaydetme (Pro'ya bağlı
// olabilir) ayrı bir buton, App.js'teki gerçek ekleme akışını kullanır.
export function OnizlemeScreen({ adres, zatenTakipte, onGeri, onEkle }) {
  const [durum, setDurum] = useState("yukleniyor");
  const [liste, setListe] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const getir = useCallback(async () => {
    try {
      setDurum((d) => (d === "hazir" ? d : "yukleniyor"));
      const veri = await kesintileriGetir(adres.ilceKey);
      setListe(veri);
      setDurum("hazir");
    } catch {
      setDurum("hata");
    }
  }, [adres.ilceKey]);

  useEffect(() => { getir(); }, [getir]);

  useEffect(() => {
    const geriTusu = () => {
      onGeri();
      return true;
    };
    const abonelik = BackHandler.addEventListener("hardwareBackPress", geriTusu);
    return () => abonelik.remove();
  }, [onGeri]);

  async function yenile() { setYenileniyor(true); await getir(); setYenileniyor(false); }

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
      <Pressable onPress={onGeri} hitSlop={12} style={s.geriBtn}>
        <Text style={s.geriBtnYazi}>‹ Geri</Text>
      </Pressable>
      <View style={s.onizlemeRozet}>
        <Text style={s.onizlemeRozetYazi}>ÖNİZLEME — takip listende değil</Text>
      </View>
      <StatusHero il={adres.il} bolge={adres.ilce} sonraki={yaklasanlar[0]} />
      {zatenTakipte ? (
        <View style={s.zatenKutu}><Text style={s.zatenYazi}>Bu ilçe zaten takip listende.</Text></View>
      ) : (
        <Pressable style={s.ekleBtn} onPress={onEkle}>
          <Text style={s.ekleBtnYazi}>+ Bu ilçeyi takip listeme ekle</Text>
        </Pressable>
      )}
    </View>
  );

  if (durum === "hata") {
    return (
      <View style={s.wrap}>
        <Pressable onPress={onGeri} hitSlop={12} style={[s.geriBtn, { margin: theme.space.lg }]}>
          <Text style={s.geriBtnYazi}>‹ Geri</Text>
        </Pressable>
        <View style={s.hata}>
          <Text style={s.hataBaslik}>Kesintiler alınamadı</Text>
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
  geriBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.sm, paddingVertical: 8, paddingHorizontal: 14, marginBottom: theme.space.md },
  geriBtnYazi: { fontSize: theme.font.body, color: theme.color.ink, fontWeight: "800" },
  onizlemeRozet: { alignSelf: "flex-start", backgroundColor: theme.color.elektrik + "22", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: theme.space.sm },
  onizlemeRozetYazi: { fontSize: theme.font.tiny, fontWeight: "800", color: theme.color.elektrik, letterSpacing: 0.4 },
  zatenKutu: { marginTop: theme.space.md },
  zatenYazi: { fontSize: theme.font.small, color: theme.color.muted, fontWeight: "600" },
  ekleBtn: { backgroundColor: theme.color.elektrik, borderRadius: theme.radius.md, paddingVertical: theme.space.sm, alignItems: "center", marginTop: theme.space.md },
  ekleBtnYazi: { color: theme.color.ink, fontWeight: "800", fontSize: theme.font.body },
  bolum: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, letterSpacing: 0.5, textTransform: "uppercase", marginTop: theme.space.lg, marginBottom: theme.space.sm },
  bosNot: { fontSize: theme.font.body, color: theme.color.muted, marginTop: theme.space.md },
  hata: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space.xl },
  hataBaslik: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  tekrar: { marginTop: theme.space.md, backgroundColor: theme.color.ink, paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg, borderRadius: theme.radius.sm },
  tekrarYazi: { color: "#fff", fontWeight: "700" },
});
