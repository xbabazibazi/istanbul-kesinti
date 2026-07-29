# İstanbul Kesinti (Android)

İstanbul için planlı elektrik kesintisi bildiren, **hesap gerektirmeyen** Android uygulaması.
Expo / React Native. Backend, dağıtım şirketlerinin (BEDAŞ + AYEDAŞ) verisini tek şemaya
çevirip saklar; uygulama sadece o temiz veriyi gösterir ve bildirim atar.

## Yapı

```
istanbul-kesinti/
├── app/        Expo / React Native uygulaması (Android)
│   └── eas.json  EAS derleme ayarı (apk / aab)
└── scraper/    Node.js toplayıcı (çek → normalize → sakla → bildir)
```

Mimari: kırılgan veri çekme işi telefonda değil, arka planda. Uygulama sadece
`{ kesintiler: [...] }` temiz JSON tüketir. Sağlayıcı sitesi değişince sadece adapter'ı
düzeltirsin, uygulamayı değil.

## Geliştirmede çalıştırma

Gereken: Node 18+ ve telefonda **Expo Go** (Play Store).

```bash
cd app
npm install
npm run android         # veya: npx expo start → QR'ı Expo Go ile okut
```

Backend yokken uygulama paketlenmiş **mock** veriyle çalışır (ekranlar ilk günden dolu).
Gerçek backend'e bağlamak:

```bash
EXPO_PUBLIC_API_BASE="https://<backend>/kesintiler.json" npm run android
```

## Toplayıcı (backend)

```bash
cd scraper
npm run mock            # gerçek endpoint olmadan mock ile dener
npm start               # endpoint'ler tanımlıysa canlı çeker
```

Çıktı `scraper/data/kesintiler.json`. Bunu statik hosting / Firebase Storage / küçük bir API'ye
koy, uygulamanın `EXPO_PUBLIC_API_BASE`'ine ver. Üretimde `npm start`'ı 3-4 saatte bir cron
veya serverless (Cloud Functions) ile çalıştır.

## Play Store'a çıkış (Android) — adımlar

1. **Google Play Console** hesabı (tek seferlik 25$).
2. Uygulama kimliği: `app.json` içindeki `android.package` alanını kendi domainine göre değiştir
   (ör. `com.seninadin.istanbulkesinti`). Her sürümde `android.versionCode` artır.
3. Görseller: uygulama ikonu, açılış ekranı, en az 2 ekran görüntüsü, kısa/uzun açıklama.
4. **Gizlilik politikası URL'i** — bildirim kullandığın için Play Console zorunlu tutar.
5. Derleme (EAS):
   ```bash
   npm install -g eas-cli && eas login
   eas build -p android --profile preview      # elde test için .apk
   eas build -p android --profile production    # mağaza için .aab
   ```
6. Play Console'da önce **iç test (internal testing)** kanalına yükle, cihazda dene, sonra
   üretime taşı.

## Yayından önce yapılması ŞART olanlar (kod içinde `TODO`)

1. **BEDAŞ: BAĞLANDI.** `POST https://www.bedas.com.tr/elektrik-getir` gerçek yanıtına göre
   ayrıştırılıyor (bkz. `scraper/src/adapters/bedas.js`). Not: eşleştirme İLÇE bazında; BEDAŞ
   temiz mahalle alanı vermiyor, mahalle `message` metninden en iyi çabayla ayıklanıyor.
   Canlıya alırken POST gövdesi gerekiyorsa `BEDAS_BODY` ile ver (yanıt tüm listeyi döndürdüğü
   için muhtemelen boş yeterli).
2. **AYEDAŞ: keşif bekliyor.** Anadolu yakası için `ayedas.js` hâlâ mock. BEDAŞ'taki aynı
   yöntemle (F12 → Network) gerçek ucu bulup `parse()`'ı doldur.
3. **Backend deploy:** toplayıcıyı bir yerde zamanlı çalıştır, çıktıyı (`kesintiler.json`) yayınla.
4. **Gerçek bildirim:** `notify.js` + `app/.../push.js` — FCM/Expo Push ile ilçe topic'ine gönderim.
5. **Tam ilçe listesi:** `app/src/data/ilceler.js` (şu an örnek 5 ilçe).

## Notlar

- Uygulama ekranlarında "Resmî bir uygulama değildir · Kaynak: BEDAŞ/AYEDAŞ" ibaresi vardır;
  kaldırma — mağaza incelemesi veri kaynağını sorabilir.
- Endpoint'ler habersiz değişir (bu yüzden `index.js`'te çekilemezse alarm var).
- Uzun vadede EPDK'nın MASS projesi bu alanı sıkıştırabilir.
