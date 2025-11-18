var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);
var import_core13 = require("@keystone-6/core");
var import_session = require("@keystone-6/core/session");
var import_path = __toESM(require("path"));
var import_express = __toESM(require("express"));
var import_config = require("dotenv/config");

// schema/User.ts
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/core/fields");
var allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var User = (0, import_core.list)({
  access: allowAll,
  fields: {
    namaUser: (0, import_fields.text)({ validation: { isRequired: true } }),
    emailUser: (0, import_fields.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
    password: (0, import_fields.password)(),
    googleId: (0, import_fields.text)({ isIndexed: "unique" }),
    role: (0, import_fields.select)({
      options: [
        { label: "Admin", value: "admin" },
        { label: "Jemaat", value: "jemaat" }
      ],
      defaultValue: "jemaat",
      ui: { displayMode: "segmented-control" }
    }),
    profile: (0, import_fields.relationship)({ ref: "Profile.user", many: false })
  }
});

// schema/Profile.ts
var import_core2 = require("@keystone-6/core");
var import_fields2 = require("@keystone-6/core/fields");
var allowAll2 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var Profile = (0, import_core2.list)({
  access: allowAll2,
  fields: {
    alamat: (0, import_fields2.text)(),
    nomorWa: (0, import_fields2.text)(),
    jenisKelamin: (0, import_fields2.select)({
      options: [
        { label: "Laki-laki", value: "L" },
        { label: "Perempuan", value: "P" }
      ]
    }),
    pendidikan: (0, import_fields2.text)(),
    pekerjaan: (0, import_fields2.text)(),
    tanggalLahir: (0, import_fields2.text)(),
    statusPernikahan: (0, import_fields2.select)({
      options: [
        { label: "Belum Menikah", value: "single" },
        { label: "Menikah", value: "married" }
      ]
    }),
    domisili: (0, import_fields2.text)(),
    statusKeanggotaan: (0, import_fields2.select)({
      options: [
        { label: "Anggota", value: "anggota" },
        { label: "Simpatisan", value: "simpatisan" }
      ]
    }),
    fotoProfil: (0, import_fields2.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.fotoProfil;
          if (file && file.mimetype !== "image/jpeg") {
            addValidationError("Hanya file JPEG yang diperbolehkan.");
          }
        }
      }
    }),
    user: (0, import_fields2.relationship)({ ref: "User.profile" })
  }
});

// schema/KategoriWarta.ts
var import_core3 = require("@keystone-6/core");
var import_fields3 = require("@keystone-6/core/fields");
var allowAll3 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var KategoriWarta = (0, import_core3.list)({
  access: allowAll3,
  fields: {
    nama: (0, import_fields3.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
    warta: (0, import_fields3.relationship)({ ref: "Warta.kategori", many: true })
  },
  ui: { labelField: "nama" }
});

// schema/Warta.ts
var import_core4 = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
var allowAll4 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var Warta = (0, import_core4.list)({
  access: allowAll4,
  fields: {
    kategori: (0, import_fields4.relationship)({
      ref: "KategoriWarta.warta",
      many: false,
      ui: { displayMode: "select" }
    }),
    judul: (0, import_fields4.text)({
      validation: { isRequired: true }
    }),
    masaBerlaku: (0, import_fields4.calendarDay)(),
    tanggalPelaksanaan: (0, import_fields4.timestamp)(),
    isiWarta: (0, import_fields_document.document)({
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true
        },
        listTypes: true,
        alignment: true,
        headingLevels: [1, 2, 3, 4, 5, 6]
      },
      links: true,
      dividers: true,
      layouts: [[1], [1, 1], [1, 1, 1]]
    }),
    gambar: (0, import_fields4.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambar;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png"))) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar warta."
            );
          }
        }
      }
    }),
    createdAt: (0, import_fields4.timestamp)({
      defaultValue: { kind: "now" },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" }
      }
    })
  }
});

// schema/Pengkhotbah.ts
var import_core5 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");
var allowAll5 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var Pengkhotbah = (0, import_core5.list)({
  access: allowAll5,
  fields: {
    foto: (0, import_fields5.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.foto;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk foto."
            );
          }
        }
      }
    }),
    nama: (0, import_fields5.text)({ validation: { isRequired: true } }),
    kontak: (0, import_fields5.text)(),
    detailIbadah: (0, import_fields5.relationship)({ ref: "DetailIbadah.pengkhotbah", many: true })
  },
  ui: { labelField: "nama" }
});

