import { useState, useEffect } from "react";
import { Text, StyleSheet, Pressable, ScrollView, Linking, View, BackHandler } from "react-native";
import { theme } from "../theme";
import { ILLER } from "../data/iller";

// Tek iş: ilçe seç, geri bildir. Kaydetme/abonelik App.js'te (ilceEkle) yapılır.
// onIptal verilmişse bu ekran "ilçe ekleme" modundadır (ilk kurulum değil).
// onOnizle verilmişse bu ekran "sadece bak" modundadır: seçim listeye
// KAYDEDİLMEZ, sadece geçici olarak görüntülenir (Pro gerektirmez — herkes
// istediği ilçeye merak edip bakabilsin, sadece BİRDEN FAZLA ilçeyi kalıcı
// TAKİP ETMEK Pro'ya bağlı).
// İki adım: önce il seç, sonra o ilin ilçe listesi gelir (tek uzun liste kafa
// karıştırıyordu — hangi ilin altında olunduğu belli olmuyordu).
export function AddressPickerScreen({ onKaydedildi, onOnizle, onIptal, secilenIlceKeyleri = [] }) {
  const [seciliIl, setSeciliIl] = useState(null);

  // Android geri tuşu: ilçe adımındaysa il listesine dön, il adımındaysa (varsa) vazgeç.
  useEffect(() => {
    const geriTusu = () => {
      if (seciliIl) {
        setSeciliIl(null);
        return true;
      }
      if (onIptal) {
        onIptal();
        return true;
      }
      return false;
    };
    const abonelik = BackHandler.addEventListener("hardwareBackPress", geriTusu);
    return () => abonelik.remove();
  }, [seciliIl, onIptal]);

  const ilVeri = ILLER.find((x) => x.il === seciliIl);

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View style={s.ust}>
        {seciliIl ? (
          <Pressable onPress={() => setSeciliIl(null)} hitSlop={12} style={s.geriBtn}>
            <Text style={s.geriBtnYazi}>‹ Geri (İller)</Text>
          </Pressable>
        ) : (
          <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
        )}
        {!seciliIl && onIptal && <Pressable onPress={onIptal} hitSlop={8}><Text style={s.iptal}>Vazgeç</Text></Pressable>}
      </View>

      {!ilVeri ? (
        <>
          <Text style={s.h1}>{onOnizle ? "Bir ilçeye bak" : onIptal ? "Yeni il/ilçe ekle" : "İlini seç"}</Text>
          <Text style={s.alt}>
            {onOnizle
              ? "İstediğin ilçeye ücretsiz bak, kaydetmeden."
              : onIptal
              ? "Takip listene bir il/ilçe daha ekle."
              : "Önce ilini, sonra ilçeni seç; planlı kesinti olunca haber verelim. Hesap gerekmez."}
          </Text>
          {ILLER.map(({ il, ilceler }) => (
            <Pressable
              key={il}
              style={({ pressed }) => [s.satir, pressed && s.basili]}
              onPress={() => setSeciliIl(il)}
            >
              <Text style={s.satirYazi}>{il}</Text>
              <Text style={s.ilceSayisi}>{ilceler.length} ilçe ›</Text>
            </Pressable>
          ))}
        </>
      ) : (
        <>
          <Text style={s.h1}>{seciliIl}</Text>
          <Text style={s.alt}>İlçeni seç.</Text>
          {ilVeri.ilceler.map((i) => {
            const eklendi = !onOnizle && secilenIlceKeyleri.includes(i.key);
            return (
              <Pressable
                key={i.key}
                disabled={eklendi}
                style={({ pressed }) => [s.satir, pressed && s.basili, eklendi && s.satirEklendi]}
                onPress={() =>
                  onOnizle
                    ? onOnizle({ il: seciliIl, ilce: i.ad, ilceKey: i.key })
                    : onKaydedildi({ il: seciliIl, ilce: i.ad, ilceKey: i.key })
                }
              >
                <Text style={[s.satirYazi, eklendi && s.satirYaziEklendi]}>{i.ad}</Text>
                {eklendi && <Text style={s.eklendiRozet}>Ekli</Text>}
              </Pressable>
            );
          })}
        </>
      )}

      <Text style={s.dipnot}>
        Kesinti, BEDAŞ, AEDAŞ veya herhangi bir resmi kurum tarafından geliştirilmemiştir
        ve onlarla bağlantılı değildir. Veriler ilgili elektrik dağıtım şirketlerinin{" "}
        <Text style={s.dipnotLink} onPress={() => Linking.openURL("https://www.bedas.com.tr/elektrik-kesintisi-sorgulama")}>
          (BEDAŞ
        </Text>
        ,{" "}
        <Text style={s.dipnotLink} onPress={() => Linking.openURL("https://kesinti.akdenizedas.com.tr/")}>
          AEDAŞ)
        </Text>{" "}
        resmi sitelerinden derlenir.
      </Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: theme.space.lg, paddingTop: theme.space.xl * 2, minHeight: "100%" },
  ust: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.xl },
  wordmark: { fontSize: theme.font.title, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5 },
  geriBtn: { flexDirection: "row", alignItems: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.sm, paddingVertical: 8, paddingHorizontal: 14 },
  geriBtnYazi: { fontSize: theme.font.body, color: theme.color.ink, fontWeight: "800" },
  iptal: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  h1: { fontSize: theme.font.hero, fontWeight: "800", color: theme.color.ink, letterSpacing: -0.5 },
  alt: { fontSize: theme.font.body, color: theme.color.muted, marginTop: 6, marginBottom: theme.space.xl, lineHeight: 21 },
  satir: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, marginBottom: theme.space.sm, ...theme.shadow.card },
  basili: { backgroundColor: "#F7F9FC" },
  satirEklendi: { opacity: 0.5, shadowOpacity: 0 },
  satirYazi: { fontSize: theme.font.heading, color: theme.color.ink, fontWeight: "700" },
  satirYaziEklendi: { color: theme.color.muted },
  ilceSayisi: { fontSize: theme.font.small, color: theme.color.muted, fontWeight: "600" },
  eklendiRozet: { fontSize: theme.font.tiny, color: theme.color.ok, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  dipnot: { fontSize: theme.font.small, color: theme.color.muted, marginTop: theme.space.lg, textAlign: "center", lineHeight: 18 },
  dipnotLink: { color: theme.color.elektrik, fontWeight: "700" },
});
