import { list } from "@keystone-6/core";
import { text, image } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const ProfilGereja = list({
  access: allowAll,
  fields: {
    gambarProfil: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambarProfil;
          if (file && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
            addValidationError("Hanya file JPEG atau PNG yang diperbolehkan.");
          }
        },
      },
    }),
    alamat: text({
      validation: { isRequired: true },
      ui: { displayMode: "textarea" },
    }),
    telepon: text({
      validation: { isRequired: true },
    }),
  },
});
