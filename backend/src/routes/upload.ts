import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import db from "../utils/db";

const router = Router();

// ── Storage setup ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const folder = (_req as any).body?.folder || "general";
    const dir = path.join(UPLOADS_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const ALLOWED_MIME = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "video/mp4", "video/webm", "video/quicktime",
  "application/pdf",
];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type ${file.mimetype} not allowed`));
  },
});

// ── Helper: derive public URL ─────────────────────────────────────────────────
function fileUrl(req: Request, folder: string, filename: string): string {
  const base = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${folder}/${filename}`;
}

// ── POST /api/upload ──────────────────────────────────────────────────────────
router.post(
  "/",
  authenticateJWT,
  upload.single("file"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });

      const folder = req.body?.folder || "general";
      const url = fileUrl(req, folder, req.file.filename);
      const publicId = `${folder}/${req.file.filename}`;

      // Persist to UploadedFile table
      const record = await db.uploadedFile.create({
        data: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          url,
          publicId,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          folder,
          uploadedById: req.user?.id ?? null,
        },
      });

      return res.json({
        id: record.id,
        url,
        publicId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        folder,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: error.message || "Upload failed" });
    }
  }
);

// ── DELETE /api/upload/:publicId ──────────────────────────────────────────────
router.delete("/:publicId(*)", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const publicId = req.params.publicId;
    const record = await db.uploadedFile.findUnique({ where: { publicId } });
    if (!record) return res.status(404).json({ error: "File not found" });

    // Delete from disk
    const filePath = path.join(UPLOADS_DIR, record.folder, record.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete from DB
    await db.uploadedFile.delete({ where: { publicId } });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete upload error:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
});

// ── GET /api/upload/list?folder= ──────────────────────────────────────────────
router.get("/list", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const folder = req.query.folder as string | undefined;
    const files = await db.uploadedFile.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return res.json(files);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
