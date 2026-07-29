// TASARIM DİLİ
// Serin-nötr açık zemin + koyu "durum kartı" (imza öğe). İşlev renkte kodlanır:
// elektrik=amber, su=mavi, kesinti yok=yeşil. Krem/terrakota bilinçli kullanılmadı.
export const theme = {
  color: {
    bg: "#EEF1F5",
    surface: "#FFFFFF",
    hero: "#12161C", // koyu durum kartı
    heroText: "#FFFFFF",
    heroMuted: "#9AA3AF",
    ink: "#12161C",
    muted: "#667085",
    line: "#E4E8EE",
    elektrik: "#F2A93B",
    su: "#2E90FA",
    ok: "#12B76A",
    danger: "#F0443B",
  },
  space: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  radius: { sm: 10, md: 16, lg: 22 },
  font: { hero: 30, title: 24, heading: 17, body: 15, small: 13, tiny: 11 },
  shadow: {
    // hafif yükseklik — RN'de platforma göre
    card: {
      shadowColor: "#0B1220", shadowOpacity: 0.06, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 2,
    },
  },
};

// Yardımcılar — tarih/saat biçimi tek yerde
export function trGun(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", weekday: "long" });
}
export function trSaat(iso) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}
export function sureSaat(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 36e5));
}
// "Bugün / Yarın / Cuma" gibi kısa gün etiketi (durum kartı için)
export function kisaGun(iso) {
  const d = new Date(iso); const bugun = new Date();
  const fark = Math.floor((d.setHours(0,0,0,0) - bugun.setHours(0,0,0,0)) / 864e5);
  if (fark <= 0) return "Bugün";
  if (fark === 1) return "Yarın";
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long" });
}
