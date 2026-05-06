import { list } from "@keystone-6/core";
import { text, select, relationship } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const User = list({
  access: allowAll,
  fields: {
    namaUser: text({ validation: { isRequired: true } }),
    emailUser: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    googleId: text({ isIndexed: true }),
    statusAktivasi: select({
      options: [
        { label: "Aktif", value: "aktif" },
        { label: "Non-Aktif (Dihapus)", value: "nonaktif" },
      ],
      defaultValue: "aktif",
      ui: { displayMode: "segmented-control" },
    }),
    
    profile: relationship({ ref: "Profile.user", many: false }),
  },
});