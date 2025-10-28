import fetch from "node-fetch";
import { books } from "./kitab.js";

// Fallback verse kalau API gagal
const fallbackVerse = {
  book: "Mazmur",
  chapter: "23",
  verse: "1",
  text: "Tuhan adalah gembalaku, takkan kekurangan aku."
};

// Fungsi pembangkit angka acak berbasis tanggal
function getSeededRandom(seed, max) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

function getTodaySeed() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return y * 10000 + m * 100 + d;
}

// Fetch API dengan timeout
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Ambil 1 ayat acak berdasarkan tanggal hari ini
export async function getRandomVerse() {
  const seed = getTodaySeed();
  const bookIndex = getSeededRandom(seed, books.length);
  const randomBook = books[bookIndex];
  const chapter = getSeededRandom(seed + 1, randomBook.chapters) + 1;

  const url = `https://beeble.vercel.app/api/v1/passage/${randomBook.code}/${chapter}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const res = await fetchWithTimeout(url, 7000); // timeout 7 detik
      if (!res.ok) throw new Error(`Error fetching verse: ${res.status} ${res.statusText}`);

      const data = await res.json();
      const contentVerses = data.data.verses.filter(v => v.type === "content");
      if (!contentVerses.length) throw new Error("Tidak ada ayat content di chapter ini");

      const verseIndex = getSeededRandom(seed + 2, contentVerses.length);
      const verse = contentVerses[verseIndex];

      return {
        book: data.data.book.name,
        chapter: String(data.data.book.chapter),
        verse: String(verse.verse),
        text: verse.content,
      };
    } catch (err) {
      attempts++;
      console.warn(`Attempt ${attempts} failed:`, err.message);
      if (attempts >= maxAttempts) {
        console.warn("API gagal, pakai fallback verse.");
        return fallbackVerse;
      }
    }
  }
}
