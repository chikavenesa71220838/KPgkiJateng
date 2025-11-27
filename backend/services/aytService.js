import tb from "./tb.json" assert { type: "json" };

// fallback
const fallbackVerse = {
  kitab: "Mazmur",
  pasal: 23,
  ayat: 1,
  firman: "Tuhan adalah gembalaku, takkan kekurangan aku."
};

function getSeededRandom(seed, max) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

function getTodaySeed() {
  const t = new Date();
  return t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
}

export async function getRandomVerse() {
  try {
    if (!Array.isArray(tb) || tb.length === 0) {
      throw new Error("JSON kosong atau tidak valid");
    }

    const seed = getTodaySeed();
    const index = getSeededRandom(seed, tb.length);

    const selected = tb[index];

    return {
      book: selected.kitab,
      chapter: String(selected.pasal),
      verse: String(selected.ayat),
      text: selected.firman
    };

  } catch (err) {
    console.error("Gagal ambil ayat dari JSON:", err.message);
    return {
      book: fallbackVerse.kitab,
      chapter: String(fallbackVerse.pasal),
      verse: String(fallbackVerse.ayat),
      text: fallbackVerse.firman
    };
  }
}
