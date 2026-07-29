// Android: cihazın harita uygulamasını geo: intent ile aç. Açılamazsa
// (harita uygulaması yoksa) Google Maps web'e düş. Kendi harita motoru yok.
import { Linking } from "react-native";

export function haritadaAc({ lat, lng, etiket }) {
  const isim = encodeURIComponent(etiket || "Kesinti bölgesi");
  const konumVar = lat != null && lng != null;
  const geoUrl = konumVar ? `geo:${lat},${lng}?q=${lat},${lng}(${isim})` : `geo:0,0?q=${isim}`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${konumVar ? `${lat},${lng}` : isim}`;
  return Linking.openURL(geoUrl).catch(() => Linking.openURL(webUrl));
}
