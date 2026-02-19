import { list } from "@keystone-6/core";
import { text, relationship, calendarDay } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const JadwalIbadah = list({
  access: allowAll,
  fields: {
    tanggal: calendarDay({ validation: { isRequired: true } }),
    topik: text(),
    detailIbadah: relationship({
      ref: "DetailIbadah.jadwal",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["jam", "pengkhotbah", "banner"],
        inlineCreate: { fields: ["jam", "pengkhotbah", "banner"] },
        inlineEdit: { fields: ["jam", "pengkhotbah", "banner", "url"] },
      },
    }),
    gereja: relationship({
      ref: "Gereja.jadwalIbadah",
      ui: { displayMode: "select" },
    }),
  },
  ui: { labelField: "topik" },
});
