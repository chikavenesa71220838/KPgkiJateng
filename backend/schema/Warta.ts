import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  calendarDay,
  image,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";

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

    isiWarta: document({
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true,
        },
        listTypes: true,
        alignment: true,
        headingLevels: [1, 2, 3, 4, 5, 6],
      },
      links: true,
      dividers: true,
      layouts: [[1], [1, 1], [1, 1, 1]],
    }),

    gambar: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambar;
          if (!file || !file.filename) return;

          const lower = file.filename.toLowerCase();
          if (
            !(
              lower.endsWith(".jpg") ||
              lower.endsWith(".jpeg") ||
              lower.endsWith(".png")
            )
          ) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar warta."
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
