# Gizlilik Politikası — Kesinti

Son güncelleme: 25 Ağustos 2026

Kesinti, İstanbul (Avrupa yakası), Antalya, Burdur ve Isparta için planlı elektrik kesintisi
bilgisi gösteren, **hesap gerektirmeyen** bir uygulamadır. Resmî bir BEDAŞ veya AEDAŞ uygulaması
değildir.

## Topladığımız veri

- **Seçtiğin ilçe(ler)**: Cihazında (yerel depolama) saklanır.
- **Bildirim izni verirsen**: Seçtiğin ilçede yeni bir planlı kesinti eklendiğinde bildirim
  gönderebilmek için, cihazına özgü anonim bir bildirim adresi (Expo push token) ve seçtiğin
  ilçe adı sunucumuza (Supabase) kaydedilir. Bu bilgi yalnızca sana bildirim göndermek için
  kullanılır, ad/e-posta/telefon gibi kimliğini belirleyen hiçbir bilgi içermez. Bildirim izni
  reddedilirse bu adım hiç gerçekleşmez, uygulama normal çalışmaya devam eder.
- Hesap oluşturma, kişisel bilgi (ad, e-posta, telefon vb.) toplama yoktur.

## Veri paylaşımı

Topladığımız hiçbir veri üçüncü taraflarla paylaşılmaz veya satılmaz. Uygulama, kesinti
verisini göstermek için BEDAŞ'ın ve AEDAŞ'ın herkese açık kesinti bilgisini bir arka uç
servisinden okur; bu istek sırasında kullanıcıyı tanımlayan bir bilgi gönderilmez. Ücretsiz
sürümde reklam gösterimi için Google AdMob kullanılır; AdMob'un kendi gizlilik/veri
uygulamaları için [Google'ın gizlilik politikasına](https://policies.google.com/privacy) bakın.

## Veri saklama ve silme

Seçtiğin ilçe bilgisini istediğin zaman uygulamayı kaldırarak veya "İlçeyi değiştir"
seçeneğiyle sıfırlayabilirsin.

## İletişim

Sorularınız için: [GitHub reposu üzerinden issue açabilirsiniz](https://github.com/xbabazibazi/istanbul-kesinti/issues).
