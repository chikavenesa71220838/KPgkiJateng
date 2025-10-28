import cron from "node-cron";
import { getRandomVerse } from "../services/aytService.js";

export default function startAyatScheduler(context) {
  async function updateDailyVerse() {
    const { prisma } = context.sudo();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cek apakah sudah ada ayat hari ini
    const existing = await prisma.ayatHarian.findFirst({
      where: { tanggal: { gte: today.toISOString() } },
    });

    if (!existing) {
      console.log("Tidak ada ayat hari ini, membuat baru...");
      const randomAyat = await getRandomVerse();
      await prisma.ayatHarian.create({
        data: {
          book: randomAyat.book,
          chapter: randomAyat.chapter,
          verse: randomAyat.verse,
          text: randomAyat.text,
          tanggal: new Date().toISOString(),
        },
      });
      console.log("Ayat harian baru tersimpan di database");
    } else {
      console.log("Ayat harian sudah ada, tidak diperbarui.");
    }
  }

  // Jalankan sekali saat server start
  updateDailyVerse();

  // Jalankan otomatis setiap jam 00:00 WIB
  cron.schedule("0 0 * * *", () => {
    updateDailyVerse();
  }, {
    timezone: "Asia/Jakarta",
  });

  console.log("📅 Scheduler Ayat Harian aktif (Asia/Jakarta, 00:00)");
}