// schema/JadwalIbadah.ts
var import_core6 = require("@keystone-6/core");
var import_fields6 = require("@keystone-6/core/fields");
var allowAll6 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var JadwalIbadah = (0, import_core6.list)({
  access: allowAll6,
  fields: {
    tanggal: (0, import_fields6.calendarDay)({ validation: { isRequired: true } }),
    topik: (0, import_fields6.text)(),
    detailIbadah: (0, import_fields6.relationship)({
      ref: "DetailIbadah.jadwal",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["jam", "pengkhotbah", "banner"],
        inlineCreate: { fields: ["jam", "pengkhotbah", "banner"] },
        inlineEdit: { fields: ["jam", "pengkhotbah", "banner"] }
      }
    })
  },
  ui: { labelField: "topik" }
});

// schema/DetailIbadah.ts
var import_core7 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
var allowAll7 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var DetailIbadah = (0, import_core7.list)({
  access: allowAll7,
  fields: {
    jam: (0, import_fields7.text)({ validation: { isRequired: true } }),
    pengkhotbah: (0, import_fields7.relationship)({
      ref: "Pengkhotbah.detailIbadah",
      ui: { displayMode: "select" }
    }),
    banner: (0, import_fields7.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.banner;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
            addValidationError("Hanya file JPEG yang diperbolehkan untuk banner.");
          }
        }
      }
    }),
    jadwal: (0, import_fields7.relationship)({ ref: "JadwalIbadah.detailIbadah" })
  },
  ui: { labelField: "jam" }
});

// schema/AyatHarian.ts
var import_core8 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
var allowAll8 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var AyatHarian = (0, import_core8.list)({
  access: allowAll8,
  fields: {
    book: (0, import_fields8.text)({ validation: { isRequired: true } }),
    chapter: (0, import_fields8.text)({ validation: { isRequired: true } }),
    verse: (0, import_fields8.text)({ validation: { isRequired: true } }),
    text: (0, import_fields8.text)({ ui: { displayMode: "textarea" } }),
    tanggal: (0, import_fields8.timestamp)({
      validation: { isRequired: true },
      defaultValue: { kind: "now" }
    })
  }
});

// schema/pendeta.ts
var import_core9 = require("@keystone-6/core");
var import_fields9 = require("@keystone-6/core/fields");
var allowAll9 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var Pendeta = (0, import_core9.list)({
  access: allowAll9,
  fields: {
    foto: (0, import_fields9.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.foto;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk foto."
            );
          }
        }
      }
    }),
    nama: (0, import_fields9.text)({ validation: { isRequired: true } }),
    email: (0, import_fields9.text)({
      validation: { isRequired: true },
      isIndexed: "unique",
      ui: { description: "Email pendeta (harus unik)" }
    }),
    kontak: (0, import_fields9.text)(),
    sejakKapanAktif: (0, import_fields9.calendarDay)({
      validation: { isRequired: true },
      ui: {
        description: "Tanggal mulai aktif di gereja ini"
      }
    }),
    gereja: (0, import_fields9.relationship)({
      ref: "Gereja.pendeta",
      ui: { description: "Gereja tempat pendeta ini aktif melayani" }
    })
  },
  ui: { labelField: "nama" }
});

