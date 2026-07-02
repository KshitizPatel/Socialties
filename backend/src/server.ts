import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import campaignsRouter from "./routes/campaigns";
import teamRouter from "./routes/team";
import brandLeadsRouter from "./routes/brandLeads";
import creatorAppsRouter from "./routes/creatorApps";
import messagesRouter from "./routes/messages";
import settingsRouter from "./routes/settings";
import publicRouter from "./routes/public";
import testimonialsRouter from "./routes/testimonials";
import servicesRouter from "./routes/services";
import mediaRouter from "./routes/media";
import faqRouter from "./routes/faq";
import whyCardsRouter from "./routes/why-cards";
import ctaSectionsRouter from "./routes/cta-sections";
import uploadRouter from "./routes/upload";
import { initializeSettings } from "./utils/initDb";

dotenv.config();

const app = express();
// Render injects PORT; fallback to BACKEND_PORT for local dev
const port = process.env.PORT || process.env.BACKEND_PORT || 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

// Serve uploaded files statically
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rate limiting for auth route (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per window per IP
  message: { error: "Too many login attempts. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute per IP (generous for admin panel)
  standardHeaders: true,
  legacyHeaders: false,
});

// Public health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Apply general rate limit to all API routes
app.use("/api", apiLimiter);

// Setup API routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/team", teamRouter);
app.use("/api/brand-leads", brandLeadsRouter);
app.use("/api/creator-applications", creatorAppsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/public", publicRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/faq", faqRouter);
app.use("/api/why-cards", whyCardsRouter);
app.use("/api/cta-sections", ctaSectionsRouter);
app.use("/api/upload", uploadRouter);

// Initialize DB configurations first, then listen
initializeSettings()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server successfully listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database on startup:", err);
    app.listen(port, () => {
      console.log(
        `Backend server successfully listening on port ${port} (with DB init failure fallback)`
      );
    });
  });
