import { Text, StyleSheet, Pressable, ScrollView, Linking, View } from "react-native";
import { theme } from "../theme";
import { IL, ILCELER } from "../data/ilceler";

// Ekran her seferinde yeniden monte olabildiği için scroll pozisyonu modül
// seviyesinde tutulur; kullanıcı listede aşağıdaysa geri dönünce en başa atmasın.
let sonKaydirma = 0;

// Tek iş: ilçe seç, geri bildir. Kaydetme/abonelik App.js'te (ilceEkle) yapılır.
// onIptal verilmişse bu ekran "ilçe ekleme" modundadır (ilk kurulum değil).
export function AddressPickerScreen({ onKaydedildi, onIptal, secilenIlceKeyleri = [] }) {
  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      showsVerticalScrollIndicator={false}
      contentOffset={{ x: 0, y: sonKaydirma }}
      onScroll={(e) => { sonKaydirma = e.nativeEvent.contentOffset.y; }}
      scrollEventThrottle={32}
    >
      <View style={s.ust}>
        <Text style={s.wordmark}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text></Text>
        {onIptal && <Pressable onPress={onIptal} hitSlop={8}><Text style={s.iptal}>Vazgeç</Text></Pressable>}
      </View>
      <Text style={s.h1}>{onIptal ? "Yeni ilçe ekle" : "İlçeni seç"}</Text>
      <Text style={s.alt}>
        {onIptal
          ? "Takip listene bir ilçe daha ekle."
          : "Bir kez seç; planlı kesinti olunca haber verelim. Hesap gerekmez."}
      </Text>
      <Text style={s.etiket}>İstanbul · İlçe</Text>
      {ILCELER.map((i) => {
        const eklendi = secilenIlceKeyleri.includes(i.key);
        return (
          <Pressable
            key={i.key}
            disabled={eklendi}
            style={({ pressed }) => [s.satir, pressed && s.basili, eklendi && s.satirEklendi]}
            onPress={() => onKaydedildi({ il: IL, ilce: i.ad, ilceKey: i.key })}
          >
            <Text style={[s.satirYazi, eklendi && s.satirYaziEklendi]}>{i.ad}</Text>
            {eklendi && <Text style={s.eklendiRozet}>Ekli</Text>}
          </Pressable>
        );
      })}
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
  ust: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.xl },
  wordmark: { fontSize: theme.font.title, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5 },
  iptal: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  h1: { fontSize: theme.font.hero, fontWeight: "800", color: theme.color.ink, letterSpacing: -0.5 },
  alt: { fontSize: theme.font.body, color: theme.color.muted, marginTop: 6, marginBottom: theme.space.xl, lineHeight: 21 },
  etiket: { fontSize: theme.font.small, fontWeight: "800", color: theme.color.muted, marginBottom: theme.space.sm, letterSpacing: 0.5, textTransform: "uppercase" },
  satir: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, marginBottom: theme.space.sm, ...theme.shadow.card },
  basili: { backgroundColor: "#F7F9FC" },
  satirEklendi: { opacity: 0.5, shadowOpacity: 0 },
  satirYazi: { fontSize: theme.font.heading, color: theme.color.ink, fontWeight: "700" },
  satirYaziEklendi: { color: theme.color.muted },
  eklendiRozet: { fontSize: theme.font.tiny, color: theme.color.ok, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  dipnot: { fontSize: theme.font.small, color: theme.color.muted, marginTop: theme.space.lg, textAlign: "center", lineHeight: 18 },
  dipnotLink: { color: theme.color.elektrik, fontWeight: "700" },
});
