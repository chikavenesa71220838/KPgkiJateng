import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  file,
  calendarDay,
} from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const Warta = list({
  access: allowAll,
  fields: {
    kategori: relationship({
      ref: "KategoriWarta.warta",
      many: false,
      ui: { displayMode: "select" },
    }),

    judul: text({
      validation: { isRequired: true },
    }),

    masaBerlaku: calendarDay(),

    tanggalPelaksanaan: timestamp(),

    isiWarta: text({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true },
    }),

    file: file({
      storage: "local_files",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.file;
          if (!file || !file.mimetype) return;
          const allowedTypes = ["image/jpeg", "image/jpg"];
          if (!allowedTypes.includes(file.mimetype)) {
            addValidationError(
              "Hanya file gambar JPG atau JPEG yang diperbolehkan untuk warta."
            );
          }
        },
      },
    }),

    createdAt: timestamp({
      defaultValue: { kind: "now" },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
      },
    }),
  },
});
