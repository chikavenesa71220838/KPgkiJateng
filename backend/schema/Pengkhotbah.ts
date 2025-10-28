import { list } from "@keystone-6/core";
import { text, relationship, image } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const Pengkhotbah = list({
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
    kontak: text(),
    detailIbadah: relationship({ ref: "DetailIbadah.pengkhotbah", many: true }),
  },
  ui: { labelField: "nama" },
});
