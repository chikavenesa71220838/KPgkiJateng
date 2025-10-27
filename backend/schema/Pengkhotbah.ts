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
    gambarProfil: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambarProfil;
          if (
            file &&
            file.mimetype !== "image/jpeg" &&
            file.mimetype !== "image/jpg"
          ) {
            addValidationError("Hanya file JPEG atau JPG yang diperbolehkan.");
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
