import { list } from "@keystone-6/core";
import { text, relationship, image } from "@keystone-6/core/fields";

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export const Gereja = list({
  access: allowAll,
  fields: {
    logo: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.logo;
          if (!file || !file.filename) return;

          const lower = file.filename.toLowerCase();
          if (
            !lower.endsWith(".jpg") &&
            !lower.endsWith(".jpeg") &&
            !lower.endsWith(".png")
          ) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar gereja."
            );
          }
        },
      },
      ui: {
        description: "logo gereja",
      },
    }),
    gambar: image({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambar;
          if (!file || !file.filename) return;

          const lower = file.filename.toLowerCase();
          if (
            !lower.endsWith(".jpg") &&
            !lower.endsWith(".jpeg") &&
            !lower.endsWith(".png")
          ) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar gereja."
            );
          }
        },
      },
      ui: {
        description: "Foto atau banner utama gereja",
      },
    }),

    nama: text({ validation: { isRequired: true } }),

    alamat: text({
      validation: { isRequired: true },
      ui: { displayMode: "textarea", description: "Alamat lengkap gereja" },
    }),

    hari: text({
      validation: { isRequired: true },
      ui: {
        displayMode: "textarea",
        description: "Hari operasional gereja (contoh: Senin - Minggu)",
      },
    }),

    telepon: text({
      ui: { description: "Nomor telepon gereja" },
    }),

    linkWhatsapp: text({
      ui: { description: "Tautan WhatsApp gereja" },
    }),

    linkInstagram: text({
      ui: { description: "Tautan Instagram gereja" },
    }),

    linkYoutube: text({
      ui: { description: "Tautan YouTube gereja" },
    }),

    linkFacebook: text({
      ui: { description: "Tautan Facebook gereja" },
    }),

    linkEmail: text({
      ui: { description: "Alamat email resmi gereja" },
    }),

    sejarah: text({
      ui: {
        displayMode: "textarea",
        description: "Sejarah singkat gereja ini",
      },
    }),

    pendeta: relationship({
      ref: "Pendeta.gereja",
      many: true,
      ui: {
        description: "Daftar pendeta yang aktif di gereja ini",
      },
    }),
  },

  ui: {
    labelField: "nama",
    listView: {
      initialColumns: ["nama", "alamat", "hari", "jamBuka", "jamTutup"],
    },
  },
});
