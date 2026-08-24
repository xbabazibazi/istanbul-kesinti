// İl/ilçe listesi — key'ler ilgili scraper adapter'ıyla AYNI kurala göre üretilir.
// İstanbul (BEDAŞ): key'ler çıplak ilçe adı (ör. "ESENLER") — geriye dönük uyumluluk
// için değiştirilmedi (mevcut kullanıcıların kayıtlı/abone ilçeleri bu formatta).
// Antalya/Burdur/Isparta (AEDAŞ): üç ilde de tekrar eden ilçe adları var
// (KEMER, AKSU, MERKEZ), bu yüzden key "İL_İLÇE" formatında (ör. "ANTALYA_KEMER").
import { IL as ISTANBUL, ILCELER as ISTANBUL_ILCELERI } from "./ilceler";

export const ILLER = [
  { il: ISTANBUL, ilceler: ISTANBUL_ILCELERI },
  {
    il: "Antalya",
    ilceler: [
      { ad: "Akseki", key: "ANTALYA_AKSEKI" },
      { ad: "Aksu", key: "ANTALYA_AKSU" },
      { ad: "Alanya", key: "ANTALYA_ALANYA" },
      { ad: "Demre", key: "ANTALYA_DEMRE" },
      { ad: "Döşemealtı", key: "ANTALYA_DOSEMEALTI" },
      { ad: "Elmalı", key: "ANTALYA_ELMALI" },
      { ad: "Finike", key: "ANTALYA_FINIKE" },
      { ad: "Gazipaşa", key: "ANTALYA_GAZIPASA" },
      { ad: "Gündoğmuş", key: "ANTALYA_GUNDOGMUS" },
      { ad: "İbradı", key: "ANTALYA_IBRADI" },
      { ad: "Kaş", key: "ANTALYA_KAS" },
      { ad: "Kemer", key: "ANTALYA_KEMER" },
      { ad: "Kepez", key: "ANTALYA_KEPEZ" },
      { ad: "Konyaaltı", key: "ANTALYA_KONYAALTI" },
      { ad: "Korkuteli", key: "ANTALYA_KORKUTELI" },
      { ad: "Kumluca", key: "ANTALYA_KUMLUCA" },
      { ad: "Manavgat", key: "ANTALYA_MANAVGAT" },
      { ad: "Muratpaşa", key: "ANTALYA_MURATPASA" },
      { ad: "Serik", key: "ANTALYA_SERIK" },
    ],
  },
  {
    il: "Burdur",
    ilceler: [
      { ad: "Ağlasun", key: "BURDUR_AGLASUN" },
      { ad: "Altınyayla", key: "BURDUR_ALTINYAYLA" },
      { ad: "Bucak", key: "BURDUR_BUCAK" },
      { ad: "Çavdır", key: "BURDUR_CAVDIR" },
      { ad: "Çeltikçi", key: "BURDUR_CELTIKCI" },
      { ad: "Gölhisar", key: "BURDUR_GOLHISAR" },
      { ad: "Karamanlı", key: "BURDUR_KARAMANLI" },
      { ad: "Kemer", key: "BURDUR_KEMER" },
      { ad: "Merkez", key: "BURDUR_MERKEZ" },
      { ad: "Tefenni", key: "BURDUR_TEFENNI" },
      { ad: "Yeşilova", key: "BURDUR_YESILOVA" },
    ],
  },
  {
    il: "Isparta",
    ilceler: [
      { ad: "Aksu", key: "ISPARTA_AKSU" },
      { ad: "Atabey", key: "ISPARTA_ATABEY" },
      { ad: "Eğirdir", key: "ISPARTA_EGIRDIR" },
      { ad: "Gelendost", key: "ISPARTA_GELENDOST" },
      { ad: "Gönen", key: "ISPARTA_GONEN" },
      { ad: "Keçiborlu", key: "ISPARTA_KECIBORLU" },
      { ad: "Merkez", key: "ISPARTA_MERKEZ" },
      { ad: "Şarkikaraağaç", key: "ISPARTA_SARKIKARAAGAC" },
      { ad: "Senirkent", key: "ISPARTA_SENIRKENT" },
      { ad: "Sütçüler", key: "ISPARTA_SUTCULER" },
      { ad: "Uluborlu", key: "ISPARTA_ULUBORLU" },
      { ad: "Yalvaç", key: "ISPARTA_YALVAC" },
      { ad: "Yenişarbademli", key: "ISPARTA_YENISARBADEMLI" },
    ],
  },
];
