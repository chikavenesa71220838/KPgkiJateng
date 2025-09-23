import { config, list } from "@keystone-6/core";
import {
  text,
  select,
  relationship,
  file,
  timestamp,
} from "@keystone-6/core/fields";
import { statelessSessions } from "@keystone-6/core/session";
import path from "path";
import "dotenv/config";

// Session config
const sessionSecret = process.env.SESSION_SECRET || "supersecret";
const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30,
});

const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export default config({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./mobileGereja.db",
  },

  server: {
    cors: {
      origin: [
        "http://localhost:8081",
        "http://localhost:19006",
        "exp://127.0.0.1:19000",
      ],
      credentials: true,
    },
    port: 3000,
  },

  storage: {
    local_files: {
      kind: "local",
      type: "file",
      storagePath: path.join(process.cwd(), "public", "files"),
      serverRoute: {
        path: "/files",
      },
      generateUrl: (filePath) => `/files/${filePath}`,
    },
  },

  lists: {
    User: list({
      access: allowAll,
      fields: {
        namaUser: text({ validation: { isRequired: true } }),
        emailUser: text({
          validation: { isRequired: true },
          isIndexed: "unique",
        }),
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
        noHp: text(),
        user: relationship({ ref: "User.profile" }),
      },
    }),

    Warta: list({
      access: allowAll,
      fields: {
        kategori: text({ validation: { isRequired: true } }),
        judul: text({ validation: { isRequired: true } }),
        masaBerlaku: timestamp({ validation: { isRequired: true } }),
        tanggalPelaksanaan: timestamp({ validation: { isRequired: true } }),
        file: file({ storage: "local_files" }),
        createdAt: timestamp({
          defaultValue: { kind: "now" },
        }),
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
  },

  session,
});
