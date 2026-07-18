var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
var prismaClientSingleton = () => {
  return new PrismaClient();
};
var prisma = globalThis.prisma ?? prismaClientSingleton();
var prisma_default = prisma;
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// src/lib/google-indexing.ts
import { JWT } from "google-auth-library";
async function notifyGoogleIndexing(jobId, type = "URL_UPDATED") {
  try {
    const credsJson = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credsJson) {
      console.log("[Indexing] Credentials missing. skipping Google Indexing API ping.");
      return { success: false, error: "CREDENTIALS_MISSING" };
    }
    let appUrl = "https://www.liggeybi.com";
    const targetUrl = `${appUrl}/offre/${jobId}`;
    let credsRaw = credsJson.trim();
    if (!credsRaw.startsWith("{") && !credsRaw.startsWith('"') && !credsRaw.startsWith("'") && !credsRaw.startsWith("\\{")) {
      try {
        const decoded = Buffer.from(credsRaw, "base64").toString("utf-8");
        if (decoded.trim().startsWith("{")) {
          credsRaw = decoded;
        }
      } catch (e) {
      }
    }
    let credentials;
    try {
      let parsed = JSON.parse(credsRaw);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      credentials = parsed;
    } catch (parseError) {
      try {
        let fixed = credsRaw;
        if (fixed.startsWith("'") && fixed.endsWith("'")) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        if (fixed.startsWith('"') && fixed.endsWith('"')) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        fixed = fixed.replace(/\\{/g, "{").replace(/\\}/g, "}");
        const firstIndex = fixed.indexOf("{");
        const lastIndex = fixed.lastIndexOf("}");
        if (firstIndex !== -1 && lastIndex !== -1) {
          fixed = fixed.substring(firstIndex, lastIndex + 1);
        }
        fixed = fixed.replace(/\\"/g, '"');
        fixed = fixed.replace(/\\\\n/g, "\\n");
        let parsed = JSON.parse(fixed);
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        credentials = parsed;
      } catch (fallbackError) {
        console.error("Failed to parse Google Indexing JSON credentials:", credsRaw.substring(0, 50) + "...");
        throw new Error("Impossible de parser le JSON des credentials. Copiez-collez exactement le contenu du fichier JSON t\xE9l\xE9charg\xE9 sur Google Cloud.");
      }
    }
    if (credentials && credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/indexing"]
    });
    const token = await client.getAccessToken();
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`
      },
      body: JSON.stringify({
        url: targetUrl,
        type
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Indexing] Google API Error:", errorText);
      return { success: false, error: errorText };
    } else {
      console.log(`[Indexing] Successfully notified Google: ${type} for ${targetUrl}`);
      return { success: true };
    }
  } catch (error) {
    console.error("[Indexing] Error calling Google Indexing API:", error);
    return { success: false, error: error.message || String(error) };
  }
}

// server.ts
import * as OneSignal from "onesignal-node";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var JWT_SECRET = process.env.JWT_SECRET || "LiggeybiSecretKey2024!";
var onesignalClient = process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY ? new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_API_KEY
) : null;
async function startServer() {
  const app = express();
  const PORT = 3e3;
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      // Disabling CSP for Vite dev server, images, and AdSense
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Allow external resources like AdSense
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // Critical for AdSense revenue tracking
      frameguard: false
      // Critical: Allows the app and PDFs to be embedded in an iframe
    })
  );
  app.use(cors());
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1e3,
    // 1 hour
    max: 1e3,
    // relaxed for auth
    message: "Too many attempts, please try again later"
  });
  app.use("/api/auth/", authLimiter);
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (host.match(/^liggeybi\.com$/i)) {
      return res.redirect(301, "https://www.liggeybi.com" + req.originalUrl);
    }
    next();
  });
  console.log(`[Server] Starting in ${process.env.NODE_ENV} mode...`);
  try {
    const adminEmail = "aboufaty@liggeybi.com";
    const existingAdmin = await prisma_default.user.findUnique({
      where: { email: adminEmail }
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Harouna@1955", 10);
      await prisma_default.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Aboufaty",
          role: "ADMIN",
          profile: {
            create: { nom: "Admin", prenom: "Aboufaty" }
          }
        }
      });
      console.log(
        "\u2705 Compte super-admin (aboufaty) cr\xE9\xE9/v\xE9rifi\xE9 avec succ\xE8s !"
      );
    }
    const tempAdminEmail = "snweb25@gmail.com";
    let tempAdmin = await prisma_default.user.findUnique({
      where: { email: tempAdminEmail }
    });
    if (tempAdmin && tempAdmin.role !== "ADMIN") {
      await prisma_default.user.update({
        where: { email: tempAdminEmail },
        data: { role: "ADMIN" }
      });
      console.log(`\u2705 User ${tempAdminEmail} promoted to ADMIN.`);
    } else if (!tempAdmin) {
      const hashedTempPassword = await bcrypt.hash("admin1234", 10);
      await prisma_default.user.create({
        data: {
          email: tempAdminEmail,
          password: hashedTempPassword,
          name: "Dev Admin",
          role: "ADMIN",
          profile: {
            create: { nom: "Admin", prenom: "Dev" }
          }
        }
      });
      console.log(
        `\u2705 Temporary super-admin (snweb25@gmail.com) created with password: admin1234`
      );
    }
  } catch (err) {
    console.error("Erreur cr\xE9ation auto-admin:", err);
  }
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api", (req, res, next) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });
  const isProdEnvironment = process.env.NODE_ENV === "production" || process.env.NODE_ENV !== "development";
  const defaultDir = isProdEnvironment ? path.join(process.cwd(), "../liggeybi_uploads") : path.join(process.cwd(), "uploads");
  const uploadsDir = process.env.STORAGE_DIR ? path.resolve(process.env.STORAGE_DIR) : defaultDir;
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.error("Erreur de cr\xE9ation du dossier uploads:", err);
    }
  }
  app.use("/uploads", express.static(uploadsDir));
  app.use("/uploads", (req, res) => {
    const host = req.get("host") || "";
    if (host.includes("liggeybi.com")) {
      return res.status(404).send("<div style='display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;'><h2>Fichier non disponible</h2><br/><p>Le fichier a peut-\xEAtre \xE9t\xE9 supprim\xE9 ou n'est plus accessible.</p></div>");
    }
    res.redirect(`https://www.liggeybi.com/uploads${req.url}`);
  });
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Missing file name or data" });
      }
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 string" });
      }
      const fileBuffer = Buffer.from(matches[2], "base64");
      const uniqueName = Date.now() + "-" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, fileBuffer);
      const fileUrl = `/uploads/${uniqueName}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("[Upload Image Error]:", error);
      res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
    }
  });
  app.post("/api/upload-cv", async (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Missing file name or data" });
      }
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 string" });
      }
      const fileBuffer = Buffer.from(matches[2], "base64");
      const uniqueName = Date.now() + "-" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, fileBuffer);
      const fileUrl = `/uploads/${uniqueName}`;
      res.json({ url: fileUrl });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  };
  app.get("/api/cvtheque", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "RECRUTEUR" && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9. R\xE9serv\xE9 aux recruteurs." });
      }
      const profiles = await prisma_default.profile.findMany({
        where: {
          cvUrl: { not: null },
          NOT: { cvUrl: "" }
        },
        include: {
          user: {
            select: { email: true }
          }
        },
        orderBy: {
          id: "desc"
        }
      });
      res.json(profiles);
    } catch (error) {
      console.error("[CVtheque Error]:", error);
      res.status(500).json({ error: "Impossible de r\xE9cup\xE9rer les CV." });
    }
  });
  app.get("/api/profiles/premium", async (req, res) => {
    try {
      const profiles = await prisma_default.profile.findMany({
        where: {
          isPremium: true,
          cvUrl: { not: null },
          NOT: { cvUrl: "" }
        },
        include: {
          user: { select: { email: true, name: true, image: true } }
        },
        orderBy: {
          id: "desc"
        }
      });
      res.json(profiles);
    } catch (error) {
      console.error("[Profiles Premium Error]:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/config/auth", async (req, res) => {
    try {
      const allConfigs = await prisma_default.siteConfig.findMany({
        where: { key: { in: ["google_auth_enabled", "apple_auth_enabled"] } }
      });
      const configMap = allConfigs.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json({
        googleClientId: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
        googleAuthEnabled: configMap.google_auth_enabled !== "false",
        appleAuthEnabled: configMap.apple_auth_enabled !== "false"
      });
    } catch (e) {
      console.error(e);
      res.json({
        googleClientId: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
        googleAuthEnabled: true,
        appleAuthEnabled: true
      });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    console.log(
      `[Auth] Attempting registration for ${email} with role ${role}`
    );
    try {
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires" });
      }
      let finalRole = role === "RECRUTEUR" ? "RECRUTEUR" : "CANDIDAT";
      if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
        finalRole = "ADMIN";
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma_default.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: finalRole,
          credits: finalRole === "RECRUTEUR" ? 3 : 0,
          profile: {
            create: {
              nom: name.split(" ").slice(1).join(" ") || name,
              prenom: name.split(" ")[0] || ""
            }
          }
        }
      });
      console.log(`[Auth] User created: ${user.id}`);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "365d" }
      );
      res.json({ message: "Utilisateur cr\xE9\xE9 avec succ\xE8s", token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
      console.error(`[Auth] Registration error for ${email}:`, error);
      if (error.code === "P2002")
        return res.status(400).json({ error: "Cet email est d\xE9j\xE0 utilis\xE9" });
      res.status(500).json({ error: `Erreur interne: ${error.message}` });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth] Login attempt for ${email}`);
    try {
      const user = await prisma_default.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        console.warn(`[Auth] Login failed for ${email}: User not found`);
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.warn(`[Auth] Login failed for ${email}: Invalid password`);
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "365d" }
      );
      console.log(`[Auth] Login successful for ${email} (${user.role})`);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });
    } catch (error) {
      console.error(`[Auth] Login error for ${email}:`, error);
      res.status(500).json({ error: `Erreur interne: ${error.message}` });
    }
  });
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = await prisma_default.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
      });
      res.json(user);
    } catch (error) {
      console.error("/api/auth/me Error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email } = req.body;
    console.log(`[Auth] Password reset requested for ${email}`);
    res.json({
      message: "Si l'adresse existe, un email a \xE9t\xE9 envoy\xE9 avec les instructions."
    });
  });
  const { OAuth2Client } = await import("google-auth-library");
  const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
  app.post("/api/auth/apple", async (req, res) => {
    try {
      const { id_token, user: appleUser, role } = req.body;
      if (!id_token) {
        return res.status(400).json({ error: "Token invalide" });
      }
      let email;
      try {
        const appleSigninAuth = await import("apple-signin-auth");
        const payload = await appleSigninAuth.default.verifyIdToken(id_token, {
          // You can optionally pass audience if you want strict validation
          // audience: process.env.VITE_APPLE_CLIENT_ID,
          ignoreExpiration: true
          // For mock testing if token is slightly expired
        });
        email = payload.email;
      } catch (e) {
        console.error("Apple token verify error:", e);
        try {
          const payloadBase64 = id_token.split(".")[1];
          const payloadBuffer = Buffer.from(payloadBase64, "base64");
          const payloadObj = JSON.parse(payloadBuffer.toString("utf-8"));
          email = payloadObj.email;
        } catch (err) {
          return res.status(400).json({ error: "Email introuvable dans le token Apple" });
        }
      }
      if (!email) {
        return res.status(400).json({ error: "Email introuvable dans le token Apple" });
      }
      let name = email.split("@")[0];
      if (appleUser && appleUser.name) {
        name = `${appleUser.name.firstName || ""} ${appleUser.name.lastName || ""}`.trim() || name;
      }
      let user = await prisma_default.user.findUnique({
        where: { email }
      });
      if (!user) {
        user = await prisma_default.user.create({
          data: {
            email,
            name,
            password: "",
            role: role || "CANDIDAT",
            profile: { create: {} }
          }
        });
      }
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "liggeybi-secret",
        { expiresIn: "7d" }
      );
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential, role } = req.body;
      let email, name, family_name, given_name;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email;
          name = payload.name || payload.given_name;
          family_name = payload.family_name;
          given_name = payload.given_name;
        }
      } catch (e) {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${credential}` }
        });
        if (response.ok) {
          const data = await response.json();
          email = data.email;
          name = data.name || data.given_name;
          family_name = data.family_name;
          given_name = data.given_name;
        }
      }
      if (!email)
        return res.status(400).json({ error: "Token invalide" });
      let user = await prisma_default.user.findUnique({
        where: { email }
      });
      if (!user) {
        user = await prisma_default.user.create({
          data: {
            email,
            name,
            role: role === "RECRUTEUR" ? "RECRUTEUR" : "CANDIDAT",
            credits: role === "RECRUTEUR" ? 3 : 0,
            profile: {
              create: {
                nom: family_name || "",
                prenom: given_name || ""
              }
            }
          }
        });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "365d" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });
    } catch (err) {
      console.error("[Google Auth Error]", err);
      res.status(500).json({ error: "Erreur lors de la connexion Google" });
    }
  });
  app.put("/api/profile", authenticate, async (req, res) => {
    try {
      const updated = await prisma_default.profile.update({
        where: { userId: req.user.id },
        data: req.body
      });
      const { nom, prenom } = req.body;
      if (nom || prenom) {
        const newName = [prenom, nom].filter(Boolean).join(" ");
        if (newName) {
          await prisma_default.user.update({
            where: { id: req.user.id },
            data: { name: newName }
          });
        }
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise \xE0 jour du profil" });
    }
  });
  app.get("/api/offres", async (req, res) => {
    try {
      const { status } = req.query;
      const jobs = await prisma_default.offre.findMany({
        where: status ? { statut: String(status) } : { statut: "approuve" },
        orderBy: { createdAt: "desc" }
      });
      res.json(await applyDefaultImageToJobs(jobs));
    } catch (error) {
      console.error("/api/offres Error:", error);
      res.status(500).json({ error: "Erreur lors du chargement des offres" });
    }
  });
  app.get("/api/offres/:id", async (req, res) => {
    try {
      const job = await prisma_default.offre.findFirst({
        where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
        include: { user: { include: { profile: true } } }
      });
      if (!job) return res.status(404).json({ error: "Offre non trouv\xE9e" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  async function applyDefaultImageToJobs(jobs) {
    const isArray = Array.isArray(jobs);
    const jobsArray = isArray ? jobs : [jobs];
    if (jobsArray.length === 0) return jobs;
    const allConfigs = await prisma_default.siteConfig.findMany({
      where: { key: { startsWith: "default_job_image" } }
    });
    const configMap = allConfigs.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {}
    );
    const fallbackJobImage = configMap["default_job_image"] || "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200";
    const oldDefaultUrls = [
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1573165231977-3e057cc8eaa2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1531123414708-f52f3856dc94?auto=format&fit=crop&q=80&w=1200"
    ];
    const processed = jobsArray.map((job) => {
      const category = job.categorie || "offre-demploi";
      const defaultForCategory = configMap[`default_job_image_${category}`];
      const finalDefaultImage = defaultForCategory || fallbackJobImage;
      let currentImageUrl = job.imageUrl;
      if (currentImageUrl && oldDefaultUrls.includes(currentImageUrl)) {
        currentImageUrl = null;
      }
      return {
        ...job,
        imageUrl: currentImageUrl || (!job.logoUrl ? finalDefaultImage : currentImageUrl),
        logoUrl: job.logoUrl
      };
    });
    return isArray ? processed : processed[0];
  }
  ;
  app.get("/api/public/premium-offres", async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const premiumJobs = await prisma_default.offre.findMany({
        where: {
          statut: "approuve",
          isPremium: true,
          OR: [{ premiumUntil: null }, { premiumUntil: { gt: now } }]
        },
        orderBy: { createdAt: "desc" }
      });
      res.json(await applyDefaultImageToJobs(premiumJobs));
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/public/home-offres", async (req, res) => {
    try {
      const categories = [
        "offre-demploi",
        "bourses",
        "concours",
        "formation",
        "stage",
        "emploi-international",
        "candidature-spontanee",
        "appels-doffres",
        "finance-business"
      ];
      const results = await Promise.all(
        categories.map(async (cat) => {
          const jobs = await prisma_default.offre.findMany({
            where: { statut: "approuve", categorie: cat },
            orderBy: { createdAt: "desc" },
            take: 16
          });
          return { categorie: cat, jobs };
        })
      );
      const allJobs = results.flatMap((r) => r.jobs);
      res.json(await applyDefaultImageToJobs(allJobs));
    } catch (error) {
      console.error("[Get Public Home Offres Error]:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/public/offres", async (req, res) => {
    try {
      const { categorie, sousCategorie, limit, q, skip, lieu } = req.query;
      const whereClause = { statut: "approuve" };
      if (categorie) {
        whereClause.categorie = String(categorie);
      }
      if (sousCategorie) {
        whereClause.sousCategorie = String(sousCategorie);
      }
      if (lieu) {
        whereClause.lieu = { equals: String(lieu) };
      }
      if (q) {
        const searchTerm = String(q);
        whereClause.OR = [
          { titre: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { entreprise: { contains: searchTerm } },
          { lieu: { contains: searchTerm } }
        ];
      }
      const takeCount = limit ? parseInt(String(limit)) : 12;
      const skipCount = skip ? parseInt(String(skip)) : 0;
      const [offres, total] = await Promise.all([
        prisma_default.offre.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: takeCount,
          skip: skipCount
        }),
        prisma_default.offre.count({ where: whereClause })
      ]);
      const processedOffres = await applyDefaultImageToJobs(offres);
      res.json({ data: processedOffres, total });
    } catch (error) {
      console.error("[Get Public Offres Error]:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/public/offres/:id", async (req, res) => {
    try {
      const offre = await prisma_default.offre.findFirst({
        where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
        include: { user: { select: { email: true } } }
      });
      if (!offre) return res.status(404).json({ error: "Offre introuvable" });
      res.json(await applyDefaultImageToJobs(offre));
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/buy-cv-package", authenticate, async (req, res) => {
    try {
      const { packageId } = req.body;
      const pkg = await prisma_default.cvPackage.findUnique({
        where: { id: packageId }
      });
      if (!pkg || !pkg.actif)
        return res.status(404).json({ error: "Pack introuvable" });
      const profile = await prisma_default.profile.findUnique({
        where: { userId: req.user.id }
      });
      if (!profile) return res.status(400).json({ error: "Profil non trouv\xE9" });
      if (pkg.prix === 0) {
        const updateData = { packageId: pkg.id };
        if (pkg.type === "DEPOT") {
          updateData.canUploadCv = true;
        } else {
          updateData.isPremium = true;
          updateData.canUploadCv = true;
          const untilDate = /* @__PURE__ */ new Date();
          untilDate.setDate(untilDate.getDate() + pkg.dureeJours);
          updateData.premiumUntil = untilDate;
        }
        await prisma_default.profile.update({
          where: { id: profile.id },
          data: updateData
        });
        return res.json({
          success: true,
          redirectUrl: "/candidat?success=true"
        });
      }
      const masterKey = process.env.PAYDUNYA_MASTER_KEY;
      const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
      const token = process.env.PAYDUNYA_TOKEN;
      const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || req.headers.origin || (req.headers.host ? `${req.headers["x-forwarded-proto"] || req.protocol || "https"}://${req.headers.host}` : "https://www.liggeybi.com");
      if (!masterKey || !privateKey || !token) {
        const orderToken = "mock-token-cv-" + Date.now();
        await prisma_default.cvOrder.create({
          data: {
            profileId: profile.id,
            packageId: pkg.id,
            userId: req.user.id,
            montant: pkg.prix,
            status: "PENDING",
            token: orderToken
          }
        });
        return res.json({
          success: true,
          redirectUrl: appUrl + `/api/candidat/orders/callback?customOrderToken=${orderToken}`
        });
      }
      const internalToken = "cv-ord-" + Date.now() + "-" + Math.floor(Math.random() * 1e3);
      const invoiceData = {
        invoice: {
          total_amount: pkg.prix,
          description: "Promotion de CV: " + pkg.nom
        },
        store: { name: "Liggeybi Premium CV" },
        actions: {
          cancel_url: appUrl + "/candidat",
          return_url: appUrl + "/api/candidat/orders/callback?customOrderToken=" + internalToken,
          callback_url: appUrl + "/api/webhook/paydunya-cv"
        }
      };
      const paydunyaRes = await fetch(
        "https://app.paydunya.com/api/v1/checkout-invoice/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "PAYDUNYA-MASTER-KEY": masterKey,
            "PAYDUNYA-PRIVATE-KEY": privateKey,
            "PAYDUNYA-TOKEN": token
          },
          body: JSON.stringify(invoiceData)
        }
      );
      const responseData = await paydunyaRes.json();
      if (responseData.response_code === "00") {
        await prisma_default.cvOrder.create({
          data: {
            profileId: profile.id,
            packageId: pkg.id,
            userId: req.user.id,
            montant: pkg.prix,
            status: "PENDING",
            token: internalToken
          }
        });
        res.json({ success: true, redirectUrl: responseData.response_text });
      } else {
        res.status(500).json({ error: "Erreur Paydunya: " + responseData.response_text });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/candidat/orders/callback", async (req, res) => {
    try {
      const orderToken = req.query.customOrderToken || req.query.token;
      const realToken = Array.isArray(orderToken) ? orderToken[0] : orderToken;
      if (!realToken) return res.redirect("/candidat?error=param_manquant");
      const order = await prisma_default.cvOrder.findFirst({
        where: { token: realToken }
      });
      if (!order) return res.redirect("/candidat?error=commande_introuvable");
      if (order.status !== "PAID") {
        await prisma_default.cvOrder.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });
        const pkg = await prisma_default.cvPackage.findUnique({
          where: { id: order.packageId }
        });
        if (pkg) {
          const updateData = { packageId: pkg.id };
          if (pkg.type === "DEPOT") {
            updateData.canUploadCv = true;
          } else {
            updateData.isPremium = true;
            updateData.canUploadCv = true;
            const untilDate = /* @__PURE__ */ new Date();
            untilDate.setDate(untilDate.getDate() + pkg.dureeJours);
            updateData.premiumUntil = untilDate;
          }
          await prisma_default.profile.update({
            where: { id: order.profileId },
            data: updateData
          });
        }
      }
      const userObj = await prisma_default.user.findUnique({ where: { id: order.userId } });
      let redirectUrl = "/candidat?success=true";
      if (userObj) {
        const signedToken = jwt.sign({ id: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: "365d" });
        redirectUrl += `&sessionToken=${signedToken}`;
      }
      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      res.redirect("/candidat?error=systeme");
    }
  });
  app.post("/api/buy-credits", authenticate, async (req, res) => {
    try {
      const { packageId } = req.body;
      const pkg = await prisma_default.jobPackage.findUnique({
        where: { id: packageId }
      });
      if (!pkg || !pkg.actif)
        return res.status(404).json({ error: "Pack introuvable" });
      if (pkg.prix === 0) {
        const alreadyGot = await prisma_default.jobOrder.findFirst({
          where: { userId: req.user.id, packageId: pkg.id, status: "PAID" }
        });
        if (alreadyGot) {
          return res.status(400).json({ error: "Vous avez d\xE9j\xE0 r\xE9clam\xE9 ce pack gratuit." });
        }
        await prisma_default.jobOrder.create({
          data: {
            packageId: pkg.id,
            userId: req.user.id,
            montant: 0,
            status: "PAID",
            token: "FREE-" + Date.now()
          }
        });
        await prisma_default.user.update({
          where: { id: req.user.id },
          data: { credits: { increment: pkg.credits } }
        });
        return res.json({
          success: true,
          redirectUrl: "/recruteur?success=true"
        });
      }
      const masterKey = process.env.PAYDUNYA_MASTER_KEY;
      const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
      const token = process.env.PAYDUNYA_TOKEN;
      const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || req.headers.origin || (req.headers.host ? `${req.headers["x-forwarded-proto"] || req.protocol || "https"}://${req.headers.host}` : "https://www.liggeybi.com");
      if (!masterKey || !privateKey || !token) {
        await prisma_default.jobOrder.create({
          data: {
            packageId: pkg.id,
            userId: req.user.id,
            montant: pkg.prix,
            status: "PENDING",
            token: "mock-token-" + Date.now()
          }
        });
        return res.json({
          success: true,
          redirectUrl: appUrl + "/api/recruiter/orders/callback?token=mock-token-" + Date.now()
        });
      }
      const internalToken = "job-ord-" + Date.now() + "-" + Math.floor(Math.random() * 1e3);
      const invoiceData = {
        invoice: {
          total_amount: pkg.prix,
          description: "Achat de cr\xE9dits: " + pkg.nom
        },
        store: { name: "Liggeybi Cr\xE9dits" },
        actions: {
          cancel_url: appUrl + "/recruteur",
          return_url: appUrl + "/api/recruiter/orders/callback?customOrderToken=" + internalToken,
          callback_url: appUrl + "/api/webhook/paydunya-job"
        }
      };
      const response = await fetch(
        "https://app.paydunya.com/api/v1/checkout-invoice/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "PAYDUNYA-MASTER-KEY": masterKey,
            "PAYDUNYA-PRIVATE-KEY": privateKey,
            "PAYDUNYA-TOKEN": token
          },
          body: JSON.stringify(invoiceData)
        }
      );
      const responseData = await response.json();
      if (responseData.response_code === "00") {
        await prisma_default.jobOrder.create({
          data: {
            packageId: pkg.id,
            userId: req.user.id,
            montant: pkg.prix,
            status: "PENDING",
            token: internalToken
          }
        });
        return res.json({
          success: true,
          redirectUrl: responseData.response_text
        });
      } else {
        return res.status(400).json({ error: "Erreur PayDunya" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/my-offres", authenticate, async (req, res) => {
    try {
      const jobs = await prisma_default.offre.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: "desc" }
      });
      res.json(await applyDefaultImageToJobs(jobs));
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/offres", authenticate, async (req, res) => {
    if (req.user.role !== "RECRUTEUR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    }
    try {
      const { visibilite, ...offreData } = req.body;
      const statut = req.user.role === "ADMIN" ? req.body.statut || "approuve" : "en_attente";
      delete offreData.statut;
      let baseSlug = encodeURIComponent(
        (offreData.titre || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      );
      if (!baseSlug) baseSlug = "offre-emploi";
      let slug = baseSlug;
      let counter = 1;
      while (await prisma_default.offre.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      let isPremium = false;
      let isUrgent = false;
      let premiumUntil = null;
      let creditsCost = 0;
      if (req.user.role === "ADMIN") {
        isPremium = offreData.isPremium || false;
        isUrgent = offreData.isUrgent || false;
        if (offreData.premiumUntil)
          premiumUntil = new Date(offreData.premiumUntil);
        delete offreData.premiumUntil;
      } else {
        delete offreData.isUrgent;
        delete offreData.isPremium;
        delete offreData.premiumUntil;
        if (visibilite === "premium") {
          creditsCost = 3;
          isPremium = true;
          premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
        } else if (visibilite === "urgent") {
          creditsCost = 2;
          isUrgent = true;
        } else {
          creditsCost = 0;
        }
        const dbUser = await prisma_default.user.findUnique({
          where: { id: req.user.id }
        });
        if (!dbUser || dbUser.credits < creditsCost) {
          return res.status(400).json({
            error: "Cr\xE9dits insuffisants. Veuillez recharger votre compte."
          });
        }
        if (creditsCost > 0) {
          await prisma_default.user.update({
            where: { id: req.user.id },
            data: { credits: { decrement: creditsCost } }
          });
        }
      }
      const job = await prisma_default.offre.create({
        data: {
          ...offreData,
          slug,
          userId: req.user.id,
          statut,
          isPremium,
          isUrgent,
          premiumUntil
        }
      });
      if (statut === "approuve") {
        notifyGoogleIndexing(job.slug || job.id, "URL_UPDATED").catch(
          console.error
        );
      }
      res.json(job);
    } catch (error) {
      console.error("[Create Offre Error]:", error);
      res.status(500).json({ error: "Erreur lors de la cr\xE9ation de l'offre" });
    }
  });
  app.put("/api/offres/:id", authenticate, async (req, res) => {
    if (req.user.role !== "RECRUTEUR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    }
    try {
      const existingJob = await prisma_default.offre.findUnique({
        where: { id: req.params.id }
      });
      if (!existingJob)
        return res.status(404).json({ error: "Offre introuvable" });
      if (req.user.role !== "ADMIN" && existingJob.userId !== req.user.id) {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      }
      const statut = req.user.role === "ADMIN" ? req.body.statut || existingJob.statut : "en_attente";
      const payload = { ...req.body };
      delete payload.id;
      delete payload.statut;
      delete payload.userId;
      delete payload.createdAt;
      delete payload.updatedAt;
      if (req.user.role !== "ADMIN") {
        delete payload.isPremium;
        delete payload.premiumUntil;
        delete payload.isUrgent;
        delete payload.packageId;
      } else {
        if ("premiumUntil" in payload) {
          if (payload.premiumUntil) {
            payload.premiumUntil = new Date(payload.premiumUntil);
          } else {
            payload.premiumUntil = null;
          }
        }
      }
      const job = await prisma_default.offre.update({
        where: { id: req.params.id },
        data: {
          ...payload,
          statut
        }
      });
      if (statut === "approuve") {
        notifyGoogleIndexing(job.slug || job.id, "URL_UPDATED").catch(
          console.error
        );
      }
      res.json(job);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la mise \xE0 jour de l'offre" });
    }
  });
  app.delete("/api/offres/:id", authenticate, async (req, res) => {
    if (req.user.role !== "RECRUTEUR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    }
    try {
      const existingJob = await prisma_default.offre.findUnique({
        where: { id: req.params.id }
      });
      if (!existingJob)
        return res.status(404).json({ error: "Offre introuvable" });
      if (req.user.role !== "ADMIN" && existingJob.userId !== req.user.id) {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      }
      await prisma_default.offre.delete({ where: { id: req.params.id } });
      if (existingJob.statut === "approuve") {
        notifyGoogleIndexing(
          existingJob.slug || existingJob.id,
          "URL_DELETED"
        ).catch(console.error);
      }
      res.json({ message: "Offre supprim\xE9e avec succ\xE8s" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la suppression de l'offre" });
    }
  });
  app.put("/api/admin/users/:id/premium", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const { isPremium, premiumUntil } = req.body;
      const user = await prisma_default.user.findUnique({ where: { id: req.params.id }, include: { profile: true } });
      if (!user || user.role !== "CANDIDAT" || !user.profile) {
        return res.status(400).json({ error: "Impossible de modifier ce profil" });
      }
      const updatedProfile = await prisma_default.profile.update({
        where: { id: user.profile.id },
        data: {
          isPremium,
          premiumUntil: premiumUntil ? new Date(premiumUntil) : null
        }
      });
      res.json({ success: true, profile: updatedProfile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/admin/users", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const users = await prisma_default.user.findMany({ include: { profile: true } });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/admin/offres", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const offres = await prisma_default.offre.findMany({
        orderBy: { updatedAt: "desc" }
      });
      res.json(await applyDefaultImageToJobs(offres));
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/admin/candidatures", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const list = await prisma_default.candidature.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { include: { profile: true } } }
      });
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/admin/indexing/test", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const { jobId } = req.body;
      const id = jobId || "test-job-id-123";
      const result = await notifyGoogleIndexing(id, "URL_UPDATED");
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post(
    "/api/admin/offres/:id/approve",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const job = await prisma_default.offre.update({
          where: { id: req.params.id },
          data: { statut: "approuve" }
        });
        notifyGoogleIndexing(job.slug || job.id, "URL_UPDATED").catch(
          console.error
        );
        res.json(job);
      } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'approbation" });
      }
    }
  );
  app.post(
    "/api/admin/offres/:id/reject",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const job = await prisma_default.offre.update({
          where: { id: req.params.id },
          data: { statut: "rejete" }
        });
        res.json(job);
      } catch (error) {
        res.status(500).json({ error: "Erreur lors du rejet" });
      }
    }
  );
  app.delete("/api/admin/offres/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const job = await prisma_default.offre.findUnique({
        where: { id: req.params.id }
      });
      await prisma_default.offre.delete({ where: { id: req.params.id } });
      if (job)
        notifyGoogleIndexing(job.slug || job.id, "URL_DELETED").catch(
          console.error
        );
      res.json({ message: "Offre supprim\xE9e" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });
  app.put("/api/admin/users/:id/role", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const { role } = req.body;
    try {
      const user = await prisma_default.user.update({
        where: { id: req.params.id },
        data: { role }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise \xE0 jour du r\xF4le" });
    }
  });
  app.delete("/api/admin/users/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      await prisma_default.user.delete({ where: { id: req.params.id } });
      res.json({ message: "Utilisateur supprim\xE9" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });
  app.post("/api/candidatures", authenticate, async (req, res) => {
    try {
      const {
        articleSlug,
        articleTitre,
        articleCategorie,
        type,
        motivation,
        cvUrl,
        recruteurEmail
      } = req.body;
      const candidature = await prisma_default.candidature.create({
        data: {
          userId: req.user.id,
          articleSlug,
          articleTitre,
          articleCategorie,
          type: type || "interne",
          motivation,
          cvUrl,
          recruteurEmail,
          statut: "en_attente"
        }
      });
      res.json(candidature);
    } catch (error) {
      console.error("Erreur creation candidature:", error);
      res.status(500).json({ error: "Erreur lors de la cr\xE9ation de la candidature" });
    }
  });
  app.get("/api/candidatures/my", authenticate, async (req, res) => {
    const list = await prisma_default.candidature.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  });
  app.get(
    "/api/recruteur/candidatures",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "RECRUTEUR" && req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const jobs = await prisma_default.offre.findMany({
          where: { userId: req.user.id }
        });
        const jobTitres = jobs.map((j) => j.titre);
        const list = await prisma_default.candidature.findMany({
          where: { articleTitre: { in: jobTitres } },
          orderBy: { createdAt: "desc" },
          include: { user: { include: { profile: true } } }
        });
        const mappedList = list.map((c) => ({
          ...c,
          nomComplet: c.user?.profile?.prenom ? `${c.user.profile.prenom} ${c.user.profile.nom || ""}` : c.user?.name || "Anonyme",
          email: c.user?.email,
          telephone: c.user?.profile?.telephone || ""
        }));
        res.json(mappedList);
      } catch (error) {
        res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des candidatures" });
      }
    }
  );
  app.get("/api/config/site", async (req, res) => {
    try {
      const configs = await prisma_default.siteConfig.findMany();
      const configMap = configs.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json(configMap);
    } catch {
      res.json({});
    }
  });
  app.get("/api/ads/global-status", async (req, res) => {
    try {
      const configs = await prisma_default.siteConfig.findMany({
        where: {
          key: {
            in: ["ads_enabled", "ad_block_enabled", "ad_block_max_clicks", "ad_block_timeframe_hours", "ad_block_duration_hours"]
          }
        }
      });
      const configMap = configs.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json({
        enabled: configMap["ads_enabled"] ? configMap["ads_enabled"] === "true" : true,
        adBlockEnabled: configMap["ad_block_enabled"] ? configMap["ad_block_enabled"] === "true" : true,
        adBlockMaxClicks: parseInt(configMap["ad_block_max_clicks"] || "3", 10),
        adBlockTimeframeHours: parseInt(configMap["ad_block_timeframe_hours"] || "24", 10),
        adBlockDurationHours: parseInt(configMap["ad_block_duration_hours"] || "24", 10)
      });
    } catch (error) {
      console.error("[Ads] Error fetching global status:", error);
      res.json({ enabled: true, adBlockEnabled: true, adBlockMaxClicks: 3, adBlockTimeframeHours: 24, adBlockDurationHours: 24 });
    }
  });
  app.post("/api/onesignal/send", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    if (!onesignalClient)
      return res.status(400).json({ error: "OneSignal n'est pas configur\xE9" });
    const { title, message, url } = req.body;
    const notification = {
      contents: { fr: message, en: message },
      headings: { fr: title, en: title },
      included_segments: ["Subscribed Users"],
      url
    };
    try {
      const response = await onesignalClient.createNotification(notification);
      res.json({ success: true, response: response.body });
    } catch (error) {
      res.status(500).json({ error: "Erreur OneSignal" });
    }
  });
  async function sendDigitalProductEmail(orderId) {
    try {
      const order = await prisma_default.order.findUnique({
        where: { id: orderId },
        include: { product: true }
      });
      if (!order || order.status !== "PAID" || order.emailSent || !order.customerEmail)
        return;
      if (order.product.type !== "DIGITAL") return;
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(
          "[Email] SMTP not configured, skipping digital product email."
        );
        return;
      }
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || "https://www.liggeybi.com";
      let downloadUrl = order.product.fileUrl || "";
      if (downloadUrl && !downloadUrl.startsWith("http")) {
        downloadUrl = downloadUrl.startsWith("/") ? `${appUrl}${downloadUrl}` : `${appUrl}/${downloadUrl}`;
      }
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
          <div style="background-color: #006837; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Liggeybi Boutique</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #006837;">Merci pour votre achat !</h2>
            <p>Bonjour <strong>${order.customerName}</strong>,</p>
            <p>Votre paiement pour le produit num\xE9rique suivant a \xE9t\xE9 confirm\xE9 :</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111;">${order.product.titre}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Prix: ${order.totalAmount} FCFA</p>
            </div>
            <p>Vous pouvez acc\xE9der \xE0 votre fichier en cliquant sur le bouton ci-dessous :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="background-color: #F7BE16; color: white; text-decoration: none; padding: 15px 30px; border-radius: 12px; font-weight: 900; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                T\xC9L\xC9CHARGER MAINTENANT
              </a>
            </div>
            <p style="font-size: 13px; color: #6b7280;">
              Lien de t\xE9l\xE9chargement : <br/>
              <a href="${downloadUrl}" style="color: #3b82f6;">${downloadUrl}</a>
            </p>
            <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              \xC0 bient\xF4t sur <a href="https://www.liggeybi.com" style="color: #006837; font-weight: bold; text-decoration: none;">Liggeybi.com</a>
            </p>
          </div>
        </div>
      `;
      await transporter.sendMail({
        from: `"LIGGEYBI Boutique" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Votre commande : ${order.product.titre}`,
        html
      });
      await prisma_default.order.update({
        where: { id: orderId },
        data: { emailSent: true }
      });
      console.log(`[Email] Digital product email sent for order ${orderId}`);
    } catch (error) {
      console.error(
        `[Email Error] Failed to send digital product email for order ${orderId}:`,
        error
      );
    }
  }
  app.post(
    "/api/admin/send-email-alert",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      const { subject, customMessage } = req.body;
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(400).json({
          error: "Configuration SMTP manquante dans les variables d'environnement (.env: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT)"
        });
      }
      try {
        const candidates = await prisma_default.user.findMany({
          where: { role: "CANDIDAT" },
          select: {
            email: true,
            name: true,
            profile: { select: { prenom: true } }
          }
        });
        if (candidates.length === 0) {
          return res.status(400).json({ error: "Aucun candidat trouv\xE9 pour recevoir l'email." });
        }
        const latestJobs = await prisma_default.offre.findMany({
          where: { statut: "approuve" },
          orderBy: { updatedAt: "desc" },
          take: 5
        });
        let jobsHtml = "";
        if (latestJobs.length > 0) {
          jobsHtml = `
          <h2 style="color: #3b82f6;">\u{1F525} Nos derni\xE8res offres d'emploi :</h2>
          <ul style="list-style: none; padding: 0;">
            ${latestJobs.map(
            (job) => `
              <li style="margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0 0 5px 0;">${job.titre}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${job.entreprise || "Entreprise Anonyme"} - ${job.lieu}</p>
                <div style="margin-top: 10px;">
                  <a href="${"https://www.liggeybi.com"}/offres/${job.id}" style="background-color: #2563eb; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold;">Voir l'offre</a>
                </div>
              </li>
            `
          ).join("")}
          </ul>
          <p><a href="${"https://www.liggeybi.com"}/offres">Voir toutes les offres</a></p>
        `;
        }
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        let successCount = 0;
        let failCount = 0;
        for (const candidate of candidates) {
          const candidateName = candidate.profile?.prenom || candidate.name || "Candidat";
          const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <h1>Bonjour ${candidateName},</h1>
            ${customMessage ? `<p style="font-size: 16px; line-height: 1.5;">${customMessage.replace(/\n/g, "<br>")}</p>` : ""}
            ${jobsHtml}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Vous recevez cet email car vous \xEAtes inscrit sur l'espace candidat de Liggeybi.<br>
              Liggeybi \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()}
            </p>
          </div>
        `;
          try {
            await transporter.sendMail({
              from: `"LIGGEYBI" <${process.env.SMTP_USER}>`,
              to: candidate.email,
              subject: subject || "Nouvelles offres d'emploi sur Liggeybi",
              html
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to send email to ${candidate.email}:`, err);
            failCount++;
          }
        }
        res.json({
          success: true,
          message: `Alerte envoy\xE9e \xE0 ${successCount} candidats (${failCount} \xE9checs).`
        });
      } catch (error) {
        console.error("[Email Alert] Error:", error);
        res.status(500).json({ error: "Erreur lors de l'envoi des emails." });
      }
    }
  );
  app.get("/api/admin/config", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const siteConfigs = await prisma_default.siteConfig.findMany();
    res.json({ siteConfigs });
  });
  app.post("/api/admin/config/site", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const { key, value } = req.body;
    const config = await prisma_default.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(config);
  });
  app.post(
    "/api/admin/config/ads-global",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      const { enabled } = req.body;
      const config = await prisma_default.siteConfig.upsert({
        where: { key: "ads_enabled" },
        update: { value: String(enabled) },
        create: { key: "ads_enabled", value: String(enabled) }
      });
      res.json(config);
    }
  );
  app.get("/api/admin/backup-db", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(dbPath)) {
        res.download(
          dbPath,
          `backup_liggeybi_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.db`
        );
      } else {
        res.status(404).json({ error: "Fichier de base de donn\xE9es introuvable" });
      }
    } catch (error) {
      console.error("Backup error:", error);
      res.status(500).json({ error: "Erreur lors de la sauvegarde" });
    }
  });
  app.get("/api/public/product-categories", async (req, res) => {
    try {
      const categories = await prisma_default.productCategory.findMany({
        include: { _count: { select: { products: true } } }
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Erreur" });
    }
  });
  app.get("/api/public/products", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const products = await prisma_default.product.findMany({
        where: {
          isPublished: true,
          ...categoryId ? { categoryId: String(categoryId) } : {}
        },
        include: { category: true },
        orderBy: { createdAt: "desc" }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Erreur" });
    }
  });
  app.get("/api/public/products/:slug", async (req, res) => {
    try {
      const product = await prisma_default.product.findUnique({
        where: { slug: req.params.slug },
        include: { category: true }
      });
      if (!product) return res.status(404).json({ error: "Introuvable" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Erreur" });
    }
  });
  app.post(
    "/api/admin/product-categories",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const { nom } = req.body;
        const slug = nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const cat = await prisma_default.productCategory.create({
          data: { nom, slug, ...req.body }
        });
        res.json(cat);
      } catch (error) {
        res.status(500).json({ error: "Erreur" });
      }
    }
  );
  app.put(
    "/api/admin/product-categories/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const cat = await prisma_default.productCategory.update({
          where: { id: req.params.id },
          data: req.body
        });
        res.json(cat);
      } catch (error) {
        res.status(500).json({ error: "Erreur" });
      }
    }
  );
  app.delete(
    "/api/admin/product-categories/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        await prisma_default.productCategory.delete({ where: { id: req.params.id } });
        res.json({ message: "Supprim\xE9" });
      } catch (error) {
        res.status(500).json({ error: "Erreur" });
      }
    }
  );
  app.get(
    "/api/admin/product-categories",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      const cats = await prisma_default.productCategory.findMany({
        include: { _count: { select: { products: true } } }
      });
      res.json(cats);
    }
  );
  app.get("/api/admin/products", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const products = await prisma_default.product.findMany({
      include: { category: true }
    });
    res.json(products);
  });
  app.post("/api/admin/products", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const {
        titre,
        description,
        prix,
        prixPromo,
        type,
        fileUrl,
        imageUrl,
        stock,
        isPublished,
        categoryId
      } = req.body;
      const slug = titre.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      const product = await prisma_default.product.create({
        data: {
          userId: req.user.id,
          titre,
          slug,
          description,
          prix: Number(prix),
          prixPromo: prixPromo ? Number(prixPromo) : null,
          type,
          fileUrl,
          imageUrl,
          stock: Number(stock),
          isPublished,
          categoryId: categoryId || null
        }
      });
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur cr\xE9ation" });
    }
  });
  app.put("/api/admin/products/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const payload = { ...req.body };
      if (payload.prix) payload.prix = Number(payload.prix);
      if (payload.prixPromo || payload.prixPromo === "")
        payload.prixPromo = payload.prixPromo ? Number(payload.prixPromo) : null;
      if (payload.stock !== void 0) payload.stock = Number(payload.stock);
      if (payload.categoryId === "") payload.categoryId = null;
      const p = await prisma_default.product.update({
        where: { id: req.params.id },
        data: payload
      });
      res.json(p);
    } catch (error) {
      res.status(500).json({ error: "Erreur mise \xE0 jour" });
    }
  });
  app.delete("/api/admin/products/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      await prisma_default.product.delete({ where: { id: req.params.id } });
      res.json({ message: "Supprim\xE9" });
    } catch (error) {
      res.status(500).json({ error: "Erreur suppression" });
    }
  });
  app.post("/api/public/orders", async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        productId,
        quantity
      } = req.body;
      const product = await prisma_default.product.findUnique({
        where: { id: productId }
      });
      if (!product)
        return res.status(404).json({ error: "Produit non trouv\xE9" });
      const totalAmount = (product.prixPromo || product.prix) * (quantity || 1);
      const masterKey = process.env.PAYDUNYA_MASTER_KEY;
      const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
      const token = process.env.PAYDUNYA_TOKEN;
      const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || req.headers.origin || (req.headers.host ? `${req.headers["x-forwarded-proto"] || req.protocol || "https"}://${req.headers.host}` : "https://www.liggeybi.com");
      if (!masterKey || !privateKey || !token) {
        const order = await prisma_default.order.create({
          data: {
            customerName,
            customerEmail,
            customerPhone,
            productId,
            quantity: quantity || 1,
            totalAmount,
            status: "PAID",
            paydunyaToken: "mock-token-" + Date.now()
          }
        });
        sendDigitalProductEmail(order.id).catch(console.error);
        return res.json({
          success: true,
          redirectUrl: appUrl + "/boutique/success?order=" + order.id
        });
      }
      const invoiceData = {
        invoice: {
          total_amount: totalAmount,
          description: "Achat: " + product.titre
        },
        store: { name: "Liggeybi Boutique" },
        actions: {
          cancel_url: appUrl + "/boutique",
          return_url: appUrl + "/api/public/orders/callback",
          callback_url: appUrl + "/api/public/orders/webhook"
        }
      };
      const response = await fetch(
        "https://app.paydunya.com/api/v1/checkout-invoice/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "PAYDUNYA-MASTER-KEY": masterKey,
            "PAYDUNYA-PRIVATE-KEY": privateKey,
            "PAYDUNYA-TOKEN": token
          },
          body: JSON.stringify(invoiceData)
        }
      );
      const responseData = await response.json();
      if (responseData.response_code === "00") {
        const order = await prisma_default.order.create({
          data: {
            customerName,
            customerEmail,
            customerPhone,
            productId,
            quantity: quantity || 1,
            totalAmount,
            status: "PENDING",
            paydunyaToken: responseData.token
          }
        });
        res.json({ success: true, redirectUrl: responseData.response_text });
      } else {
        res.status(400).json({ error: "Erreur PayDunya: " + responseData.response_text });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/public/orders/webhook", async (req, res) => {
    try {
      const data = req.body;
      const token = data?.invoice?.token;
      const status = data?.status === "completed" ? "PAID" : "FAILED";
      if (token) {
        const order = await prisma_default.order.update({
          where: { paydunyaToken: token },
          data: { status, paydunyaReceipt: data?.receipt_url }
        });
        if (status === "PAID") {
          sendDigitalProductEmail(order.id).catch(console.error);
        }
      }
      res.send("OK");
    } catch (err) {
      res.status(500).send("Err");
    }
  });
  app.post("/api/webhook/paydunya-job", async (req, res) => {
    try {
      const data = req.body;
      const token = data?.invoice?.token;
      const status = data?.status === "completed" ? "PAID" : "FAILED";
      if (token) {
        const order = await prisma_default.jobOrder.findFirst({ where: { token } });
        if (order && order.status !== "PAID") {
          await prisma_default.jobOrder.update({
            where: { id: order.id },
            data: { status }
          });
          if (status === "PAID") {
            const pkg = await prisma_default.jobPackage.findUnique({
              where: { id: order.packageId }
            });
            if (pkg && pkg.credits > 0) {
              await prisma_default.user.update({
                where: { id: order.userId },
                data: { credits: { increment: pkg.credits } }
              });
            }
          }
        }
      }
      res.send("OK");
    } catch (err) {
      console.error(err);
      res.status(500).send("Err");
    }
  });
  app.get("/api/public/orders/:id/status", async (req, res) => {
    try {
      const order = await prisma_default.order.findUnique({
        where: { id: req.params.id },
        include: { product: true }
      });
      if (!order)
        return res.status(404).json({ error: "Commande introuvable" });
      const responseData = {
        status: order.status,
        product: {
          titre: order.product.titre,
          type: order.product.type
        }
      };
      if (order.status === "PAID" && order.product.type === "DIGITAL") {
        const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || req.headers.origin || (req.headers.host ? `${req.headers["x-forwarded-proto"] || req.protocol || "https"}://${req.headers.host}` : "https://www.liggeybi.com");
        let downloadUrl = order.product.fileUrl || "";
        if (downloadUrl && !downloadUrl.startsWith("http")) {
          downloadUrl = downloadUrl.startsWith("/") ? `${appUrl}${downloadUrl}` : `${appUrl}/${downloadUrl}`;
        }
        responseData.product.fileUrl = downloadUrl;
      }
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/public/orders/callback", async (req, res) => {
    const token = req.query.token;
    if (!token) return res.redirect("/boutique");
    try {
      const order = await prisma_default.order.findUnique({
        where: { paydunyaToken: String(token) }
      });
      if (order) {
        if (order.status !== "PAID") {
          await prisma_default.order.update({
            where: { paydunyaToken: String(token) },
            data: { status: "PAID" }
          });
          sendDigitalProductEmail(order.id).catch(console.error);
        }
        return res.redirect("/boutique/success?order=" + order.id);
      }
    } catch (err) {
    }
    res.redirect("/boutique");
  });
  app.get("/api/public/job-packages", async (req, res) => {
    const packages = await prisma_default.jobPackage.findMany({
      where: { actif: true },
      orderBy: { prix: "asc" }
    });
    res.json(packages);
  });
  app.get("/api/public/cv-packages", async (req, res) => {
    const packages = await prisma_default.cvPackage.findMany({
      where: { actif: true },
      orderBy: { prix: "asc" }
    });
    res.json(packages);
  });
  app.get("/api/admin/job-packages", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const packages = await prisma_default.jobPackage.findMany({
      orderBy: { prix: "asc" }
    });
    res.json(packages);
  });
  app.get("/api/cv-packages", async (req, res) => {
    try {
      const packages = await prisma_default.cvPackage.findMany({
        where: { actif: true },
        orderBy: { prix: "asc" }
      });
      res.json(packages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/admin/cv-packages", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const packages = await prisma_default.cvPackage.findMany({
      orderBy: { prix: "asc" }
    });
    res.json(packages);
  });
  app.post("/api/admin/job-packages", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const created = await prisma_default.jobPackage.create({ data: req.body });
    res.json(created);
  });
  app.post("/api/admin/cv-packages", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const created = await prisma_default.cvPackage.create({ data: req.body });
    res.json(created);
  });
  app.put(
    "/api/admin/job-packages/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      const updated = await prisma_default.jobPackage.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(updated);
    }
  );
  app.put("/api/admin/cv-packages/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const updated = await prisma_default.cvPackage.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  });
  app.delete(
    "/api/admin/job-packages/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      await prisma_default.jobPackage.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.delete(
    "/api/admin/cv-packages/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      await prisma_default.cvPackage.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.get("/api/recruiter/orders/callback", async (req, res) => {
    const token = req.query.customOrderToken || req.query.token;
    const realToken = Array.isArray(token) ? token[0] : token;
    if (!realToken) return res.redirect("/recruteur");
    try {
      const order = await prisma_default.jobOrder.findFirst({
        where: { token: String(realToken) }
      });
      if (order && order.status !== "PAID") {
        await prisma_default.jobOrder.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });
        const pkg = await prisma_default.jobPackage.findUnique({
          where: { id: order.packageId }
        });
        if (pkg && pkg.credits > 0) {
          await prisma_default.user.update({
            where: { id: order.userId },
            data: { credits: { increment: pkg.credits } }
          });
        }
        const userObj = await prisma_default.user.findUnique({ where: { id: order.userId } });
        let redirectUrl = "/recruteur?success=true";
        if (userObj) {
          const signedToken = jwt.sign({ id: userObj.id, email: userObj.email, role: userObj.role }, JWT_SECRET, { expiresIn: "365d" });
          redirectUrl += `&sessionToken=${signedToken}`;
        }
        return res.redirect(redirectUrl);
      }
    } catch (err) {
      console.error(err);
    }
    res.redirect("/recruteur");
  });
  app.post(
    "/api/candidate/orders/checkout/:packageId",
    authenticate,
    async (req, res) => {
      try {
        const pkg = await prisma_default.cvPackage.findUnique({
          where: { id: req.params.packageId }
        });
        if (!pkg) return res.status(404).json({ error: "Pack introuvable" });
        let profile = await prisma_default.profile.findFirst({
          where: { userId: req.user.id }
        });
        if (!profile) {
          profile = await prisma_default.profile.create({
            data: {
              userId: req.user.id,
              titre: "Mon CV",
              prenom: req.user.email?.split("@")[0] || ""
            }
          });
        }
        const generatedToken = Math.random().toString(36).substring(2, 15);
        if (pkg.prix === 0) {
          await prisma_default.cvOrder.create({
            data: {
              profileId: profile.id,
              packageId: pkg.id,
              userId: req.user.id,
              montant: 0,
              status: "PAID",
              token: generatedToken
            }
          });
          const premiumUntil = /* @__PURE__ */ new Date();
          premiumUntil.setDate(premiumUntil.getDate() + pkg.dureeJours);
          await prisma_default.profile.update({
            where: { id: profile.id },
            data: { isPremium: true, premiumUntil, packageId: pkg.id }
          });
          return res.json({ redirectUrl: "/candidat?success=true" });
        }
        const order = await prisma_default.cvOrder.create({
          data: {
            profileId: profile.id,
            packageId: pkg.id,
            userId: req.user.id,
            montant: pkg.prix,
            token: generatedToken
          }
        });
        const payloadString = `item_name=Pack CV ${pkg.nom}&item_price=${pkg.prix}&command_name=Paiement Pack CV&env=test&ipn_url=https://www.liggeybi.com/api/ipn&custom_field=${generatedToken}`;
        const hashData = __require("crypto").createHash("sha256").update((process.env.PAYTECH_API_SECRET || "") + payloadString).digest("hex");
        const redirectUrl = `https://paytech.sn/payment/checkout/test_url?hash=${hashData}`;
        return res.json({
          redirectUrl: `/api/candidate/orders/callback?token=${generatedToken}`
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la cr\xE9ation de la commande" });
      }
    }
  );
  app.get("/api/candidate/orders/callback", async (req, res) => {
    const token = req.query.token;
    if (!token) return res.redirect("/candidat");
    try {
      const order = await prisma_default.cvOrder.findFirst({
        where: { token: String(token) }
      });
      if (order && order.status !== "PAID") {
        await prisma_default.cvOrder.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });
        const pkg = await prisma_default.cvPackage.findUnique({
          where: { id: order.packageId }
        });
        if (pkg) {
          const updateData = { packageId: pkg.id };
          if (pkg.type === "DEPOT") {
            updateData.canUploadCv = true;
          } else {
            updateData.isPremium = true;
            updateData.canUploadCv = true;
            const premiumUntil = /* @__PURE__ */ new Date();
            premiumUntil.setDate(premiumUntil.getDate() + pkg.dureeJours);
            updateData.premiumUntil = premiumUntil;
          }
          await prisma_default.profile.update({
            where: { id: order.profileId },
            data: updateData
          });
        }
        return res.redirect("/candidat?success=true");
      }
    } catch (err) {
      console.error(err);
    }
    res.redirect("/candidat");
  });
  app.get("/api/admin/orders", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const orders = await prisma_default.order.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  });
  app.get("/api/public/promos", async (req, res) => {
    try {
      const { location } = req.query;
      const banners = await prisma_default.promoBanner.findMany({
        where: {
          actif: true,
          ...location ? { location: String(location) } : {}
        },
        orderBy: { createdAt: "desc" }
      });
      const enrichedBanners = await Promise.all(
        banners.map(async (banner) => {
          if ((banner.type === "PRODUCT" || banner.type === "PRODUCT_GRID") && banner.productIds) {
            const ids = banner.productIds.split(",").filter(Boolean);
            const products = await prisma_default.product.findMany({
              where: { id: { in: ids }, isPublished: true },
              select: {
                id: true,
                titre: true,
                imageUrl: true,
                prix: true,
                prixPromo: true,
                type: true
              }
            });
            return { ...banner, products };
          }
          if ((banner.type === "FORMATION" || banner.type === "FORMATION_GRID") && banner.productIds) {
            const ids = banner.productIds.split(",").filter(Boolean);
            const formations = await prisma_default.formation.findMany({
              where: { id: { in: ids }, isPublished: true },
              select: {
                id: true,
                titre: true,
                imageUrl: true,
                prix: true,
                prixPromo: true,
                slug: true
              }
            });
            return {
              ...banner,
              products: formations.map((f) => ({
                ...f,
                type: "formation"
              }))
            };
          }
          return banner;
        })
      );
      res.json(enrichedBanners);
    } catch (error) {
      console.error("[Get Promos Error]:", error);
      res.status(500).json({ error: "Erreur" });
    }
  });
  app.get("/api/admin/banners", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const banners = await prisma_default.promoBanner.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Erreur" });
    }
  });
  app.post("/api/admin/banners", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const banner = await prisma_default.promoBanner.create({ data: req.body });
    res.json(banner);
  });
  app.put("/api/admin/banners/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    const banner = await prisma_default.promoBanner.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(banner);
  });
  app.delete("/api/admin/banners/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    await prisma_default.promoBanner.delete({ where: { id: req.params.id } });
    res.json({ message: "Supprim\xE9" });
  });
  app.get("/api/admin/ad-configs", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      let configs = await prisma_default.adConfig.findMany();
      if (configs.length === 0) {
        const defaultSlots = [
          {
            id: "ad_" + Math.random().toString(36).substring(2, 9),
            slot: "3384697577",
            nom: "Home Banner",
            actif: true
          },
          {
            id: "ad_" + Math.random().toString(36).substring(2, 9),
            slot: "5682206784",
            nom: "Sidebar Ad",
            actif: true
          },
          {
            id: "ad_" + Math.random().toString(36).substring(2, 9),
            slot: "7733655057",
            nom: "List Inline 1",
            actif: true
          },
          {
            id: "ad_" + Math.random().toString(36).substring(2, 9),
            slot: "8855681955",
            nom: "List Inline 2",
            actif: true
          },
          {
            id: "ad_" + Math.random().toString(36).substring(2, 9),
            slot: "2905716196",
            nom: "Footer Ad",
            actif: true
          }
        ];
        await prisma_default.adConfig.createMany({ data: defaultSlots });
        configs = await prisma_default.adConfig.findMany();
      }
      res.json(configs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.put(
    "/api/admin/ad-configs/:slot",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const { actif } = req.body;
        const config = await prisma_default.adConfig.update({
          where: { slot: req.params.slot },
          data: { actif }
        });
        res.json(config);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  );
  app.get("/api/ads/slots", async (req, res) => {
    try {
      const configs = await prisma_default.adConfig.findMany();
      const map = {};
      configs.forEach((c) => {
        map[c.slot] = c.actif;
      });
      res.json(map);
    } catch (error) {
      res.json({});
    }
  });
  app.get("/api/ads/config", (req, res) => {
    res.json({
      autoAds: true,
      slots: {
        "3384697577": true,
        "5682206784": true,
        "7733655057": true,
        "8855681955": true,
        "2905716196": true
      }
    });
  });
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(
      "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /candidat\nDisallow: /recruteur\nSitemap: https://www.liggeybi.com/sitemap.xml"
    );
  });
  app.get("/sitemap.xml", async (req, res) => {
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    const baseUrlInput = "https://www.liggeybi.com";
    let baseUrl = baseUrlInput.endsWith("/") ? baseUrlInput.slice(0, -1) : baseUrlInput;
    const staticPages = [
      "",
      "/offre-demploi",
      "/bourses",
      "/concours",
      "/formation",
      "/a-propos",
      "/contact"
    ];
    try {
      let localJobs = [];
      try {
        const now = /* @__PURE__ */ new Date();
        localJobs = await prisma_default.offre.findMany({
          where: {
            statut: "approuve",
            OR: [
              { dateExpiration: null },
              { dateExpiration: { gt: now } }
            ]
          },
          select: { id: true, slug: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: "desc" }
        });
      } catch (dbError) {
        console.error(
          "Database error while generating sitemap, continuing with static pages:",
          dbError
        );
      }
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      staticPages.forEach((path2) => {
        xml += `  <url>
    <loc>${baseUrl}${path2}</loc>
    <changefreq>daily</changefreq>
    <priority>${path2 === "" ? "1.0" : "0.8"}</priority>
  </url>
`;
      });
      localJobs.forEach((job) => {
        if (job && (job.id || job.slug) && job.createdAt) {
          const lastMod = job.updatedAt ? job.updatedAt.toISOString() : job.createdAt.toISOString();
          xml += `  <url>
    <loc>${baseUrl}/offre/${job.slug || job.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
`;
        }
      });
      xml += `</urlset>`;
      res.header("Content-Type", "text/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${"https://www.liggeybi.com"}/</loc>
  </url>
</urlset>`;
      res.header("Content-Type", "text/xml");
      res.send(fallbackXml);
    }
  });
  app.get("/feed.xml", async (req, res) => {
    const baseUrl = "https://www.liggeybi.com";
    try {
      const jobs = await prisma_default.offre.findMany({
        where: { statut: "approuve" },
        orderBy: { updatedAt: "desc" },
        take: 50
      });
      let rss = `<?xml version="1.0" encoding="UTF-8" ?>
`;
      rss += `<rss version="2.0">
<channel>
`;
      rss += `  <title>Liggeybi - Derni\xE8res offres d'emploi</title>
`;
      rss += `  <link>${baseUrl}</link>
`;
      rss += `  <description>Les 50 derni\xE8res annonces publi\xE9es sur Liggeybi</description>
`;
      rss += `  <language>fr-fr</language>
`;
      jobs.forEach((job) => {
        const url = `${baseUrl}/offre/${job.slug || job.id}`;
        const descriptionHtml = job.seoDescription || job.description?.replace(/<[^>]*>?/gm, "").substring(0, 200) || "";
        rss += `  <item>
`;
        rss += `    <title><![CDATA[${job.titre} - ${job.entreprise || ""}]]></title>
`;
        rss += `    <link>${url}</link>
`;
        rss += `    <guid>${url}</guid>
`;
        const pubDate = job.updatedAt && !isNaN(new Date(job.updatedAt).getTime()) ? new Date(job.updatedAt).toUTCString() : job.createdAt.toUTCString();
        rss += `    <pubDate>${pubDate}</pubDate>
`;
        rss += `    <description><![CDATA[${descriptionHtml}]]></description>
`;
        rss += `  </item>
`;
      });
      rss += `</channel>
</rss>`;
      res.header("Content-Type", "application/rss+xml");
      res.send(rss);
    } catch (error) {
      res.status(500).send("Error generating feed");
    }
  });
  app.get("/api/formations", async (req, res) => {
    try {
      const formations = await prisma_default.formation.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: { chapitres: true }
      });
      res.json(formations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get("/api/formations/:slug", async (req, res) => {
    try {
      const formation = await prisma_default.formation.findUnique({
        where: { slug: req.params.slug },
        include: {
          chapitres: { orderBy: { ordre: "asc" } },
          quiz: { include: { questions: true } }
        }
      });
      if (!formation)
        return res.status(404).json({ error: "Formation non trouv\xE9e" });
      res.json(formation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/admin/formations", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      let slug = encodeURIComponent(
        (req.body.titre || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      );
      const formation = await prisma_default.formation.create({
        data: {
          ...req.body,
          slug: slug || "formation-" + Date.now()
        }
      });
      res.json(formation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la cr\xE9ation de la formation" });
    }
  });
  app.get("/api/admin/formations", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const formations = await prisma_default.formation.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json(formations);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.put("/api/admin/formations/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const formation = await prisma_default.formation.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(formation);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise \xE0 jour de la formation" });
    }
  });
  app.delete(
    "/api/admin/formations/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        await prisma_default.formation.delete({ where: { id: req.params.id } });
        res.json({ message: "Formation supprim\xE9e" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
      }
    }
  );
  app.post(
    "/api/admin/formations/:id/chapitres",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const chapitre = await prisma_default.chapitre.create({
          data: {
            formationId: req.params.id,
            ...req.body
          }
        });
        res.json(chapitre);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'ajout du chapitre" });
      }
    }
  );
  app.put("/api/admin/chapitres/:id", authenticate, async (req, res) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    try {
      const chapitre = await prisma_default.chapitre.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(chapitre);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise \xE0 jour du chapitre" });
    }
  });
  app.delete(
    "/api/admin/chapitres/:id",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        await prisma_default.chapitre.delete({ where: { id: req.params.id } });
        res.json({ message: "Chapitre supprim\xE9" });
      } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression" });
      }
    }
  );
  app.post(
    "/api/formations/:id/enroll",
    authenticate,
    async (req, res) => {
      try {
        const formationId = req.params.id;
        const userId = req.user.id;
        const formation = await prisma_default.formation.findUnique({
          where: { id: formationId }
        });
        if (!formation)
          return res.status(404).json({ error: "Formation introuvable" });
        const finalPrice = formation.prixPromo !== null ? formation.prixPromo : formation.prix;
        if (finalPrice && finalPrice > 0) {
          const masterKey = process.env.PAYDUNYA_MASTER_KEY;
          const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
          const token = process.env.PAYDUNYA_TOKEN;
          const appUrl = process.env.APP_URL || process.env.VITE_PUBLIC_URL || req.headers.origin || (req.headers.host ? `${req.headers["x-forwarded-proto"] || req.protocol || "https"}://${req.headers.host}` : "https://www.liggeybi.com");
          if (!masterKey || !privateKey || !token) {
            const mockToken = "mock-token-" + Date.now();
            await prisma_default.userFormation.upsert({
              where: { userId_formationId: { userId, formationId } },
              update: { status: "EN_COURS", paydunyaToken: mockToken },
              create: {
                userId,
                formationId,
                progression: 0,
                status: "EN_COURS",
                paydunyaToken: mockToken
              }
            });
            return res.json({
              redirectUrl: `/api/formations/orders/callback?token=${mockToken}`
            });
          }
          const invoiceData = {
            invoice: {
              total_amount: finalPrice,
              description: "Achat de formation: " + formation.titre
            },
            store: { name: "Liggeybi Formations" },
            actions: {
              cancel_url: appUrl + "/formations/" + formation.slug,
              return_url: appUrl + "/api/formations/orders/callback",
              callback_url: appUrl + "/api/formations/orders/webhook"
            }
          };
          const response = await fetch(
            "https://app.paydunya.com/api/v1/checkout-invoice/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "PAYDUNYA-MASTER-KEY": masterKey,
                "PAYDUNYA-PRIVATE-KEY": privateKey,
                "PAYDUNYA-TOKEN": token
              },
              body: JSON.stringify(invoiceData)
            }
          );
          const responseData = await response.json();
          if (response.ok && responseData.response_code === "00") {
            await prisma_default.userFormation.upsert({
              where: { userId_formationId: { userId, formationId } },
              update: {
                status: "PENDING_PAYMENT",
                paydunyaToken: responseData.token
              },
              create: {
                userId,
                formationId,
                progression: 0,
                status: "PENDING_PAYMENT",
                paydunyaToken: responseData.token
              }
            });
            return res.json({ redirectUrl: responseData.response_text });
          } else {
            return res.status(400).json({
              error: "Erreur PayDunya: " + responseData.response_text
            });
          }
        }
        const enrollment = await prisma_default.userFormation.upsert({
          where: { userId_formationId: { userId, formationId } },
          update: {},
          create: { userId, formationId, progression: 0, status: "EN_COURS" }
        });
        res.json(enrollment);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  );
  app.get("/api/formations/orders/callback", async (req, res) => {
    const token = req.query.token;
    if (!token) return res.redirect("/formations");
    try {
      const enrollment = await prisma_default.userFormation.findUnique({
        where: { paydunyaToken: String(token) },
        include: { formation: true }
      });
      if (enrollment) {
        if (enrollment.status !== "EN_COURS" && enrollment.status !== "TERMINE") {
          await prisma_default.userFormation.update({
            where: { id: enrollment.id },
            data: { status: "EN_COURS" }
          });
        }
        return res.redirect(
          "/formations/" + enrollment.formation.slug + "/learn"
        );
      }
    } catch (e) {
      console.error(e);
    }
    res.redirect("/formations");
  });
  app.post("/api/formations/orders/webhook", async (req, res) => {
    try {
      const data = req.body;
      const token = data?.invoice?.token;
      const status = data?.status === "completed" ? "EN_COURS" : "PENDING_PAYMENT";
      if (token && status === "EN_COURS") {
        await prisma_default.userFormation.update({
          where: { paydunyaToken: token },
          data: { status }
        });
      }
      res.send("OK");
    } catch (err) {
      console.error(err);
      res.status(500).send("Err");
    }
  });
  app.get("/api/my-formations", authenticate, async (req, res) => {
    try {
      const enrollments = await prisma_default.userFormation.findMany({
        where: { userId: req.user.id },
        include: { formation: { include: { chapitres: true } } }
      });
      res.json(enrollments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post("/api/formations/progress", authenticate, async (req, res) => {
    try {
      const { chapitreId } = req.body;
      const userId = req.user.id;
      const chapitre = await prisma_default.chapitre.findUnique({
        where: { id: chapitreId }
      });
      if (!chapitre)
        return res.status(404).json({ error: "Chapitre non trouv\xE9" });
      await prisma_default.chapterProgress.upsert({
        where: { userId_chapitreId: { userId, chapitreId } },
        update: { isCompleted: true },
        create: { userId, chapitreId, isCompleted: true }
      });
      const allChapitres = await prisma_default.chapitre.count({
        where: { formationId: chapitre.formationId }
      });
      const completedChapitres = await prisma_default.chapterProgress.count({
        where: {
          userId,
          chapitre: { formationId: chapitre.formationId },
          isCompleted: true
        }
      });
      const percentage = Math.round(
        completedChapitres / Math.max(1, allChapitres) * 100
      );
      const isCompleted = percentage >= 100;
      await prisma_default.userFormation.update({
        where: {
          userId_formationId: { userId, formationId: chapitre.formationId }
        },
        data: {
          progression: percentage,
          status: isCompleted ? "TERMINE" : "EN_COURS"
        }
      });
      res.json({ success: true, progression: percentage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.get(
    "/api/formations/progress/:formationId",
    authenticate,
    async (req, res) => {
      try {
        const progress = await prisma_default.chapterProgress.findMany({
          where: {
            userId: req.user.id,
            chapitre: { formationId: req.params.formationId }
          }
        });
        const enrollment = await prisma_default.userFormation.findUnique({
          where: {
            userId_formationId: {
              userId: req.user.id,
              formationId: req.params.formationId
            }
          }
        });
        res.json({ progress, enrollment });
      } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  );
  app.get("/api/formations/:id/leaderboard", async (req, res) => {
    try {
      const inscriptions = await prisma_default.userFormation.findMany({
        where: { formationId: req.params.id, status: "TERMINE" },
        orderBy: { score: "desc" },
        take: 10,
        include: { user: { include: { profile: true } } }
      });
      const mapped = inscriptions.map((i) => ({
        nom: i.user?.profile?.prenom ? `${i.user.profile.prenom} ${i.user.profile.nom || ""}` : i.user?.name || "Anonyme",
        score: i.score
      }));
      res.json(mapped);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app.post(
    "/api/admin/formations/:id/quiz",
    authenticate,
    async (req, res) => {
      if (req.user.role !== "ADMIN")
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      try {
        const { titre, description, questions } = req.body;
        let quiz = await prisma_default.formationQuiz.findUnique({
          where: { formationId: req.params.id }
        });
        if (quiz) {
          await prisma_default.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
          quiz = await prisma_default.formationQuiz.update({
            where: { id: quiz.id },
            data: { titre, description }
          });
        } else {
          quiz = await prisma_default.formationQuiz.create({
            data: { formationId: req.params.id, titre, description }
          });
        }
        if (questions && questions.length > 0) {
          await Promise.all(
            questions.map(
              (q) => prisma_default.quizQuestion.create({
                data: {
                  quizId: quiz.id,
                  question: q.question,
                  options: JSON.stringify(q.options),
                  correctOptionIndex: q.correctOptionIndex
                }
              })
            )
          );
        }
        res.json(quiz);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur" });
      }
    }
  );
  app.post(
    "/api/formations/:id/certify",
    authenticate,
    async (req, res) => {
      try {
        const user = await prisma_default.user.findUnique({
          where: { id: req.user.id }
        });
        const formation = await prisma_default.formation.findUnique({
          where: { id: req.params.id }
        });
        const score = req.body.score || 0;
        if (!user || !formation)
          return res.status(404).json({ error: "Utilisateur ou formation introuvable" });
        const certUrl = `/certificats/${req.user.id}-${req.params.id}.pdf`;
        const uf = await prisma_default.userFormation.update({
          where: {
            userId_formationId: {
              userId: req.user.id,
              formationId: req.params.id
            }
          },
          data: {
            certificatUrl: certUrl,
            status: "TERMINE",
            progression: 100,
            score
          }
        });
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT) || 587,
              secure: process.env.SMTP_PORT === "465",
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            });
            await transporter.sendMail({
              from: `"Liggeybi Education" <${process.env.SMTP_USER}>`,
              to: user.email,
              subject: `\u{1F389} Certificat de r\xE9ussite : ${formation.titre}`,
              html: `
               <h2>F\xE9licitations !</h2>
               <p>Vous avez pass\xE9 avec succ\xE8s l'\xE9valuation de la formation <strong>${formation.titre}</strong>.</p>
               <p>Vous pouvez consulter votre r\xE9sultat depuis votre espace personnel : <a href="${process.env.VITE_PUBLIC_URL || "http://localhost:3000"}/candidat">Mon Espace Candiadat</a>.</p>
               <br/>
               <p>L'\xE9quipe Liggeybi</p>
             `
            });
          } catch (emailErr) {
            console.error("Erreur envoi email certificat:", emailErr);
          }
        }
        res.json(uf);
      } catch (e) {
        console.error("Certify error:", e);
        res.status(500).json({ error: "Erreur" });
      }
    }
  );
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  app.get("*", async (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|pinterest|telegrambot|slackbot/i.test(
      userAgent
    );
    const isGoogleBot = /googlebot/i.test(userAgent);
    const offreMatch = req.path.match(/^\/offre\/([^\/]+)/);
    const articleMatch = !offreMatch && req.path.match(/^\/(?:article\/)?([^\/]+)$/);
    const isStaticRoute = [
      "/offre-demploi",
      "/bourses",
      "/concours",
      "/formation",
      "/a-propos",
      "/contact",
      "/mentions-legales",
      "/recherche",
      "/connexion",
      "/inscription",
      "/admin",
      "/recruteur",
      "/candidat"
    ].includes(req.path);
    if (offreMatch && !req.path.includes(".")) {
      const jobId = String(req.query.id || offreMatch[1]);
      try {
        const job = await prisma_default.offre.findFirst({
          where: { OR: [{ id: jobId }, { slug: jobId }] }
        });
        if (job) {
          const desc = job.description ? job.description.replace(/<[^>]*>/g, "").substring(0, 200).replace(/\n/g, " ") : "Trouvez les meilleures offres sur Liggeybi.";
          const rawImg = job.imageUrl || job.logoUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200";
          const img = rawImg.startsWith("http") ? rawImg : "https://www.liggeybi.com" + (rawImg.startsWith("/") ? rawImg : "/" + rawImg);
          const title = job.titre + " | Liggeybi";
          const url = "https://www.liggeybi.com" + req.originalUrl;
          const encodedImg = encodeURI(img);
          const numericSalary = job.salaire && typeof job.salaire === "string" ? parseFloat(job.salaire.replace(/[^0-9.]/g, "")) : null;
          const htmlDescription = job.description ? job.description.includes("<") ? job.description : `<p>${job.description.replace(/\n/g, "<br/>")}</p>` : `<p>${desc}</p>`;
          const countryCode = "SN";
          const jobPostingSchema = {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job.titre || "Offre d'emploi",
            image: encodedImg,
            description: htmlDescription,
            // Google requires full HTML description
            identifier: {
              "@type": "PropertyValue",
              name: job.entreprise || "Liggeybi",
              value: String(job.id)
            },
            datePosted: job.createdAt.toISOString(),
            validThrough: job.dateExpiration && !isNaN(new Date(job.dateExpiration).getTime()) ? new Date(job.dateExpiration).toISOString() : new Date(
              new Date(job.createdAt).getTime() + 90 * 24 * 60 * 60 * 1e3
            ).toISOString(),
            employmentType: job.typeContrat === "CDI" ? "FULL_TIME" : job.typeContrat === "CDD" ? "CONTRACTOR" : job.typeContrat === "Freelance" ? "CONTRACTOR" : job.typeContrat === "Stage" ? "INTERN" : job.typeContrat === "Temps partiel" ? "PART_TIME" : "OTHER",
            industry: job.categorie || "General",
            ...job.lienExterne || job.emailContact ? {
              directApply: true
            } : {},
            hiringOrganization: {
              "@type": "Organization",
              name: job.entreprise || "Liggeybi",
              sameAs: "https://www.liggeybi.com",
              logo: job.imageUrl ? job.imageUrl.startsWith("http") ? job.imageUrl : `https://www.liggeybi.com${job.imageUrl}` : job.logoUrl ? job.logoUrl.startsWith("http") ? job.logoUrl : `https://www.liggeybi.com${job.logoUrl}` : "https://www.liggeybi.com/logo.png"
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.lieu || "S\xE9n\xE9gal",
                addressRegion: job.lieu || "Dakar",
                addressCountry: countryCode
              }
            },
            ...numericSalary && numericSalary > 0 ? {
              baseSalary: {
                "@type": "MonetaryAmount",
                currency: "XOF",
                value: {
                  "@type": "QuantitativeValue",
                  value: numericSalary,
                  unitText: "MONTH"
                }
              }
            } : {},
            ...job.modeTravail === "\xC0 distance" ? {
              jobLocationType: "TELECOMMUTE",
              applicantLocationRequirements: {
                "@type": "Country",
                name: "SN"
              }
            } : {}
          };
          const seoHtml = `
                  <title>\${title}</title>
                  <meta name="description" content="\${desc}" />
                  <meta property="og:title" content="\${title}" />
                  <meta property="og:description" content="\${desc}" />
                  <meta property="og:image" content="\${encodedImg}" />
                  <meta property="og:image:secure_url" content="\${encodedImg}" />
                  <meta property="og:image:width" content="1200" />
                  <meta property="og:image:height" content="630" />
                  <meta property="og:url" content="\${url}" />
                  <meta property="og:type" content="article" />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="\${title}" />
                  <meta name="twitter:description" content="\${desc}" />
                  <meta name="twitter:image" content="\${encodedImg}" />
                  <script id="google-jobs-schema" type="application/ld+json">
                    \${JSON.stringify(jobPostingSchema).replace(/</g, "\\u003c")}
                  </script>
                `;
          const isProd2 = process.env.NODE_ENV === "production" || process.env.VITE_PROD === "true";
          let templateContent = "";
          if (isProd2) {
            const distPath = path.resolve(__dirname, "vite");
            templateContent = fs.readFileSync(
              path.resolve(distPath, "index.html"),
              "utf-8"
            );
          } else {
            templateContent = fs.readFileSync(
              path.resolve(__dirname, "index.html"),
              "utf-8"
            );
          }
          templateContent = templateContent.replace(
            /<meta (property|name)="og:[^>]+>/g,
            ""
          );
          templateContent = templateContent.replace(
            /<meta (property|name)="twitter:[^>]+>/g,
            ""
          );
          templateContent = templateContent.replace(
            /<meta name="description"[^>]+>/g,
            ""
          );
          templateContent = templateContent.replace(
            /<title>[^<]*<\/title>/g,
            ""
          );
          templateContent = templateContent.replace(
            "</head>",
            () => seoHtml + "\n</head>"
          );
          return res.send(templateContent);
        }
      } catch (e) {
        console.error("Bot JobPosting injection error", e);
      }
    }
    if (isBot && articleMatch && !isStaticRoute && !req.path.startsWith("/api") && !req.path.includes(".")) {
    }
    next();
  });
  const isProd = process.env.NODE_ENV === "production" || process.env.VITE_PROD === "true";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "vite");
    app.use(express.static(distPath));
    app.get(
      "*",
      (req, res) => res.sendFile(path.resolve(distPath, "index.html"))
    );
  }
  const port = 3e3;
  const generateStaticFiles = async () => {
    try {
      const fs2 = await import("fs/promises");
      const staticPages = [
        "",
        "/offre-demploi",
        "/bourses",
        "/concours",
        "/formation",
        "/a-propos",
        "/contact"
      ];
      let localJobs = [];
      try {
        localJobs = await prisma_default.offre.findMany({
          where: { statut: "approuve" },
          select: { id: true, slug: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: "desc" }
        });
      } catch (e) {
        console.error("Database error while generating static sitemap:", e);
      }
      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      staticPages.forEach((p) => {
        sitemapXml += `  <url>
    <loc>https://www.liggeybi.com${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
  </url>
`;
      });
      localJobs.forEach((job) => {
        if (job && (job.id || job.slug) && job.createdAt) {
          const lastMod = job.updatedAt ? job.updatedAt.toISOString() : job.createdAt.toISOString();
          sitemapXml += `  <url>
    <loc>https://www.liggeybi.com/offre/${job.slug || job.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
`;
        }
      });
      sitemapXml += `</urlset>`;
      const robotsTxt = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /candidat\nDisallow: /recruteur\nSitemap: https://www.liggeybi.com/sitemap.xml";
      const dirsToTry = [
        process.cwd(),
        path.resolve(process.cwd(), "dist"),
        path.resolve(process.cwd(), "vite"),
        path.resolve(process.cwd(), "public")
      ];
      for (const d of dirsToTry) {
        try {
          await fs2.mkdir(d, { recursive: true });
          await fs2.writeFile(path.join(d, "sitemap.xml"), sitemapXml);
          await fs2.writeFile(path.join(d, "robots.txt"), robotsTxt);
        } catch (err) {
        }
      }
      console.log("Sitemap dynamically generated and saved to disk.");
    } catch (err) {
      console.error("Failed to generate static files to disk:", err);
    }
  };
  generateStaticFiles();
  setInterval(generateStaticFiles, 36e5);
  if (typeof port === "string" && isNaN(Number(port))) {
    app.listen(port, () => {
      console.log(`Server running on socket ${port}`);
    });
  } else {
    app.listen(Number(port), "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${port}`);
    });
  }
}
startServer();
