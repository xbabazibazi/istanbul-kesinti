import { View, Text, StyleSheet } from "react-native";
import { theme, kisaGun, trSaat } from "../theme";

// İMZA ÖĞE: "kesinti var mı?" sorusuna anında cevap.
export function StatusHero({ il, bolge, sonraki }) {
  const varMi = Boolean(sonraki);
  const nokta = varMi ? theme.color.elektrik : theme.color.ok;
  return (
    <View style={s.kart}>
      <View style={s.ust}>
        <View style={[s.nokta, { backgroundColor: nokta }]} />
        <Text style={s.etiket}>{il?.toLocaleUpperCase("tr-TR")} · {bolge?.toLocaleUpperCase("tr-TR")}</Text>
      </View>
      {varMi ? (
        <>
          <Text style={s.buyuk}>Yaklaşan kesinti</Text>
          <Text style={s.alt}>
            {kisaGun(sonraki.baslangic)} {trSaat(sonraki.baslangic)}–{trSaat(sonraki.bitis)}
            {"  ·  "}
            <Text style={{ color: theme.color.elektrik }}>
              {sonraki.hizmet === "su" ? "Su" : "Elektrik"}
            </Text>
          </Text>
        </>
      ) : (
        <>
          <Text style={s.buyuk}>Planlı kesinti yok</Text>
          <Text style={s.alt}>Yeni bir kesinti eklenirse bildirim göndeririz.</Text>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  kart: { backgroundColor: theme.color.hero, borderRadius: theme.radius.lg, padding: theme.space.lg, ...theme.shadow.card },
  ust: { flexDirection: "row", alignItems: "center", marginBottom: theme.space.md },
  nokta: { width: 9, height: 9, borderRadius: 5, marginRight: theme.space.sm },
  etiket: { color: theme.color.heroMuted, fontSize: theme.font.tiny, fontWeight: "700", letterSpacing: 1.2 },
  buyuk: { color: theme.color.heroText, fontSize: theme.font.hero, fontWeight: "800", letterSpacing: -0.5 },
  alt: { color: theme.color.heroMuted, fontSize: theme.font.body, marginTop: 6 },
});
