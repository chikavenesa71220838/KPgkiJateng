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
});
