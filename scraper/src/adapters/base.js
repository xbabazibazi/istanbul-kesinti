// Her sağlayıcı adapter'ı bu iki işi yapar:
//   fetchRaw() -> sağlayıcının HAM verisini getir (endpoint keşfi burada)
//   parse(raw) -> ham veriyi Kesinti[] ortak şemasına çevir
// Yeni bir şehir/sağlayıcı eklemek = yeni bir adapter yazmak. Gerisi değişmez.

export class Adapter {
  /** @returns {string} */
  get saglayici() {
    throw new Error("saglayici tanımlanmalı");
  }
  /** @returns {Promise<any>} ham veri */
  async fetchRaw() {
    throw new Error("fetchRaw() tanımlanmalı");
  }
  /** @param {any} raw @returns {import('../schema.js').Kesinti[]} */
  parse(raw) {
    throw new Error("parse() tanımlanmalı");
  }
}
