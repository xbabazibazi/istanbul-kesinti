// Bildirim tetikleyici. Konu (topic) tabanlı: cihaz "ilce_<key>" konusuna abone olur.
export function ilceKonusu(ilceKey) {
  return "ilce_" + ilceKey.replace(/\s+/g, "_");
}

export async function bildirimGonder(yeniKesintiler) {
  const gruplar = new Map();
  for (const k of yeniKesintiler) {
    if (!gruplar.has(k.ilceKey)) gruplar.set(k.ilceKey, []);
    gruplar.get(k.ilceKey).push(k);
  }

  for (const [ilceKey, liste] of gruplar) {
    const konu = ilceKonusu(ilceKey);
    const ilk = liste[0];
    const baslik =
      liste.length === 1
        ? `${ilk.ilce}: planlı kesinti`
        : `${ilk.ilce}: ${liste.length} planlı kesinti`;
    const govde = `${ilk.hizmet === "elektrik" ? "Elektrik" : "Su"} • ${new Date(
      ilk.baslangic
    ).toLocaleString("tr-TR")}`;
    // TODO: gerçek gönderim (FCM/Expo Push)
    console.log(`[push] konu=${konu} :: ${baslik} — ${govde}`);
  }
}
