const { withAppBuildGradle } = require("@expo/config-plugins");

// EAS'ta kullanılan upload keystore'u yerel build'lerde de kullanmak için
// (Play Store ile aynı imzayı üretsin diye) her prebuild'de release
// signingConfig'i build.gradle'a enjekte eder. Keystore dosyası ve şifreleri
// android-keystore/ klasöründedir (gitignored); dosya yoksa (örn. EAS cloud
// build sırasında) debug imzasına düşer, hata vermez.
const SIGNING_BLOCK = `
    def keystorePropertiesFile = new File(rootDir, "../android-keystore/keystore.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }
`;

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes("android-keystore/keystore.properties")) {
      return config;
    }

    contents = contents.replace(
      /android\s*\{/,
      `${SIGNING_BLOCK}\nandroid {`
    );

    contents = contents.replace(
      /signingConfigs\s*\{([\s\S]*?)\n    \}/,
      (match, inner) => `signingConfigs {${inner}
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(new File(rootDir, "../android-keystore/" + keystoreProperties['storeFile']))
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`
    );

    // "release {" hem signingConfigs hem buildTypes altında var; buildTypes.release'i
    // ayırt etmek için o bloğe özgü şablon yorumunu ("// Caution!") çapa olarak kullanıyoruz.
    contents = contents.replace(
      /(release\s*\{\s*\/\/ Caution![\s\S]*?signingConfig\s+)signingConfigs\.debug/,
      `$1keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withReleaseSigning;
