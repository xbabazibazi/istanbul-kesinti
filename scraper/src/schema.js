// Tüm sağlayıcılardan gelen veriyi indirgediğimiz TEK ortak model.
// BEDAŞ'ta eşleştirme İLÇE bazında (county temiz); mahalle en iyi çabayla ayıklanır.

/**
 * @typedef {Object} Kesinti
 * @property {string} id            Sağlayıcının kendi kayıt id'si ile kararlı
 * @property {"elektrik"|"su"} hizmet
 * @property {"BEDAŞ"|"AYEDAŞ"|"İSKİ"} saglayici
 * @property {string} il
 * @property {string} ilce          Görüntülenecek ad
 * @property {string} ilceKey       EŞLEŞTİRME bunun üstünden yapılır
 * @property {string} [mahalle]     Ayıklanan mahalle(ler), görüntüleme için ("ZAFER, HÜRRİYET")
 * @property {string} baslangic     ISO 8601 (+03:00)
 * @property {string} bitis         ISO 8601 (+03:00)
 * @property {string} [sebep]
 * @property {string} [message]     Ham açıklama (sokaklar burada)
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {string} kaynakUrl
 * @property {string} cekilmeZamani
 */

export function gecerliMi(k) {
  return Boolean(
    k &&
      k.hizmet &&
      k.saglayici &&
      k.ilceKey &&
      k.baslangic &&
      k.bitis &&
      !Number.isNaN(Date.parse(k.baslangic)) &&
      !Number.isNaN(Date.parse(k.bitis))
  );
}
