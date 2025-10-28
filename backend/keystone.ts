// keystone.ts
import { config } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import path from "path";
import express from "express";
import "dotenv/config";

import { lists } from "./schema/index.js";
import ayatHarianRoute from "./routes/ayatHarian.js";
import startAyatScheduler from "./scheduler/ayatScheduler.js";

// 🔐 Session config
const sessionSecret = process.env.SESSION_SECRET || "supersecret";
const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30, // 30 hari
});

export default config({
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./mobileGereja.db",
  },
  server: {
    cors: {
      origin: [
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:19006",
      ],
      credentials: true,
    },
    port: 3000,
    options: { host: "0.0.0.0" },

    extendExpressApp: (app, context) => {
      app.use(express.json());

      // ✅ `context` di sini sudah merupakan Keystone context, tidak perlu dipanggil
      const sudoContext = context.sudo();

      // ✅ Pasang route custom & scheduler
      ayatHarianRoute(app, sudoContext);
      startAyatScheduler(sudoContext);

      // 🔍 Route test
      app.get("/api/status", (req, res) => {
        res.json({ status: "API is running ✅" });
      });
    },
  },

  storage: {
    local_files: {
      kind: "local",
      type: "file",
      storagePath: path.join(process.cwd(), "public", "files"),
      serverRoute: { path: "/files" },
      generateUrl: (filePath) => `/files/${filePath}`,
    },
    local_images: {
      kind: "local",
      type: "image",
      storagePath: path.join(process.cwd(), "public", "images"),
      serverRoute: { path: "/images" },
      generateUrl: (filePath) => `/images/${filePath}`,
    },
  },

  ui: {
    isAccessAllowed: (context) => {
      if (process.env.NODE_ENV === "development") return true;
      return !!context.session?.data && context.session.data.role === "admin";
    },
  },

  lists,
  session,
});
