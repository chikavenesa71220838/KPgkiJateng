import { list } from "@keystone-6/core";
import { text, relationship, image, timestamp, calendarDay } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const Pendeta = list({
  access: allowAll,
  fields: {
    foto: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.foto;
          if (!file || !file.filename) return;

          const lower = file.filename.toLowerCase();
          if (
            !lower.endsWith(".jpg") &&
            !lower.endsWith(".jpeg") &&
            !lower.endsWith(".png")
          ) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk foto."
            );
          }
        },
      },
    }),

    nama: text({ validation: { isRequired: true } }),

    email: text({
      validation: { isRequired: true },
      isIndexed: "unique",
      ui: { description: "Email pendeta (harus unik)" },
    }),

    kontak: text(),

    sejakKapanAktif: calendarDay({
      validation: { isRequired: true },
      ui: {
        description: "Tanggal mulai aktif di gereja ini",
      },
    }),

    gereja: relationship({
      ref: "Gereja.pendeta",
      ui: { description: "Gereja tempat pendeta ini aktif melayani" },
    }),
  },
  ui: { labelField: "nama" },
});
