// Tek seferlik CLI giriş noktası (GitHub Actions vb. cron ortamları için).
// Sürekli çalışan panel+zamanlayıcı için bkz. daemon.js.
import { calistir } from "./scrape.js";

calistir().catch((e) => {
  console.error("[FATAL]", e);
  process.exit(1);
});
