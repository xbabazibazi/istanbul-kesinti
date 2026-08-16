import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { theme } from "../theme";
import { teklifleriGetir, satinAl, geriYukle, satinAlmalarAktifMi } from "../iap/purchases";

const OZELLIKLER = [
  "Sınırsız ilçe takibi",
  "Reklamsız kullanım",
  "Kesintiden ~1 gün önce hatırlatma",
];

export function PaywallScreen({ onKapat, onBasarili }) {
  const [durum, setDurum] = useState("yukleniyor"); // yukleniyor | hazir | kurulu-degil | hata
  const [teklif, setTeklif] = useState(null);
  const [satinAliniyor, setSatinAliniyor] = useState(false);

  useEffect(() => {
    if (!satinAlmalarAktifMi()) {
      setDurum("kurulu-degil");
      return;
    }
    teklifleriGetir()
      .then((t) => {
        setTeklif(t);
        setDurum("hazir");
      })
      .catch(() => setDurum("hata"));
  }, []);

  async function paketSecildi(paket) {
    setSatinAliniyor(true);
    try {
      const basarili = await satinAl(paket);
      if (basarili) onBasarili();
    } catch (err) {
      if (!err.userCancelled) {
        Alert.alert("Satın alma tamamlanamadı", "Lütfen tekrar dene.");
      }
    } finally {
      setSatinAliniyor(false);
    }
  }

  async function geriYukleBasildi() {
    setSatinAliniyor(true);
    try {
      const proMu = await geriYukle();
      if (proMu) {
        onBasarili();
      } else {
        Alert.alert("Aktif abonelik bulunamadı", "Bu hesapla ilişkili bir Pro aboneliği bulunamadı.");
      }
    } catch {
      Alert.alert("Geri yükleme başarısız", "Lütfen tekrar dene.");
    } finally {
      setSatinAliniyor(false);
    }
  }

  return (
    <View style={s.wrap}>
      <View style={s.ust}>
        <Pressable onPress={onKapat} hitSlop={8}><Text style={s.kapat}>Vazgeç</Text></Pressable>
      </View>
      <Text style={s.h1}>kesinti<Text style={{ color: theme.color.elektrik }}>.</Text> Pro</Text>
      <View style={s.ozellikler}>
        {OZELLIKLER.map((o) => (
          <View key={o} style={s.ozellikSatiri}>
            <Text style={s.ozellikTik}>✓</Text>
            <Text style={s.ozellikYazi}>{o}</Text>
          </View>
        ))}
      </View>

      {durum === "yukleniyor" && <ActivityIndicator color={theme.color.elektrik} style={s.orta} />}

      {durum === "kurulu-degil" && (
        <Text style={s.bilgi}>Satın alma şu anda kullanılamıyor. Lütfen daha sonra tekrar dene.</Text>
      )}

      {durum === "hata" && <Text style={s.bilgi}>Paketler yüklenemedi. Lütfen tekrar dene.</Text>}

      {durum === "hazir" && teklif && (
        <View style={s.paketler}>
          {teklif.availablePackages.map((p) => (
            <Pressable
              key={p.identifier}
              style={s.paket}
              disabled={satinAliniyor}
              onPress={() => paketSecildi(p)}
            >
              <Text style={s.paketBaslik}>{p.product.title}</Text>
              <Text style={s.paketFiyat}>{p.product.priceString}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {durum === "hazir" && teklif && !teklif.availablePackages.length && (
        <Text style={s.bilgi}>Şu anda satın alınabilir paket yok.</Text>
      )}

      <Pressable onPress={geriYukleBasildi} disabled={satinAliniyor} hitSlop={8}>
        <Text style={s.geriYukle}>Satın almaları geri yükle</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg, padding: theme.space.lg, paddingTop: theme.space.xl * 2 },
  ust: { flexDirection: "row", justifyContent: "flex-end", marginBottom: theme.space.lg },
  kapat: { fontSize: theme.font.body, color: theme.color.muted, fontWeight: "600" },
  h1: { fontSize: theme.font.hero, fontWeight: "900", color: theme.color.ink, letterSpacing: -0.5, marginBottom: theme.space.xl },
  ozellikler: { marginBottom: theme.space.xl },
  ozellikSatiri: { flexDirection: "row", alignItems: "center", marginBottom: theme.space.sm },
  ozellikTik: { color: theme.color.elektrik, fontWeight: "800", marginRight: theme.space.sm, fontSize: theme.font.heading },
  ozellikYazi: { fontSize: theme.font.body, color: theme.color.ink },
  orta: { marginTop: theme.space.xl },
  bilgi: { fontSize: theme.font.body, color: theme.color.muted, textAlign: "center", marginTop: theme.space.lg },
  paketler: { gap: theme.space.sm },
  paket: { backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderRadius: theme.radius.md, padding: theme.space.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paketBaslik: { fontSize: theme.font.heading, fontWeight: "700", color: theme.color.ink },
  paketFiyat: { fontSize: theme.font.heading, fontWeight: "800", color: theme.color.elektrik },
  geriYukle: { fontSize: theme.font.small, color: theme.color.muted, fontWeight: "600", textAlign: "center", marginTop: theme.space.xl },
});
