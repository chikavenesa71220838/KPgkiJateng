import { list } from "@keystone-6/core";
import { text, image, relationship } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const DetailIbadah = list({
  access: allowAll,
  fields: {
    jam: text({ validation: { isRequired: true } }),
    pengkhotbah: relationship({
      ref: "Pengkhotbah.detailIbadah",
      ui: { displayMode: "select" },
    }),
    banner: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.banner;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
            addValidationError("Hanya file JPEG yang diperbolehkan untuk banner.");
          }
        },
      },
    }),
    jadwal: relationship({ ref: "JadwalIbadah.detailIbadah" }),
  },
  ui: { labelField: "jam" },
});
