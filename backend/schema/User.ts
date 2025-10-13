import { list } from "@keystone-6/core";
import { text, select, relationship, password } from "@keystone-6/core/fields";

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
    password: password(),
    googleId: text({ isIndexed: "unique" }),
    role: select({
      options: [
        { label: "Admin", value: "admin" },
        { label: "Jemaat", value: "jemaat" },
      ],
      defaultValue: "jemaat",
      ui: { displayMode: "segmented-control" },
    }),
    profile: relationship({ ref: "Profile.user", many: false }),
  },
});