// schema/dataGereja.ts
var import_core10 = require("@keystone-6/core");
var import_fields10 = require("@keystone-6/core/fields");
var allowAll10 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var Gereja = (0, import_core10.list)({
  access: allowAll10,
  fields: {
    logo: (0, import_fields10.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.logo;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar gereja."
            );
          }
        }
      },
      ui: {
        description: "logo gereja"
      }
    }),
    gambar: (0, import_fields10.image)({
      storage: "local_images",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file = resolvedData.gambar;
          if (!file || !file.filename) return;
          const lower = file.filename.toLowerCase();
          if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            addValidationError(
              "Hanya file JPG, JPEG, atau PNG yang diperbolehkan untuk gambar gereja."
            );
          }
        }
      },
      ui: {
        description: "Foto atau banner utama gereja"
      }
    }),
    nama: (0, import_fields10.text)({ validation: { isRequired: true } }),
    alamat: (0, import_fields10.text)({
      validation: { isRequired: true },
      ui: { displayMode: "textarea", description: "Alamat lengkap gereja" }
    }),
    hari: (0, import_fields10.text)({
      validation: { isRequired: true },
      ui: {
        displayMode: "textarea",
        description: "Hari operasional gereja (contoh: Senin - Minggu)"
      }
    }),
    telepon: (0, import_fields10.text)({
      ui: { description: "Nomor telepon gereja" }
    }),
    linkWhatsapp: (0, import_fields10.text)({
      ui: { description: "Tautan WhatsApp gereja" }
    }),
    linkInstagram: (0, import_fields10.text)({
      ui: { description: "Tautan Instagram gereja" }
    }),
    linkYoutube: (0, import_fields10.text)({
      ui: { description: "Tautan YouTube gereja" }
    }),
    linkFacebook: (0, import_fields10.text)({
      ui: { description: "Tautan Facebook gereja" }
    }),
    linkEmail: (0, import_fields10.text)({
      ui: { description: "Alamat email resmi gereja" }
    }),
    sejarah: (0, import_fields10.text)({
      ui: {
        displayMode: "textarea",
        description: "Sejarah singkat gereja ini"
      }
    }),
    pendeta: (0, import_fields10.relationship)({
      ref: "Pendeta.gereja",
      many: true,
      ui: {
        description: "Daftar pendeta yang aktif di gereja ini"
      }
    })
  },
  ui: {
    labelField: "nama",
    listView: {
      initialColumns: ["nama", "alamat", "hari", "jamBuka", "jamTutup"]
    }
  }
});

// schema/jadwalRutin.ts
var import_core11 = require("@keystone-6/core");
var import_fields11 = require("@keystone-6/core/fields");
var allowAll11 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var jadwalRutin = (0, import_core11.list)({
  access: allowAll11,
  fields: {
    namaIbadah: (0, import_fields11.text)({
      validation: { isRequired: true },
      ui: {
        description: "Masukkan nama ibadah"
      }
    }),
    nama: (0, import_fields11.select)({
      options: [
        { label: "Senin", value: "Senin" },
        { label: "Selasa", value: "Selasa" },
        { label: "Rabu", value: "Rabu" },
        { label: "Kamis", value: "Kamis" },
        { label: "Jumat", value: "Jumat" },
        { label: "Sabtu", value: "Sabtu" },
        { label: "Minggu", value: "Minggu" }
      ],
      validation: { isRequired: true },
      ui: { displayMode: "select" }
    }),
    waktu: (0, import_fields11.relationship)({
      ref: "jam.jadwalRutin",
      many: true,
      ui: {
        displayMode: "select",
        labelField: "jam"
      }
    })
  }
});

// schema/jam.ts
var import_core12 = require("@keystone-6/core");
var import_fields12 = require("@keystone-6/core/fields");
var allowAll12 = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var jam = (0, import_core12.list)({
  access: allowAll12,
  fields: {
    jam: (0, import_fields12.text)({
      validation: { isRequired: true }
    }),
    jadwalRutin: (0, import_fields12.relationship)({
      ref: "jadwalRutin.waktu",
      many: true
    })
  }
});

// schema/index.ts
var lists = {
  User,
  Profile,
  KategoriWarta,
  Warta,
  Pengkhotbah,
  JadwalIbadah,
  DetailIbadah,
  AyatHarian,
  Pendeta,
  Gereja,
  jadwalRutin,
  jam
};

// services/aytService.js
var import_node_fetch = __toESM(require("node-fetch"));

