import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { theme, trGun, trSaat, sureSaat } from "../theme";
import { haritadaAc } from "../utils/maps";

export function OutageCard({ k, kapandiMi }) {
  const renk = kapandiMi ? theme.color.muted : k.hizmet === "su" ? theme.color.su : theme.color.elektrik;
  return (
    <View style={[s.kart, theme.shadow.card, kapandiMi && s.kartKapandi]}>
      <View style={[s.serit, { backgroundColor: renk }]} />
      <View style={s.icerik}>
        <View style={s.rozetSatir}>
          <View style={[s.rozet, { backgroundColor: renk + "22" }]}>
            <Text style={[s.rozetYazi, { color: renk }]}>{k.hizmet === "su" ? "SU" : "ELEKTRİK"}</Text>
          </View>
          <Text style={s.saglayici}>{k.saglayici}</Text>
          {kapandiMi && (
            <View style={s.kapandiRozet}><Text style={s.kapandiYazi}>KAPANDI</Text></View>
          )}
        </View>
        <Text style={s.tarih}>{trGun(k.baslangic)}</Text>
        <Text style={s.saat}>
          {trSaat(k.baslangic)} – {trSaat(k.bitis)}
          <Text style={s.sure}>  ·  ~{sureSaat(k.baslangic, k.bitis)} saat</Text>
        </Text>
        {k.mahalle ? <Text style={s.mahalle}>Etkilenen: {k.mahalle}</Text> : null}
        {k.sebep ? <Text style={s.sebep}>{k.sebep}</Text> : null}
        {k.message ? (
          <View style={s.caddeKutu}>
            <Text style={s.caddeBaslik}>ETKİLENEN CADDE / SOKAK</Text>
            <Text style={s.caddeYazi}>{k.message}</Text>
          </View>
        ) : null}
        {k.kaynakUrl ? (
          <Pressable onPress={() => Linking.openURL(k.kaynakUrl)} hitSlop={4}>
            <Text style={s.kaynak}>Kaynak: {k.saglayici} resmi sitesi ↗</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}
          onPress={() => haritadaAc({ lat: k.lat, lng: k.lng, etiket: `${k.ilce} kesinti` })}
        >
          <Text style={s.btnYazi}>Haritada aç</Text>
        </Pressable>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  kart: { flexDirection: "row", backgroundColor: theme.color.surface, borderRadius: theme.radius.md, marginBottom: theme.space.md, overflow: "hidden" },
  kartKapandi: { opacity: 0.6 },
  kapandiRozet: { marginLeft: "auto", backgroundColor: theme.color.line, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  kapandiYazi: { fontSize: theme.font.tiny, fontWeight: "800", letterSpacing: 0.6, color: theme.color.muted },
  serit: { width: 5 },
  icerik: { flex: 1, padding: theme.space.md },
  rozetSatir: { flexDirection: "row", alignItems: "center", marginBottom: theme.space.sm },
  rozet: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: theme.space.sm },
  rozetYazi: { fontSize: theme.font.tiny, fontWeight: "800", letterSpacing: 0.6 },
  saglayici: { fontSize: theme.font.small, color: theme.color.muted, fontWeight: "600" },
  tarih: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  saat: { fontSize: theme.font.body, color: theme.color.ink, marginTop: 2 },
  sure: { color: theme.color.muted },
  mahalle: { fontSize: theme.font.small, color: theme.color.ink, marginTop: 6, fontWeight: "600" },
  sebep: { fontSize: theme.font.small, color: theme.color.muted, marginTop: 3 },
  caddeKutu: { backgroundColor: theme.color.bg, borderRadius: theme.radius.sm, padding: theme.space.sm, marginTop: theme.space.sm },
  caddeBaslik: { fontSize: theme.font.tiny, fontWeight: "800", color: theme.color.muted, letterSpacing: 0.4, marginBottom: 3 },
  caddeYazi: { fontSize: theme.font.small, color: theme.color.ink, lineHeight: 18 },
  kaynak: { fontSize: theme.font.tiny, color: theme.color.elektrik, marginTop: 8, fontWeight: "700" },
  btn: { alignSelf: "flex-start", marginTop: theme.space.md, paddingVertical: 9, paddingHorizontal: theme.space.md, backgroundColor: theme.color.ink, borderRadius: theme.radius.sm },
  btnYazi: { color: "#fff", fontSize: theme.font.body, fontWeight: "700" },
});
