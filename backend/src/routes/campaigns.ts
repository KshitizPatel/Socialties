import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import { CampaignType, CampaignStatus } from "@prisma/client";

const router = Router();

/** Serialize BigInt reachTotal to string for JSON transport */
function serializeCampaign(c: any) {
  return { ...c, reachTotal: c.reachTotal != null ? c.reachTotal.toString() : null };
}

// ─── Public: List all non-deleted campaigns ───────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const campaigns = await db.campaign.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return res.json(campaigns.map(serializeCampaign));
  } catch (error: any) {
    console.error("Get campaigns error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Public: Campaign by slug (with media) ────────────────────────────────────
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const campaign = await db.campaign.findFirst({
      where: { slug: req.params.slug, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        testimonials: { where: { isPublished: true } },
      },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(serializeCampaign(campaign));
  } catch (error: any) {
    console.error("Get campaign by slug error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Get single campaign by ID ─────────────────────────────────
router.get("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const campaign = await db.campaign.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { images: true, videos: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(serializeCampaign(campaign));
  } catch (error: any) {
    console.error("Get campaign by id error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create campaign ──────────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      brandName, slug, type, platforms, reachTotal, budgetTier,
      coverImageUrl, brief, strategy, resultsNote, metrics,
      title, client, budget, duration, results, roi, category, tags,
      ctaText, ctaLink, publishDate, featured, status, startDate, endDate,
    } = req.body;

    if (!brandName || !slug || !type || !platforms) {
      return res.status(400).json({ error: "Missing required fields: brandName, slug, type, platforms" });
    }

    const existing = await db.campaign.findUnique({ where: { slug } });
    if (existing) return res.status(409).json({ error: "A campaign with this slug already exists" });

    const campaign = await db.campaign.create({
      data: {
        brandName,
        slug,
        type: type as CampaignType,
        platforms: Array.isArray(platforms) ? platforms : [platforms],
        reachTotal: reachTotal ? BigInt(reachTotal) : null,
        budgetTier: budgetTier || null,
        coverImageUrl: coverImageUrl || null,
        brief: brief || null,
        strategy: strategy || null,
        resultsNote: resultsNote || null,
        metrics: metrics ?? undefined,
        status: (status as CampaignStatus) || "DRAFT",
        featured: featured ?? false,
        title: title || null,
        client: client || null,
        budget: budget ? Number(budget) : null,
        duration: duration || null,
        results: results || null,
        roi: roi || null,
        category: category || null,
        tags: Array.isArray(tags) ? tags : [],
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        publishDate: publishDate ? new Date(publishDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "CREATE_CAMPAIGN", entityType: "CAMPAIGN", entityId: campaign.id },
    }).catch(() => {});

    return res.json(serializeCampaign(campaign));
  } catch (error: any) {
    console.error("Create campaign error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Authenticated: Update campaign (full edit) ──────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      brandName, slug, type, platforms, reachTotal, budgetTier,
      coverImageUrl, brief, strategy, resultsNote, metrics,
      title, client, budget, duration, results, roi, category, tags,
      ctaText, ctaLink, publishDate, featured, status, startDate, endDate, sortOrder,
    } = req.body;

    // Check slug uniqueness (excluding this campaign)
    if (slug) {
      const conflict = await db.campaign.findFirst({ where: { slug, NOT: { id } } });
      if (conflict) return res.status(409).json({ error: "Slug already in use by another campaign" });
    }

    const data: any = {};
    if (brandName !== undefined) data.brandName = brandName;
    if (slug !== undefined) data.slug = slug;
    if (type !== undefined) data.type = type as CampaignType;
    if (platforms !== undefined) data.platforms = Array.isArray(platforms) ? platforms : [platforms];
    if (reachTotal !== undefined) data.reachTotal = reachTotal ? BigInt(reachTotal) : null;
    if (budgetTier !== undefined) data.budgetTier = budgetTier || null;
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl || null;
    if (brief !== undefined) data.brief = brief || null;
    if (strategy !== undefined) data.strategy = strategy || null;
    if (resultsNote !== undefined) data.resultsNote = resultsNote || null;
    if (metrics !== undefined) data.metrics = metrics;
    if (status !== undefined) data.status = status as CampaignStatus;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (title !== undefined) data.title = title || null;
    if (client !== undefined) data.client = client || null;
    if (budget !== undefined) data.budget = budget ? Number(budget) : null;
    if (duration !== undefined) data.duration = duration || null;
    if (results !== undefined) data.results = results || null;
    if (roi !== undefined) data.roi = roi || null;
    if (category !== undefined) data.category = category || null;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (ctaText !== undefined) data.ctaText = ctaText || null;
    if (ctaLink !== undefined) data.ctaLink = ctaLink || null;
    if (publishDate !== undefined) data.publishDate = publishDate ? new Date(publishDate) : null;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    const campaign = await db.campaign.update({ where: { id }, data });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "UPDATE_CAMPAIGN", entityType: "CAMPAIGN", entityId: campaign.id },
    }).catch(() => {});

    return res.json(serializeCampaign(campaign));
  } catch (error: any) {
    console.error("Update campaign error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Authenticated: Quick toggle status/featured ──────────────────────────────
router.patch("/:id/status", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;
    const data: any = {};
    if (status !== undefined) data.status = status as CampaignStatus;
    if (featured !== undefined) data.featured = Boolean(featured);
    const campaign = await db.campaign.update({ where: { id }, data });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "PATCH_CAMPAIGN_STATUS", entityType: "CAMPAIGN", entityId: id },
    }).catch(() => {});
    return res.json(serializeCampaign(campaign));
  } catch (error: any) {
    console.error("Patch campaign status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Soft delete campaign ─────────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const campaign = await db.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "DELETE_CAMPAIGN", entityType: "CAMPAIGN", entityId: campaign.id },
    }).catch(() => {});
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete campaign error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