// services/kitab.js
var books = [
  // Perjanjian Lama
  { code: "Kej", name: "Kejadian", chapters: 50 },
  { code: "Kel", name: "Keluaran", chapters: 40 },
  { code: "Im", name: "Imamat", chapters: 27 },
  { code: "Bil", name: "Bilangan", chapters: 36 },
  { code: "Ul", name: "Ulangan", chapters: 34 },
  { code: "Yos", name: "Yosua", chapters: 24 },
  { code: "Hak", name: "Hakim-hakim", chapters: 21 },
  { code: "Rut", name: "Rut", chapters: 4 },
  { code: "1Sam", name: "1 Samuel", chapters: 31 },
  { code: "2Sam", name: "2 Samuel", chapters: 24 },
  { code: "1Raj", name: "1 Raja-raja", chapters: 22 },
  { code: "2Raj", name: "2 Raja-raja", chapters: 25 },
  { code: "1Taw", name: "1 Tawarikh", chapters: 29 },
  { code: "2Taw", name: "2 Tawarikh", chapters: 36 },
  { code: "Ezra", name: "Ezra", chapters: 10 },
  { code: "Neh", name: "Nehemia", chapters: 13 },
  { code: "Est", name: "Ester", chapters: 10 },
  { code: "Ayb", name: "Ayub", chapters: 42 },
  { code: "Maz", name: "Mazmur", chapters: 150 },
  { code: "Ams", name: "Amsal", chapters: 31 },
  { code: "Peng", name: "Pengkhotbah", chapters: 12 },
  { code: "Kid", name: "Kidung Agung", chapters: 8 },
  { code: "Yes", name: "Yesaya", chapters: 66 },
  { code: "Yer", name: "Yeremia", chapters: 52 },
  { code: "Rat", name: "Ratapan", chapters: 5 },
  { code: "Yeh", name: "Yehezkiel", chapters: 48 },
  { code: "Dan", name: "Daniel", chapters: 12 },
  { code: "Hos", name: "Hosea", chapters: 14 },
  { code: "Yoel", name: "Yoel", chapters: 3 },
  { code: "Amos", name: "Amos", chapters: 9 },
  { code: "Oba", name: "Obaja", chapters: 1 },
  { code: "Yun", name: "Yunus", chapters: 4 },
  { code: "Mik", name: "Mikha", chapters: 7 },
  { code: "Nah", name: "Nahum", chapters: 3 },
  { code: "Hab", name: "Habakuk", chapters: 3 },
  { code: "Zef", name: "Zefanya", chapters: 3 },
  { code: "Hag", name: "Hagai", chapters: 2 },
  { code: "Zak", name: "Zakharia", chapters: 14 },
  { code: "Mal", name: "Maleakhi", chapters: 4 },
  // Perjanjian Baru
  { code: "Mat", name: "Matius", chapters: 28 },
  { code: "Mrk", name: "Markus", chapters: 16 },
  { code: "Luk", name: "Lukas", chapters: 24 },
  { code: "Yoh", name: "Yohanes", chapters: 21 },
  { code: "Kis", name: "Kisah Para Rasul", chapters: 28 },
  { code: "Rom", name: "Roma", chapters: 16 },
  { code: "1Kor", name: "1 Korintus", chapters: 16 },
  { code: "2Kor", name: "2 Korintus", chapters: 13 },
  { code: "Gal", name: "Galatia", chapters: 6 },
  { code: "Ef", name: "Efesus", chapters: 6 },
  { code: "Flp", name: "Filipi", chapters: 4 },
  { code: "Kol", name: "Kolose", chapters: 4 },
  { code: "1Tes", name: "1 Tesalonika", chapters: 5 },
  { code: "2Tes", name: "2 Tesalonika", chapters: 3 },
  { code: "1Tim", name: "1 Timotius", chapters: 6 },
  { code: "2Tim", name: "2 Timotius", chapters: 4 },
  { code: "Tit", name: "Titus", chapters: 3 },
  { code: "Flm", name: "Filemon", chapters: 1 },
  { code: "Ibr", name: "Ibrani", chapters: 13 },
  { code: "Yak", name: "Yakobus", chapters: 5 },
  { code: "1Pet", name: "1 Petrus", chapters: 5 },
  { code: "2Pet", name: "2 Petrus", chapters: 3 },
  { code: "1Yoh", name: "1 Yohanes", chapters: 5 },
  { code: "2Yoh", name: "2 Yohanes", chapters: 1 },
  { code: "3Yoh", name: "3 Yohanes", chapters: 1 },
  { code: "Yud", name: "Yudas", chapters: 1 },
  { code: "Wah", name: "Wahyu", chapters: 22 }
];

