import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Public: visible FAQs sorted ──────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const faqs = await db.faqItem.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(faqs);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: all FAQs ──────────────────────────────────────────────────
router.get("/all", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const faqs = await db.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
    return res.json(faqs);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create ────────────────────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { question, answer, sortOrder, isVisible } = req.body;
    if (!question || !answer) return res.status(400).json({ error: "question and answer required" });
    const item = await db.faqItem.create({
      data: { question, answer, sortOrder: sortOrder ?? 0, isVisible: isVisible ?? true },
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Update ────────────────────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { question, answer, sortOrder, isVisible } = req.body;
    const data: any = {};
    if (question !== undefined) data.question = question;
    if (answer !== undefined) data.answer = answer;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isVisible !== undefined) data.isVisible = Boolean(isVisible);
    const item = await db.faqItem.update({ where: { id: req.params.id }, data });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Bulk reorder ──────────────────────────────────────────────
router.patch("/reorder", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { items } = req.body; // [{ id, sortOrder }]
    if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });
    await Promise.all(
      items.map((item: { id: string; sortOrder: number }) =>
        db.faqItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
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
    await db.faqItem.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
