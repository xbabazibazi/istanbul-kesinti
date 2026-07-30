import { Text, StyleSheet, Pressable, ScrollView, Linking } from "react-native";
import { theme } from "../theme";
import { IL, ILCELER } from "../data/ilceler";
import { adresiKaydet } from "../storage/savedAddress";
import { ilceyeAboneOl } from "../notifications/push";

// Tek iş: ilçe seç, kaydet, bildirime abone ol. Hesap yok.
export function AddressPickerScreen({ onKaydedildi }) {
  async function sec(i) {
    const adres = { il: IL, ilce: i.ad, ilceKey: i.key };
    await adresiKaydet(adres);
    await ilceyeAboneOl(i.key);
    onKaydedildi(adres);
  }
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
      <Text style={s.h1}>İlçeni seç</Text>
      <Text style={s.alt}>Bir kez seç; planlı kesinti olunca haber verelim. Hesap gerekmez.</Text>
      <Text style={s.etiket}>İstanbul · İlçe</Text>
      {ILCELER.map((i) => (
        <Pressable key={i.key} style={({ pressed }) => [s.satir, pressed && s.basili]} onPress={() => sec(i)}>
          <Text style={s.satirYazi}>{i.ad}</Text>
        </Pressable>
      ))}
      <Text style={s.dipnot}>
        İstanbul Kesinti, BEDAŞ veya herhangi bir resmi kurum tarafından geliştirilmemiştir ve
        onlarla bağlantılı değildir. Veriler{" "}
        <Text
          style={s.dipnotLink}
          onPress={() => Linking.openURL("https://www.bedas.com.tr/elektrik-kesintisi-sorgulama")}
        >
          BEDAŞ'ın resmi sitesinden
        </Text>{" "}
        derlenir.
      </Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: theme.space.lg, paddingTop: theme.space.xl * 2, minHeight: "100%" },
  wordmark: { fontSize: theme.font.title, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5, marginBottom: theme.space.xl },
  h1: { fontSize: theme.font.hero, fontWeight: "800", color: theme.color.ink, letterSpacing: -0.5 },
  alt: { fontSize: theme.font.body, color: theme.color.muted, marginTop: 6, marginBottom: theme.space.xl, lineHeight: 21 },
  etiket: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, marginBottom: theme.space.sm, letterSpacing: 0.5, textTransform: "uppercase" },
  satir: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, marginBottom: theme.space.sm, ...theme.shadow.card },
  basili: { backgroundColor: "#F7F9FC" },
  satirYazi: { fontSize: theme.font.heading, color: theme.color.ink, fontWeight: "700" },
  dipnot: { fontSize: theme.font.small, color: theme.color.muted, marginTop: theme.space.lg, textAlign: "center", lineHeight: 18 },
  dipnotLink: { color: theme.color.elektrik, fontWeight: "700" },
});