// services/aytService.js
var fallbackVerse = {
  book: "Mazmur",
  chapter: "23",
  verse: "1",
  text: "Tuhan adalah gembalaku, takkan kekurangan aku."
};
function getSeededRandom(seed, max) {
  const x = Math.sin(seed) * 1e4;
  return Math.floor((x - Math.floor(x)) * max);
}
function getTodaySeed() {
  const today = /* @__PURE__ */ new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return y * 1e4 + m * 100 + d;
}
async function fetchWithTimeout(url, timeout = 5e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await (0, import_node_fetch.default)(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}
async function getRandomVerse() {
  const seed = getTodaySeed();
  const bookIndex = getSeededRandom(seed, books.length);
  const randomBook = books[bookIndex];
  const chapter = getSeededRandom(seed + 1, randomBook.chapters) + 1;
  const url = `https://beeble.vercel.app/api/v1/passage/${randomBook.code}/${chapter}`;
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const res = await fetchWithTimeout(url, 15e3);
      if (!res.ok) throw new Error(`Error fetching verse: ${res.status} ${res.statusText}`);
      const data = await res.json();
      const contentVerses = data.data.verses.filter((v) => v.type === "content");
      if (!contentVerses.length) throw new Error("Tidak ada ayat content di chapter ini");
      const verseIndex = getSeededRandom(seed + 2, contentVerses.length);
      const verse = contentVerses[verseIndex];
      return {
        book: data.data.book.name,
        chapter: String(data.data.book.chapter),
        verse: String(verse.verse),
        text: verse.content
      };
    } catch (err) {
      attempts++;
      console.warn(`Attempt ${attempts} failed:`, err.message);
      if (attempts >= maxAttempts) {
        console.warn("API gagal, pakai fallback verse.");
        return fallbackVerse;
      }
    }
  }
}

// routes/ayatHarian.js
async function ayatHarianRoute(app, context) {
  app.get("/api/ayat-harian", async (req, res) => {
    try {
      const { prisma } = context.sudo();
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      let ayat = await prisma.ayatHarian.findFirst({
        where: { tanggal: { gte: today.toISOString() } }
      });
      if (!ayat) {
        console.log("Belum ada ayat hari ini, membuat baru...");
        const randomAyat = await getRandomVerse();
        ayat = await prisma.ayatHarian.create({
          data: {
            book: randomAyat.book,
            chapter: randomAyat.chapter,
            verse: randomAyat.verse,
            text: randomAyat.text,
            tanggal: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      res.json(ayat);
    } catch (err) {
      console.error("Gagal mengambil ayat:", err);
      res.status(500).json({ error: err.message });
    }
  });
}

// scheduler/ayatScheduler.js
var import_node_cron = __toESM(require("node-cron"));
function startAyatScheduler(context) {
  async function updateDailyVerse() {
    const { prisma } = context.sudo();
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.ayatHarian.findFirst({
      where: { tanggal: { gte: today.toISOString() } }
    });
    if (!existing) {
      console.log("Tidak ada ayat hari ini, membuat baru...");
      const randomAyat = await getRandomVerse();
      await prisma.ayatHarian.create({
        data: {
          book: randomAyat.book,
          chapter: randomAyat.chapter,
          verse: randomAyat.verse,
          text: randomAyat.text,
          tanggal: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      console.log("Ayat harian baru tersimpan di database");
    } else {
      console.log("Ayat harian sudah ada, tidak diperbarui.");
    }
  }
  updateDailyVerse();
  import_node_cron.default.schedule("0 0 * * *", () => {
    updateDailyVerse();
  }, {
    timezone: "Asia/Jakarta"
  });
  console.log("\u{1F4C5} Scheduler Ayat Harian aktif (Asia/Jakarta, 00:00)");
}

// keystone.ts
var sessionSecret = process.env.SESSION_SECRET || "supersecret";
var session = (0, import_session.statelessSessions)({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30
  // 30 hari
});
var keystone_default = (0, import_core13.config)({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./mobileGereja.db"
  },
  server: {
    cors: {
      origin: [
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:19006"
      ],
      credentials: true
    },
    port: 3e3,
    options: { host: "0.0.0.0" },
    extendExpressApp: (app, context) => {
      app.use(import_express.default.json());
      const sudoContext = context.sudo();
      ayatHarianRoute(app, sudoContext);
      startAyatScheduler(sudoContext);
      app.get("/api/status", (req, res) => {
        res.json({ status: "API is running \u2705" });
      });
    }
  },
  storage: {
    local_files: {
      kind: "local",
      type: "file",
      storagePath: import_path.default.join(process.cwd(), "public", "files"),
      serverRoute: { path: "/files" },
      generateUrl: (filePath) => `/files/${filePath}`
    },
    local_images: {
      kind: "local",
      type: "image",
      storagePath: import_path.default.join(process.cwd(), "public", "images"),
      serverRoute: { path: "/images" },
      generateUrl: (filePath) => `/images/${filePath}`
    }
  },
  ui: {
    isAccessAllowed: (context) => {
      if (process.env.NODE_ENV === "development") return true;
      return !!context.session?.data && context.session.data.role === "admin";
    }
  },
  lists,
  session
});
//# sourceMappingURL=config.js.map
