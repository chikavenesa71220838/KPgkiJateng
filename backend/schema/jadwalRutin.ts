import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  timestamp,
  calendarDay,
  image,
  select,
} from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const jadwalRutin = list({
  access: allowAll,
  fields: {
    namaIbadah: text({
      validation: { isRequired: true },
      ui: {
        description: "Masukkan nama ibadah",
      },
    }),
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
      ui: { displayMode: "select" },
    }),
    waktu: relationship({
      ref: "jam.jadwalRutin",
      many: true,
      ui: {
        displayMode: "select",
        labelField: "jam",
      },
    }),
  },
});