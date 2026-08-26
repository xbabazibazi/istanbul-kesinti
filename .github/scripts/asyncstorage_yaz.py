"""Simülatördeki uygulamanın AsyncStorage'ına kayıtlı ilçeyi doğrudan yaz.

idb'nin dokunma/erişilebilirlik köprüsü yeni iOS simülatörlerinde
güvenilir çalışmıyor ("No translation object returned for simulator").
Bunun yerine uygulamanın kalıcı verisini önceden yazıp uygulamayı zaten
istenen ekranda açtırıyoruz — dokunma gerekmiyor, sonuç deterministik.

Dosya yolu, @react-native-async-storage/async-storage'ın iOS kaynağındaki
RCTCreateStorageDirectoryPath ile birebir aynı olmalı:
  Library/Application Support/<bundleID>/RCTAsyncLocalStorage_V1/manifest.json
(DİKKAT: Documents/ altı DEĞİL — ilk denemede oraya yazıldı ve uygulama
veriyi görmedi.)

1024 karakterden kısa değerler doğrudan manifest'e gömülür (bizimki kısa).

Kullanım: asyncstorage_yaz.py <container> <bundleID> <il> <ilce> <ilceKey>
"""

import json
import os
import sys


def main():
    container, bundle_id, il, ilce, ilce_key = sys.argv[1:6]

    dizin = os.path.join(
        container, "Library", "Application Support", bundle_id, "RCTAsyncLocalStorage_V1"
    )
    os.makedirs(dizin, exist_ok=True)
    yol = os.path.join(dizin, "manifest.json")

    # Uygulamanın kendi yazdığı diğer anahtarlar (deneme başlangıcı vb.)
    # kaybolmasın diye mevcut manifest'in üstüne ekliyoruz.
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

    print(f"AsyncStorage yazildi: {yol}")
    print(f"  anahtarlar: {sorted(manifest)}")


if __name__ == "__main__":
    main()
