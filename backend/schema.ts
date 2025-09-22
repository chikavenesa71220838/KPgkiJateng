// schema.ts
import { list } from '@keystone-6/core';
import { text, relationship, select, file, image, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const lists = {
Warta: list({
  access: allowAll,
  fields: {
    kategori: text({ validation: { isRequired: true } }),
    judul: text({ validation: { isRequired: true } }),
    file: file({ storage: "local_files" }),
    masaBerlaku: timestamp({ validation: { isRequired: true } }),
    tanggalPelaksanaan: timestamp({ validation: { isRequired: true } }),
    createdAt: timestamp({
      defaultValue: { kind: "now" },
    }),
  },
}),


JadwalIbadah: list({
  access: allowAll,
  fields: {
    tanggal: timestamp({ validation: { isRequired: true } }),
    pengkhotbah: text(),
    topik: text(),
  },
}),

User: list({
    access: allowAll,
    fields: {
      namaUser: text({ validation: { isRequired: true } }),
      emailUser: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
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
}),

Profile: list({
    access: allowAll,
    fields: {
      alamat: text(),
      noHp: text(),
      user: relationship({ ref: "User.profile" }),
    },
  }),

  

};
