// schema.ts
import { list } from '@keystone-6/core';
import { text, relationship, select, file, image, timestamp, password } from '@keystone-6/core/fields';
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
  User: list({
    access: allowAll,
    fields: {
      namaUser: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      password: password(),
      role: select({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Jemaat', value: 'jemaat' },
        ],
        defaultValue: 'jemaat',
        ui: { displayMode: 'segmented-control' },
      }),
      profile: relationship({ ref: 'Profile.user', many: false }),
    },
  }),

  Profile: list({
    access: allowAll,
    fields: {
      alamat: text(),
      nomorWa: text(),
      jenisKelamin: select({
        options: [
          { label: 'Laki-laki', value: 'L' },
          { label: 'Perempuan', value: 'P' },
        ],
      }),
      pendidikan: text(),
      pekerjaan: text(),
      tanggalLahir: text(),
      statusPernikahan: select({
        options: [
          { label: 'Belum Menikah', value: 'single' },
          { label: 'Menikah', value: 'married' },
        ],
      }),
      domisili: text(),
      statusKeanggotaan: select({
        options: [
          { label: 'Anggota', value: 'anggota' },
          { label: 'Simpatisan', value: 'simpatisan' },
        ],
      }),
      fotoProfil: image({ storage: 'local_images' }),
      user: relationship({ ref: 'User.profile' }),
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

  Warta: list({
    access: allowAll,
    fields: {
      kategori: text({ validation: { isRequired: true } }),
      judul: text({ validation: { isRequired: true } }),
      file: file({ storage: 'local_files' }),
      masaBerlaku: timestamp(),
      tanggalPelaksanaan: timestamp(),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
};
