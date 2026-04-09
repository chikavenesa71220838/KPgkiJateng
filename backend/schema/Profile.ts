import { list } from "@keystone-6/core";
import { text, select, image, relationship } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const Profile = list({
  access: allowAll,
  fields: {
    nama: text(),
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
    fotoProfil: text(),
    user: relationship({ ref: "User.profile" }),
  },
});
