import { getRandomVerse } from "../services/aytService.js";

export default async function ayatHarianRoute(app, context) {
  app.get("/api/ayat-harian", async (req, res) => {
    try {
      const { prisma } = context.sudo();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let ayat = await prisma.ayatHarian.findFirst({
        where: { tanggal: { gte: today.toISOString() } },
      });

      if (!ayat) {
        console.log("Belum ada ayat hari ini, membuat baru...");
        const randomAyat = await getRandomVerse();
        ayat = await prisma.ayatHarian.create({
          data: {
            book: randomAyat.book,
            chapter: randomAyat.chapter,
            verse: randomAyat.verse,
            text: randomAyat.text,
            tanggal: new Date().toISOString(),
          },
        });
      }

      res.json(ayat);
    } catch (err) {
      console.error("Gagal mengambil ayat:", err);
      res.status(500).json({ error: err.message });
    }
  });
}
