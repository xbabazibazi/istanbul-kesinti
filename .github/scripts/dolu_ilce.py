"""Ekran görüntüsü için "dolu" bir ilçe seç.

Canlı veriden yaklaşan kesintisi en çok olan ilçeyi bulur; böylece mağaza
ekran görüntüsünde boş liste yerine gerçek kesinti kartları görünür.
İl/ilçe görünen adlarını uygulamanın kendi veri dosyalarından okur
(büyük/küçük harf dönüşümü Türkçe'de sorunlu olduğu için tahmin etmiyoruz).

Kullanım: python3 dolu_ilce.py <app_dizini> <veri_url>
Çıktı:    İl|İlçe|ILCEKEY
"""

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CIFT = re.compile(r'\{\s*ad:\s*"([^"]+)",\s*key:\s*"([^"]+)"\s*\}')
VARSAYILAN = ("İstanbul", "Beşiktaş", "BESIKTAS")


def ad_haritasi(app_dizini: Path) -> dict:
    harita = {}
    ilceler = (app_dizini / "src/data/ilceler.js").read_text(encoding="utf-8")
    for ad, key in CIFT.findall(ilceler):
        harita[key] = ("İstanbul", ad)

    iller = (app_dizini / "src/data/iller.js").read_text(encoding="utf-8")
    for blok in re.finditer(r'il:\s*"([^"]+)",\s*ilceler:\s*\[(.*?)\n\s*\],', iller, re.S):
        il = blok.group(1)
        for ad, key in CIFT.findall(blok.group(2)):
            harita[key] = (il, ad)
    return harita


def en_dolu_ilce(veri_url: str, harita: dict):
    with urllib.request.urlopen(veri_url, timeout=30) as yanit:
        veri = json.load(yanit)

    simdi = datetime.now(timezone.utc)
    sayac = {}
    for k in veri.get("kesintiler", []):
        anahtar = k.get("ilceKey")
        if anahtar not in harita:
            continue
        try:
            bitis = datetime.fromisoformat(k["bitis"])
        except (KeyError, ValueError):
            continue
        if bitis.tzinfo is None:
            bitis = bitis.replace(tzinfo=timezone.utc)
        if bitis >= simdi:
            sayac[anahtar] = sayac.get(anahtar, 0) + 1

    if not sayac:
        return VARSAYILAN
    anahtar = max(sayac, key=sayac.get)
    il, ad = harita[anahtar]
    return il, ad, anahtar


def main():
    # Türkçe adlar bozulmasın diye çıktıyı UTF-8'e sabitle (Windows'ta varsayılan
    # cp1252 olduğu için yerel testte "İstanbul" bozuk çıkıyordu).
    sys.stdout.reconfigure(encoding="utf-8")
    app_dizini = Path(sys.argv[1])
    veri_url = sys.argv[2]
    try:
        harita = ad_haritasi(app_dizini)
        il, ad, anahtar = en_dolu_ilce(veri_url, harita)
    except Exception as hata:  # ekran görüntüsü işi bu yüzden çökmesin
        print(f"uyari: {hata}", file=sys.stderr)
        il, ad, anahtar = VARSAYILAN
    print(f"{il}|{ad}|{anahtar}")


if __name__ == "__main__":
    main()
