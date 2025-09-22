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
var import_auth = require("@keystone-6/auth");
var import_session = require("@keystone-6/core/session");
var import_path = __toESM(require("path"));
var import_config = require("dotenv/config");
var sessionSecret = process.env.SESSION_SECRET;
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"]
  }
});
var session = (0, import_session.statelessSessions)({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30
});
var keystone_default = withAuth(
  (0, import_core.config)({
    db: {
      provider: "sqlite",
      url: process.env.DATABASE_URL || "file:./mobileGereja.db"
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
    lists: {
      User: (0, import_core.list)({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true
          }
        },
        fields: {
          name: (0, import_fields.text)({ validation: { isRequired: true } }),
          email: (0, import_fields.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
          password: (0, import_fields.password)()
        }
      }),
      Post: (0, import_core.list)({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true
          }
        },
        fields: {
          title: (0, import_fields.text)({ validation: { isRequired: true } }),
          content: (0, import_fields.text)(),
          attachment: (0, import_fields.file)({ storage: "local_files" })
        }
      }),
      JadwalIbadah: (0, import_core.list)({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true
          }
        },
        fields: {
          tanggal: (0, import_fields.timestamp)({ validation: { isRequired: true } }),
          hari: (0, import_fields.text)(),
          jam: (0, import_fields.text)(),
          pengkhotbah: (0, import_fields.text)(),
          topik: (0, import_fields.text)()
        }
      }),
      Warta: (0, import_core.list)({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true
          }
        },
        fields: {
          kategori: (0, import_fields.text)({ validation: { isRequired: true } }),
          judul: (0, import_fields.text)({ validation: { isRequired: true } }),
          masaBerlaku: (0, import_fields.timestamp)(),
          tanggalPelaksanaan: (0, import_fields.timestamp)(),
          file: (0, import_fields.file)({ storage: "local_files" }),
          createdAt: (0, import_fields.timestamp)({
            defaultValue: { kind: "now" }
          })
        }
      })
    },
    session
  })
);
//# sourceMappingURL=config.js.map
