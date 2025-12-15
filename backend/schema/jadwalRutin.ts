import { list } from "@keystone-6/core";
import { text, relationship, select } from "@keystone-6/core/fields";

export const jadwalRutin = list({
  access: {
    operation: {
      query: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
  },
  fields: {
    namaIbadah: text({ validation: { isRequired: true } }),

    nama: select({
      options: [
        { label: "Senin", value: "Senin" },
        { label: "Selasa", value: "Selasa" },
        { label: "Rabu", value: "Rabu" },
        { label: "Kamis", value: "Kamis" },
        { label: "Jumat", value: "Jumat" },
        { label: "Sabtu", value: "Sabtu" },
        { label: "Minggu", value: "Minggu" },
      ],
      validation: { isRequired: true },
    }),

    waktu: relationship({
      ref: "jam.jadwalRutin",
      many: true,
    }),

    gereja: relationship({
      ref: "Gereja.jadwalRutin",
      ui: { displayMode: "select" },
    }),
  },
});
