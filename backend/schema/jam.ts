import { list } from "@keystone-6/core";
import { relationship, text } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const jam = list({
  access: allowAll,
  fields: {
    jam: text({
      validation: { isRequired: true },
    }),
    jadwalRutin: relationship({
      ref: "jadwalRutin.waktu",
      many: true,
    }),
  },
});