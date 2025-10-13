import { list } from "@keystone-6/core";
import { text, relationship } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const KategoriWarta = list({
  access: allowAll,
  fields: {
    nama: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    warta: relationship({ ref: "Warta.kategori", many: true }),
  },
  ui: { labelField: "nama" },
});
