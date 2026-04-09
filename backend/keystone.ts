import { config } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import { createAuth } from "@keystone-6/auth";
import path from "path";
import express from "express";
import "dotenv/config";
import admin from "firebase-admin";
import { lists } from "./schema/index.js";
import ayatHarianRoute from "./routes/ayatHarian.js";
import startAyatScheduler from "./scheduler/ayatScheduler.js";
import cookieParser from "cookie-parser";

// Firebase init (sama seperti sebelumnya)
const serviceAccountPath = path.resolve(
  process.cwd(),
  "serviceAccountKey.json",
);
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

// ← Setup auth Keystone
const { withAuth } = createAuth({
  listKey: "Admin",
  identityField: "email",
  secretField: "password",
  sessionData: "id email",
  initFirstItem: {
    // Pertama kali deploy, Keystone akan minta buat akun admin
    fields: ["name", "email", "password"],
  },
});

const sessionSecret = process.env.SESSION_SECRET!;
if (!sessionSecret) throw new Error("SESSION_SECRET harus diset di .env!");

const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 8,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

// ← Wrap config dengan withAuth
export default withAuth(
  config({
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
        app.use(cookieParser());
        app.use(express.json());

        app.use("/api/graphql", async (req, res, next) => {
          // Izinkan IntrospectionQuery
          if (req.body?.operationName === "IntrospectionQuery") return next();

          // ← Izinkan request dari Admin UI (pakai session cookie Keystone)
          if (req.cookies?.["keystonejs-session"]) return next();

          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split("Bearer ")[1];
            try {
              const decodedToken = await admin.auth().verifyIdToken(token);
              (req as any).user = decodedToken;
              return next();
            } catch (error: any) {
              return res.status(401).json({
                errors: [{ message: `Sesi tidak valid: ${error.message}` }],
              });
            }
          }

          if (process.env.NODE_ENV === "development" && !authHeader)
            return next();

          return res.status(401).json({
            errors: [
              { message: "Akses ditolak. Token autentikasi diperlukan." },
            ],
          });
        });

        const sudoContext = context.sudo();
        ayatHarianRoute(app, sudoContext);
        startAyatScheduler(sudoContext);

        app.get("/api/status", (req, res) => {
          res.json({
            status: "API is running",
            security: "Firebase Admin Active",
            time: new Date().toISOString(),
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
      isAccessAllowed: (context) => !!context.session?.data,
    },

    lists,
    session,
  }),
);
