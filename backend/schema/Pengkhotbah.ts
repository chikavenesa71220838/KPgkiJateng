import { list } from "@keystone-6/core";
import { text, relationship } from "@keystone-6/core/fields";

const allowAll = { operation: { query: () => true, create: () => true, update: () => true, delete: () => true } };

export const Pengkhotbah = list({
  access: allowAll,
  fields: {
    nama: text({ validation: { isRequired: true } }),
    // kontak: text(),
    detailIbadah: relationship({ ref: "DetailIbadah.pengkhotbah", many: true }),
  },
  ui: { labelField: "nama" },
});
