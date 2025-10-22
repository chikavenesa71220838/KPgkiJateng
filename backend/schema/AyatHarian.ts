import { list } from "@keystone-6/core";
import { text, timestamp } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const AyatHarian = list({
  access: allowAll,
  fields: {
    book: text({ validation: { isRequired: true } }),
    chapter: text({ validation: { isRequired: true } }),
    verse: text({ validation: { isRequired: true } }),
    text: text({ ui: { displayMode: "textarea" } }),
    tanggal: timestamp({
      validation: { isRequired: true },
      defaultValue: { kind: "now" },
    }),
  },
});
