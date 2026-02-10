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
    googleId: text({ isIndexed: "unique" }),
    profile: relationship({ ref: "Profile.user", many: false }),
  },
});
