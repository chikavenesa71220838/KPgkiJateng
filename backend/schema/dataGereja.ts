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
    logo: image({ storage: "local_images" }),
    gambar: image({ storage: "local_images" }),

    nama: text({ validation: { isRequired: true } }),

    alamat: text({
      validation: { isRequired: true },
      ui: { displayMode: "textarea" },
    }),

    hari: text({
      validation: { isRequired: true },
    }),

    telepon: text(),

    linkWhatsapp: text(),
    linkInstagram: text(),
    linkYoutube: text(),
    linkFacebook: text(),
    linkEmail: text(),

    sejarah: text({
      ui: { displayMode: "textarea" },
    }),

    pendeta: relationship({
      ref: "Pendeta.gereja",
      many: true,
    }),

    jadwalRutin: relationship({
      ref: "jadwalRutin.gereja",
      many: true,
    }),

    jadwalIbadah: relationship({
      ref: "JadwalIbadah.gereja",
      many: true,
    }),

    warta: relationship({
      ref: "Warta.gereja",
      many: true,
    }),
  },

  ui: {
    labelField: "nama",
  },
});
