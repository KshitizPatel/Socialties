import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Public: Get all active services ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(services);
  } catch (error: any) {
    console.error("Get services error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Get all services (including inactive) ─────────────────────
router.get("/all", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
    return res.json(services);
  } catch (error: any) {
    console.error("Get all services error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create service ────────────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { slug, title, description, icon, imageUrl, sortOrder, isActive } = req.body;
    if (!slug || !title || !description) {
      return res.status(400).json({ error: "slug, title, and description are required" });
    }
    const service = await db.service.create({
      data: {
        slug,
        title,
        description,
        icon: icon || "Star",
        imageUrl: imageUrl || null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "CREATE_SERVICE", entityType: "SERVICE", entityId: service.id },
    }).catch(() => {});
    return res.json(service);
  } catch (error: any) {
    console.error("Create service error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Authenticated: Update service ────────────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { slug, title, description, icon, imageUrl, sortOrder, isActive } = req.body;
    const data: any = {};
    if (slug !== undefined) data.slug = slug;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const service = await db.service.update({ where: { id }, data });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "UPDATE_SERVICE", entityType: "SERVICE", entityId: id },
    }).catch(() => {});
    return res.json(service);
  } catch (error: any) {
    console.error("Update service error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Delete service ────────────────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await db.service.delete({ where: { id } });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "DELETE_SERVICE", entityType: "SERVICE", entityId: id },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete service error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
