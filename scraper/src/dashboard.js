// Basit bakım paneli: bağlantı durumu + veri geliş gidişini gösterir,
// elle "şimdi çalıştır" tetikler. Tek dosya, build adımı yok.
import express from "express";

function temelYetkilendirme(kullaniciAdi, sifre) {
  return (req, res, next) => {
    const baslik = req.headers.authorization || "";
    const [tur, kodlanmis] = baslik.split(" ");
    if (tur === "Basic" && kodlanmis) {
      const [u, p] = Buffer.from(kodlanmis, "base64").toString().split(":");
      if (u === kullaniciAdi && p === sifre) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="kesinti-panel"');
    res.status(401).send("Yetkilendirme gerekli");
  };
}

function zamanFarki(iso) {
  if (!iso) return "—";
  const fark = Date.now() - Date.parse(iso);
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} sa ${dk % 60} dk önce`;
  return `${Math.floor(sa / 24)} gün önce`;
}

function sayfaHtml(durum) {
  const { sonCalisma, gecmis, sonrakiCalisma } = durum;
  const genelSaglikli = sonCalisma?.basarili;
  const satirlar = gecmis
    .slice(0, 30)
    .map((g) => {
      const renk = g.basarili ? "#1a9e5c" : "#d64545";
      const adapterOzet = g.adapterSonuclari
        .map((a) => `${a.saglayici}: ${a.basarili ? a.kayitSayisi + " kayıt" : "HATA — " + (a.hata || "?")}`)
        .join(", ");
      return `<tr>
        <td>${new Date(g.zaman).toLocaleString("tr-TR")}</td>
        <td style="color:${renk};font-weight:700">${g.basarili ? "Başarılı" : "Hata"}</td>
        <td>${g.toplamKayit}</td>
        <td>${g.yeniKayit}</td>
        <td style="font-size:13px;color:#555">${adapterOzet}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Kesinti Toplayıcı — Bakım Paneli</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#0f1115; color:#e8eaed; margin:0; padding:24px; }
  h1 { font-size:20px; margin:0 0 4px; }
  .alt { color:#9aa0a6; font-size:13px; margin-bottom:24px; }
  .kartlar { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px; }
  .kart { background:#1a1d24; border-radius:12px; padding:16px 20px; min-width:180px; border:1px solid #2a2e37; }
  .kart .baslik { font-size:12px; color:#9aa0a6; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .kart .deger { font-size:22px; font-weight:800; }
  .yesil { color:#3ddc84; } .kirmizi { color:#ff6b6b; }
  button { background:#3ddc84; color:#0f1115; border:none; border-radius:8px; padding:10px 18px; font-weight:700; cursor:pointer; font-size:14px; }
  button:disabled { opacity:.5; cursor:default; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid #2a2e37; }
  th { color:#9aa0a6; font-weight:600; font-size:12px; text-transform:uppercase; }
  #durum-mesaj { font-size:13px; color:#9aa0a6; margin-top:8px; }
</style>
</head>
<body>
  <h1>İstanbul Kesinti — Toplayıcı Bakım Paneli</h1>
  <div class="alt">Sayfa 20 saniyede bir kendini yeniler.</div>

  <div class="kartlar">
    <div class="kart">
      <div class="baslik">Genel Durum</div>
      <div class="deger ${genelSaglikli ? "yesil" : "kirmizi"}">${genelSaglikli ? "● Sağlıklı" : "● Sorunlu"}</div>
    </div>
    <div class="kart">
      <div class="baslik">Son Çalışma</div>
      <div class="deger">${sonCalisma ? zamanFarki(sonCalisma.zaman) : "—"}</div>
    </div>
    <div class="kart">
      <div class="baslik">Toplam Kayıt</div>
      <div class="deger">${sonCalisma?.toplamKayit ?? "—"}</div>
    </div>
    <div class="kart">
      <div class="baslik">Sonraki Çalışma</div>
      <div class="deger" style="font-size:16px">${sonrakiCalisma || "—"}</div>
    </div>
  </div>

  <button id="tetikle-btn" onclick="simdiCalistir()">Şimdi Çalıştır</button>
  <div id="durum-mesaj"></div>

  <h2 style="font-size:15px;margin-top:32px;color:#9aa0a6;text-transform:uppercase;letter-spacing:.5px">Son Çalışmalar</h2>
  <table>
    <thead><tr><th>Zaman</th><th>Durum</th><th>Toplam</th><th>Yeni</th><th>Detay</th></tr></thead>
    <tbody>${satirlar || '<tr><td colspan="5" style="color:#9aa0a6">Henüz kayıt yok</td></tr>'}</tbody>
  </table>

  <script>
    async function simdiCalistir() {
      const btn = document.getElementById('tetikle-btn');
      const mesaj = document.getElementById('durum-mesaj');
      btn.disabled = true;
      mesaj.textContent = 'Çalıştırılıyor…';
      try {
        const res = await fetch('/api/calistir', { method: 'POST' });
        const j = await res.json();
        mesaj.textContent = j.basarili
          ? \`Tamamlandı: \${j.toplamKayit} kayıt, \${j.yeniKayit} yeni.\`
          : 'Hata oluştu, tabloya bak.';
        setTimeout(() => location.reload(), 1200);
      } catch (e) {
        mesaj.textContent = 'İstek başarısız: ' + e.message;
        btn.disabled = false;
      }
    }
    setTimeout(() => location.reload(), 20000);
  </script>
</body>
</html>`;
}

export function dashboardBaslat({ port, kullaniciAdi, sifre, durumGetir, manuelTetikle }) {
  const app = express();
  if (kullaniciAdi && sifre) app.use(temelYetkilendirme(kullaniciAdi, sifre));

  app.get("/", async (req, res) => {
    res.set("content-type", "text/html; charset=utf-8").send(sayfaHtml(await durumGetir()));
  });

  app.get("/api/durum", async (req, res) => {
    res.json(await durumGetir());
  });

  app.post("/api/calistir", async (req, res) => {
    try {
      const sonuc = await manuelTetikle();
      res.json(sonuc);
    } catch (err) {
      res.status(500).json({ basarili: false, hata: err.message });
    }
  });

  app.listen(port, () => console.log(`[panel] http://0.0.0.0:${port} üzerinde dinliyor`));
}
