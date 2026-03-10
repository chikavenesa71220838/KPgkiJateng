import { config } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import path from "path";
import express from "express";
import "dotenv/config";
// 1. Import Firebase Admin SDK untuk verifikasi identitas terpusat
import admin from "firebase-admin";

import { lists } from "./schema/index.js";
import ayatHarianRoute from "./routes/ayatHarian.js";
import startAyatScheduler from "./scheduler/ayatScheduler.js";

// 2. Inisialisasi Firebase Admin dengan Jalur Berkas Absolut
// Penanganan error ENOENT menggunakan path.resolve
const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");

// Jika file ada, baru inisialisasi Firebase
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log("🔥 Firebase Admin Initialized ✅");
  } catch (error: any) {
    console.error("🚨 Gagal membaca isi file JSON Firebase:", error.message);
    process.exit(1);
  }
}

const sessionSecret = process.env.SESSION_SECRET || "supersecret";
const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30, // Durasi sesi 30 hari
});

export default config({
  db: {
    // Menggunakan SQLite sesuai dengan spesifikasi kebutuhan software
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

      // 3. MIDDLEWARE VERIFIKASI TOKEN (GATEKEEPER)
      // Menjamin validitas akses pengguna sebelum masuk ke database
      app.use("/api/graphql", async (req, res, next) => {
        // Izinkan IntrospectionQuery agar Sandbox/Apollo tetap bisa terbuka
        if (req.body?.operationName === 'IntrospectionQuery') {
          return next();
        }

        const authHeader = req.headers.authorization;

        // Validasi skema autentikasi Bearer Token
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split("Bearer ")[1];
          try {
            // Verifikasi token secara real-time ke server Firebase
            const decodedToken = await admin.auth().verifyIdToken(token);
            (req as any).user = decodedToken; 
            
            return next(); 
          } catch (error: any) {
            console.error("Token Verification Failed", error.message);
            return res.status(401).json({
              errors: [{ message: `Sesi tidak valid: ${error.message}` }]
            });
          }
        }

        // Mode Development: Memberikan kelonggaran akses tanpa token hanya di lokal
        if (process.env.NODE_ENV === "development" && !authHeader) {
          return next();
        }

        return res.status(401).json({
          errors: [{ message: "Akses ditolak. Token autentikasi diperlukan." }]
        });
      });

      const sudoContext = context.sudo();
      ayatHarianRoute(app, sudoContext);
      startAyatScheduler(sudoContext);

      app.get("/api/status", (req, res) => {
        res.json({ 
          status: "API is running", 
          security: "Firebase Admin Active",
          time: new Date().toISOString()
        });
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
    // Proteksi antarmuka admin untuk kepentingan akademis secara online
    isAccessAllowed: (context) => {
      if (process.env.NODE_ENV === "development") return true;
      return !!context.session?.data && context.session.data.role === "admin";
    },
  },

  lists,
  session,
});