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
var import_core8 = require("@keystone-6/core");
var import_session = require("@keystone-6/core/session");
var import_path = __toESM(require("path"));
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
          const file2 = resolvedData.fotoProfil;
          if (file2 && file2.mimetype !== "image/jpeg") {
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
    isiWarta: (0, import_fields4.text)({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true }
    }),
    file: (0, import_fields4.file)({
      storage: "local_files",
      hooks: {
        validateInput: async ({ resolvedData, addValidationError }) => {
          const file2 = resolvedData.file;
          if (!file2 || !file2.mimetype) return;
          const allowedTypes = ["image/jpeg", "image/jpg"];
          if (!allowedTypes.includes(file2.mimetype)) {
            addValidationError(
              "Hanya file gambar JPG atau JPEG yang diperbolehkan untuk warta."
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
var allowAll5 = { operation: { query: () => true, create: () => true, update: () => true, delete: () => true } };
var Pengkhotbah = (0, import_core5.list)({
  access: allowAll5,
  fields: {
    nama: (0, import_fields5.text)({ validation: { isRequired: true } }),
    jabatan: (0, import_fields5.text)(),
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
          const file2 = resolvedData.banner;
          if (!file2 || !file2.filename) return;
          const lower = file2.filename.toLowerCase();
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

// schema/index.ts
var lists = {
  User,
  Profile,
  KategoriWarta,
  Warta,
  Pengkhotbah,
  JadwalIbadah,
  DetailIbadah
};

// keystone.ts
var sessionSecret = process.env.SESSION_SECRET || "supersecret";
var session = (0, import_session.statelessSessions)({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30
  // 30 hari
});
var keystone_default = (0, import_core8.config)({
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
    options: { host: "0.0.0.0" }
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
