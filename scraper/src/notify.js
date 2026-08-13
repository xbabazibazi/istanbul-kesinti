// Bildirim tetikleyici. Konu (topic) tabanlı: cihaz "ilce_<key>" konusuna abone olur.
// Abonelik listesi Supabase'de (push_tokens tablosu) tutulur; SUPABASE_SECRET_KEY
// (service_role) ile RLS'i atlayıp o ilçeye ait token'ları okuyup Expo'nun Push API'sine gönderiyoruz.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://jihjwemjqgrysbinskun.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "";

export function ilceKonusu(ilceKey) {
  return "ilce_" + ilceKey.replace(/\s+/g, "_");
}

async function tokenlariGetir(ilceKey) {
  const url = `${SUPABASE_URL}/rest/v1/push_tokens?ilce_key=eq.${encodeURIComponent(ilceKey)}&select=expo_token`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase token okuma ${res.status}`);
  const satirlar = await res.json();
  return satirlar.map((s) => s.expo_token);
}

async function expoyaGonder(tokenlar, baslik, govde) {
  if (!tokenlar.length) return;
  const mesajlar = tokenlar.map((to) => ({ to, title: baslik, body: govde, sound: "default" }));
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(mesajlar),
  });
  if (!res.ok) throw new Error(`Expo push gönderimi ${res.status}`);
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

    if (!SUPABASE_SECRET_KEY) {
      console.log(`[push] (SUPABASE_SECRET_KEY yok, sadece log) konu=${konu} :: ${baslik} — ${govde}`);
      continue;
    }
    try {
      const tokenlar = await tokenlariGetir(ilceKey);
      await expoyaGonder(tokenlar, baslik, govde);
      console.log(`[push] konu=${konu} :: ${baslik} — ${govde} (${tokenlar.length} cihaza gönderildi)`);
    } catch (err) {
      console.error(`[ALARM] push gönderilemedi (${konu}): ${err.message}`);
    }
  }
}
