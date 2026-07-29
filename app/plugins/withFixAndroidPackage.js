const { withMainActivity, withMainApplication } = require("@expo/config-plugins");

// Bilinen bir prebuild hatası: klasör yolu android.package ile doğru üretiliyor
// ama MainActivity.kt/MainApplication.kt içindeki "package ..." satırı bazen
// slug'dan türetilmiş yanlış bir değerde kalıyor ("com.istanbulkesinti" gibi),
// bu da derlemede "Unresolved reference 'BuildConfig'" hatasına yol açıyor.
// Bu plugin, üretilen dosyalardaki package satırını her prebuild'de zorla düzeltir.
function fixPackageLine(contents, correctPackage) {
  return contents.replace(/^package\s+[\w.`]+/m, `package ${correctPackage}`);
}

function withFixAndroidPackage(config) {
  const pkg = config.android.package;

  config = withMainActivity(config, (config) => {
    config.modResults.contents = fixPackageLine(config.modResults.contents, pkg);
    return config;
  });

  config = withMainApplication(config, (config) => {
    config.modResults.contents = fixPackageLine(config.modResults.contents, pkg);
    return config;
  });

  return config;
}

module.exports = withFixAndroidPackage;
