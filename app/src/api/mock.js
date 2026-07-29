// Backend yokken UI dolu kalsın diye. Scraper çıktısıyla AYNI şema.
export const MOCK_KESINTILER = [
  {
    id: "BEDAŞ:36775168", hizmet: "elektrik", saglayici: "BEDAŞ", il: "İstanbul",
    ilce: "BAHÇELİEVLER", ilceKey: "BAHCELIEVLER", mahalle: "MERKEZ-HÜRRİYET, ZAFER",
    baslangic: "2026-07-29T09:00:00+03:00", bitis: "2026-07-29T17:00:00+03:00",
    sebep: "Bakım Çalışması-Kapsamlı TM Bakımı",
    message: "GÜNGÖREN, HÜRRİYET, SÜMBÜL / AHMET YESEVİ, BATARYA, ÇALIŞLAR sokakları",
    lat: 40.993752, lng: 28.837687,
    kaynakUrl: "https://www.bedas.com.tr/elektrik-kesintisi-sorgulama",
  },
  {
    id: "BEDAŞ:36775201", hizmet: "elektrik", saglayici: "BEDAŞ", il: "İstanbul",
    ilce: "BEŞİKTAŞ", ilceKey: "BESIKTAS", mahalle: "LEVENT, ETİLER",
    baslangic: "2026-07-30T10:00:00+03:00", bitis: "2026-07-30T14:00:00+03:00",
    sebep: "Bakım Çalışması-Arıza Onarımı",
    message: "LEVENT, ETİLER / NİSPETİYE, BÜYÜKDERE caddeleri",
    lat: 41.078652, lng: 29.012345,
    kaynakUrl: "https://www.bedas.com.tr/elektrik-kesintisi-sorgulama",
  },
  {
    id: "BEDAŞ:36775244", hizmet: "elektrik", saglayici: "BEDAŞ", il: "İstanbul",
    ilce: "ŞİŞLİ", ilceKey: "SISLI", mahalle: "MECİDİYEKÖY, TEŞVİKİYE",
    baslangic: "2026-07-29T22:00:00+03:00", bitis: "2026-07-30T02:00:00+03:00",
    sebep: "Bakım Çalışması-Kapsamlı TM Bakımı",
    message: "MECİDİYEKÖY, TEŞVİKİYE / HALASKARGAZİ caddesi",
    lat: 41.063229, lng: 28.987654,
    kaynakUrl: "https://www.bedas.com.tr/elektrik-kesintisi-sorgulama",
  },
];
