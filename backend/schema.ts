import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  select,
  file,
  image,
  timestamp,
  password,
  calendarDay,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";

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
      emailUser: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
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
  }),

  Profile: list({
    access: allowAll,
    fields: {
      alamat: text(),
      nomorWa: text(),
      jenisKelamin: select({
        options: [
          { label: "Laki-laki", value: "L" },
          { label: "Perempuan", value: "P" },
        ],
      }),
      pendidikan: text(),
      pekerjaan: text(),
      tanggalLahir: text(),
      statusPernikahan: select({
        options: [
          { label: "Belum Menikah", value: "single" },
          { label: "Menikah", value: "married" },
        ],
      }),
      domisili: text(),
      statusKeanggotaan: select({
        options: [
          { label: "Anggota", value: "anggota" },
          { label: "Simpatisan", value: "simpatisan" },
        ],
      }),
      fotoProfil: image({
        storage: "local_images",
        hooks: {
          validateInput: async ({ resolvedData, addValidationError }) => {
            const file = resolvedData.fotoProfil;
            if (file && file.mimetype !== "image/jpeg") {
              addValidationError("Hanya file JPEG yang diperbolehkan.");
            }
          },
        },
      }),
      user: relationship({ ref: "User.profile" }),
    },
  }),

  Warta: list({
    access: allowAll,
    fields: {
      kategori: text({ validation: { isRequired: true } }),
      judul: text({ validation: { isRequired: true } }),
      masaBerlaku: timestamp(),
      tanggalPelaksanaan: timestamp(),
      file: file({
        storage: "local_files",
        hooks: {
          validateInput: async ({ resolvedData, addValidationError }) => {
            const file = resolvedData.file;
            if (file && file.mimetype !== "application/pdf") {
              addValidationError("Hanya file PDF yang diperbolehkan untuk warta.");
            }
          },
        },
      }),
      createdAt: timestamp({ defaultValue: { kind: "now" } }),
    },
  }),

  JadwalIbadah: list({
    access: allowAll,
    fields: {
      tanggal: calendarDay({
        validation: { isRequired: true },
      }),
      topik: text(),
      detailIbadah: relationship({
        ref: "DetailIbadah.jadwal",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["jam", "pengkhotbah", "banner"],
          inlineCreate: { fields: ["jam", "pengkhotbah", "banner"] },
          inlineEdit: { fields: ["jam", "pengkhotbah", "banner"] },
        },
      }),
    },
    ui: { labelField: "topik" },
  }),

  DetailIbadah: list({
    access: allowAll,
    fields: {
      jam: text({
        validation: { isRequired: true },
      }),
      pengkhotbah: text(),
      banner: image({
        storage: "local_images",
        hooks: {
          validateInput: async ({ resolvedData, addValidationError }) => {
            const file = resolvedData.banner;
            if (!file || !file.filename) return;

            const lower = file.filename.toLowerCase();
            if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
              addValidationError("Hanya file JPEG yang diperbolehkan untuk banner.");
            }
          },
        },
      }),
      jadwal: relationship({ ref: "JadwalIbadah.detailIbadah" }),
    },
    ui: { labelField: "jam" },
  }),
};
