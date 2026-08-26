"""Simülatördeki uygulamanın AsyncStorage'ına kayıtlı ilçeyi doğrudan yaz.

idb'nin dokunma/erişilebilirlik köprüsü yeni iOS simülatörlerinde
güvenilir çalışmıyor ("No translation object returned for simulator").
Bunun yerine uygulamanın kalıcı verisini önceden yazıp uygulamayı zaten
istenen ekranda açtırıyoruz — dokunma gerekmiyor, sonuç deterministik.

@react-native-async-storage/async-storage iOS'ta veriyi
Documents/RCTAsyncLocalStorage_V1/manifest.json içinde tutar; 1024
karakterden kısa değerler doğrudan manifest'e gömülür (bizimki kısa).

Kullanım: python3 asyncstorage_yaz.py <container> <il> <ilce> <ilceKey>
"""

import json
import os
import sys


def main():
    container, il, ilce, ilce_key = sys.argv[1:5]

    dizin = os.path.join(container, "Documents", "RCTAsyncLocalStorage_V1")
    os.makedirs(dizin, exist_ok=True)
    yol = os.path.join(dizin, "manifest.json")

    manifest = {}
    if os.path.exists(yol):
        try:
            with open(yol, encoding="utf-8") as dosya:
                manifest = json.load(dosya)
        except (ValueError, OSError):
            manifest = {}

    adresler = [{"il": il, "ilce": ilce, "ilceKey": ilce_key}]
    manifest["kayitli_adresler_v1"] = json.dumps(adresler, ensure_ascii=False)

    with open(yol, "w", encoding="utf-8") as dosya:
        json.dump(manifest, dosya, ensure_ascii=False)

    print(f"AsyncStorage yazıldı: {yol} -> {il} / {ilce}")


if __name__ == "__main__":
    main()
