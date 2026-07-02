import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { TestimonialType, TestimonialAudience } from "@prisma/client";

const router = Router();

// ─── Public: Get published testimonials ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(testimonials);
  } catch (error: any) {
    console.error("Get testimonials error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Get all testimonials (including unpublished) ───────────────
router.get("/all", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(testimonials);
  } catch (error: any) {
    console.error("Get all testimonials error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create testimonial ───────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      authorName, authorRole, companyName, content, videoUrl,
      rating, type, audience, campaignId, isPublished, sortOrder,
    } = req.body;

    if (!authorName || !audience) {
      return res.status(400).json({ error: "authorName and audience are required" });
    }

    const testimonial = await db.testimonial.create({
      data: {
        authorName,
        authorRole: authorRole || null,
        companyName: companyName || null,
        content: content || null,
        videoUrl: videoUrl || null,
        rating: rating ? Number(rating) : null,
        type: (type as TestimonialType) || "TEXT",
        audience: audience as TestimonialAudience,
        campaignId: campaignId || null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      },
    });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "CREATE_TESTIMONIAL", entityType: "TESTIMONIAL", entityId: testimonial.id },
    }).catch(() => {});

    return res.json(testimonial);
  } catch (error: any) {
    console.error("Create testimonial error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Update testimonial ───────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      authorName, authorRole, companyName, content, videoUrl,
      rating, type, audience, campaignId, isPublished, sortOrder,
    } = req.body;

    const data: any = {};
    if (authorName !== undefined) data.authorName = authorName;
    if (authorRole !== undefined) data.authorRole = authorRole || null;
    if (companyName !== undefined) data.companyName = companyName || null;
    if (content !== undefined) data.content = content || null;
    if (videoUrl !== undefined) data.videoUrl = videoUrl || null;
    if (rating !== undefined) data.rating = rating ? Number(rating) : null;
    if (type !== undefined) data.type = type as TestimonialType;
    if (audience !== undefined) data.audience = audience as TestimonialAudience;
    if (campaignId !== undefined) data.campaignId = campaignId || null;
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    const testimonial = await db.testimonial.update({ where: { id }, data });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "UPDATE_TESTIMONIAL", entityType: "TESTIMONIAL", entityId: id },
    }).catch(() => {});

    return res.json(testimonial);
  } catch (error: any) {
    console.error("Update testimonial error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Soft delete testimonial ──────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await db.testimonial.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "DELETE_TESTIMONIAL", entityType: "TESTIMONIAL", entityId: id },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete testimonial error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
