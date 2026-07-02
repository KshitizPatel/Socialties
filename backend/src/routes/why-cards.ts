import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Public: visible WhyCards sorted ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const cards = await db.whyCard.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(cards);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: all cards ─────────────────────────────────────────────────
router.get("/all", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const cards = await db.whyCard.findMany({ orderBy: { sortOrder: "asc" } });
    return res.json(cards);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create ────────────────────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, icon, sortOrder, isVisible } = req.body;
    if (!title || !description || !icon) return res.status(400).json({ error: "title, description, icon required" });
    const card = await db.whyCard.create({
      data: { title, description, icon, sortOrder: sortOrder ?? 0, isVisible: isVisible ?? true },
    });
    return res.json(card);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Update ────────────────────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, icon, sortOrder, isVisible } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isVisible !== undefined) data.isVisible = Boolean(isVisible);
    const card = await db.whyCard.update({ where: { id: req.params.id }, data });
    return res.json(card);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Bulk reorder ──────────────────────────────────────────────
router.patch("/reorder", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
    await Promise.all(
      items.map((item: { id: string; sortOrder: number }) =>
        db.whyCard.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
      )
    );
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Delete ────────────────────────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    await db.whyCard.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
