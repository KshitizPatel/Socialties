import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { MediaType } from "@prisma/client";

const router = Router();

// ─── Authenticated: List all media (with optional folder filter) ───────────────
router.get("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { folderId, type, search } = req.query;
    const where: any = { deletedAt: null };
    if (folderId) where.folderId = folderId as string;
    if (type) where.type = type as MediaType;
    if (search) where.OR = [
      { title: { contains: search as string, mode: "insensitive" } },
      { altText: { contains: search as string, mode: "insensitive" } },
    ];

    const media = await db.mediaLibrary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { folder: { select: { id: true, name: true } } },
    });
    return res.json(media);
  } catch (error: any) {
    console.error("Get media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Add media entry ───────────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { url, cloudinaryPublicId, type, sizeBytes, folderId, tags, title, altText } = req.body;
    if (!url || !cloudinaryPublicId || !type) {
      return res.status(400).json({ error: "url, cloudinaryPublicId, and type are required" });
    }
    const media = await db.mediaLibrary.create({
      data: {
        url,
        cloudinaryPublicId,
        type: type as MediaType,
        sizeBytes: sizeBytes ? Number(sizeBytes) : null,
        uploadedById: req.user!.id,
        folderId: folderId || null,
        tags: Array.isArray(tags) ? tags : [],
        title: title || null,
        altText: altText || null,
      },
    });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "ADD_MEDIA", entityType: "MEDIA_LIBRARY", entityId: media.id },
    }).catch(() => {});
    return res.json(media);
  } catch (error: any) {
    console.error("Add media error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Authenticated: Update media metadata ─────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { title, altText, tags, folderId } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title || null;
    if (altText !== undefined) data.altText = altText || null;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (folderId !== undefined) data.folderId = folderId || null;

    const media = await db.mediaLibrary.update({ where: { id }, data });
    return res.json(media);
  } catch (error: any) {
    console.error("Update media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Soft delete media ─────────────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await db.mediaLibrary.update({ where: { id }, data: { deletedAt: new Date() } });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "DELETE_MEDIA", entityType: "MEDIA_LIBRARY", entityId: id },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: List folders ──────────────────────────────────────────────
router.get("/folders", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const folders = await db.mediaFolder.findMany({ orderBy: { name: "asc" } });
    return res.json(folders);
  } catch (error: any) {
    console.error("Get folders error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create folder ─────────────────────────────────────────────
router.post("/folders", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const folder = await db.mediaFolder.create({ data: { name } });
    return res.json(folder);
  } catch (error: any) {
    console.error("Create folder error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Authenticated: Delete folder ─────────────────────────────────────────────
router.delete("/folders/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Unassign media from this folder first
    await db.mediaLibrary.updateMany({ where: { folderId: id }, data: { folderId: null } });
    await db.mediaFolder.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete folder error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
