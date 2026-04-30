import { config } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import { createAuth } from "@keystone-6/auth";
import path from "path";
import express from "express";
import "dotenv/config";
import admin from "firebase-admin";
import { parse, OperationDefinitionNode } from "graphql"; // ← tambah ini
import { lists } from "./schema/index.js";
import ayatHarianRoute from "./routes/ayatHarian.js";
import startAyatScheduler from "./scheduler/ayatScheduler.js";
import cookieParser from "cookie-parser";

const serviceAccountPath = path.resolve(
  process.cwd(),
  "serviceAccountKey.json",
);
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log("Firebase Admin Initialized");
  } catch (error: any) {
    console.error("Gagal membaca isi file JSON Firebase:", error.message);
    process.exit(1);
  }
}

const { withAuth } = createAuth({
  listKey: "Admin",
  identityField: "email",
  secretField: "password",
  sessionData: "id email",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
});

const sessionSecret = process.env.SESSION_SECRET!;
if (!sessionSecret) throw new Error("SESSION_SECRET harus diset di .env!");

const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 8,
  secure: false,
  sameSite: "lax",
});

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
          if (req.body?.operationName === "IntrospectionQuery") return next();
          if (req.cookies?.["keystonejs-session"]) return next();

          const referer = req.headers.referer || "";
          if (referer.includes("/init") || referer.includes("/signin"))
            return next();

          const PROTECTED_FIELDS = ["user", "users", "profile", "profiles"];

          // Cek apakah query menyentuh field yang dilindungi
          const query = req.body?.query || "";
          let needsAuth = false;

          try {
            const parsed = parse(query);
            const operations = parsed.definitions.filter(
              (d): d is OperationDefinitionNode =>
                d.kind === "OperationDefinition",
            );

            for (const op of operations) {
              for (const selection of op.selectionSet.selections) {
                if (
                  selection.kind === "Field" &&
                  PROTECTED_FIELDS.includes(selection.name.value)
                ) {
                  needsAuth = true;
                  break;
                }
              }
            }
          } catch {
            // Query tidak valid, biarkan GraphQL yang handle
          }

          // tidak butuh auth hit berhasil tanpa token
          if (!needsAuth) return next();

          // Kalau butuh auth → wajib Bearer token
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

          return res.status(401).json({
            errors: [
              {
                message:
                  "Unauthorized: Token Firebase diperlukan untuk mengakses data ini.",
              },
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