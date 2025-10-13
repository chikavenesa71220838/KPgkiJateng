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
    judul: text({ validation: { isRequired: true } }),
    masaBerlaku: calendarDay(),
    tanggalPelaksanaan: timestamp(),
    file: file({
      storage: "local_files",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.file;

          // Jika tidak ada file, lewati validasi
          if (!file || !file.mimetype) {
            return;
          }

          // Jika file ada tapi bukan PDF, tampilkan error
          if (file.mimetype !== "application/pdf") {
            addValidationError("Hanya file PDF yang diperbolehkan untuk warta.");
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
