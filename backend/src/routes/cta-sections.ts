import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Public: all CTA sections as array ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const sections = await db.ctaSection.findMany({ orderBy: { key: "asc" } });
    return res.json(sections);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Public: get one by key ───────────────────────────────────────────────────
router.get("/:key", async (req, res) => {
  try {
    const section = await db.ctaSection.findUnique({ where: { key: req.params.key } });
    return res.json(section ?? null);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: upsert by key ─────────────────────────────────────────────
router.put("/:key", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { key } = req.params;
    const { headline, subtext, badge, ctaText, ctaHref, ctaText2, ctaHref2, variant, isVisible } = req.body;
    if (!headline) return res.status(400).json({ error: "headline required" });

    const data = {
      headline,
      subtext: subtext ?? null,
      badge: badge ?? null,
      ctaText: ctaText ?? null,
      ctaHref: ctaHref ?? null,
      ctaText2: ctaText2 ?? null,
      ctaHref2: ctaHref2 ?? null,
      variant: variant ?? "dark",
      isVisible: isVisible ?? true,
    };

    const section = await db.ctaSection.upsert({
      where: { key },
      update: data,
      create: { key, ...data },
    });

    return res.json(section);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
