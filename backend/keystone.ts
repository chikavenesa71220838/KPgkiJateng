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

import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";

// ================== SESSION CONFIG ==================
const sessionSecret = process.env.SESSION_SECRET || "supersecret";
const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30,
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";

// Access rules
const allowAll = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

// ================== CONFIG ==================
export default config({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./mobileGereja.db",
  },

  server: {
    cors: {
      origin: true,
      credentials: true,
    },
    port: 3000,
    options: { host: "0.0.0.0" },

    // Tambahin endpoint custom
    extendExpressApp: (app, context) => {
      app.use(express.json());

      // === LOGIN GOOGLE ===
      app.post("/auth/google", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "No token" });

    interface GoogleUserInfo {
      id: string;
      email: string;
      name: string;
      picture?: string;
    }

    const { data: userInfo } = await axios.get<GoogleUserInfo>(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const { id, email, name } = userInfo;

    let user = await context.db.User.findOne({ where: { emailUser: email } });
    if (!user) {
      user = await context.db.User.createOne({
        data: {
          namaUser: name,
          emailUser: email,
          googleId: id,
          role: "jemaat",
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  } catch (err: any) {
    console.error("Google login error:", err.response?.data || err.message);
    res.status(500).json({ error: "Login gagal" });
  }
});

    },
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

  ui: {
    isAccessAllowed: (context) => {
      if (process.env.NODE_ENV === "development") {
        return true;
      }
      return !!context.session?.data && context.session.data.role === "admin";
    },
  },

  // ================== LISTS ==================
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
