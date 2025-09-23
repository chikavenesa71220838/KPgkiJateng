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
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/core/fields");
var import_session = require("@keystone-6/core/session");
var import_path = __toESM(require("path"));
var import_config = require("dotenv/config");
var sessionSecret = process.env.SESSION_SECRET || "supersecret";
var session = (0, import_session.statelessSessions)({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30
});
var allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  }
};
var keystone_default = (0, import_core.config)({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./mobileGereja.db"
  },
  server: {
    cors: {
      origin: true,
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
      serverRoute: {
        path: "/files"
      },
      generateUrl: (filePath) => `/files/${filePath}`
    }
  },
  ui: {
    isAccessAllowed: (context) => {
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      return !!context.session?.data && context.session.data.role === "admin";
    }
  },
  lists: {
    User: (0, import_core.list)({
      access: allowAll,
      fields: {
        namaUser: (0, import_fields.text)({ validation: { isRequired: true } }),
        emailUser: (0, import_fields.text)({
          validation: { isRequired: true },
          isIndexed: "unique"
        }),
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
    }),
    Profile: (0, import_core.list)({
      access: allowAll,
      fields: {
        alamat: (0, import_fields.text)(),
        noHp: (0, import_fields.text)(),
        user: (0, import_fields.relationship)({ ref: "User.profile" })
      }
    }),
    Warta: (0, import_core.list)({
      access: allowAll,
      fields: {
        kategori: (0, import_fields.text)({ validation: { isRequired: true } }),
        judul: (0, import_fields.text)({ validation: { isRequired: true } }),
        masaBerlaku: (0, import_fields.timestamp)({ validation: { isRequired: true } }),
        tanggalPelaksanaan: (0, import_fields.timestamp)({ validation: { isRequired: true } }),
        file: (0, import_fields.file)({ storage: "local_files" }),
        createdAt: (0, import_fields.timestamp)({
          defaultValue: { kind: "now" }
        })
      }
    }),
    JadwalIbadah: (0, import_core.list)({
      access: allowAll,
      fields: {
        tanggal: (0, import_fields.timestamp)({ validation: { isRequired: true } }),
        pengkhotbah: (0, import_fields.text)(),
        topik: (0, import_fields.text)()
      }
    })
  },
  session
});
//# sourceMappingURL=config.js.map
