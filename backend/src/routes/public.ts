import { Router } from "express";
import db from "../utils/db";

const router = Router();

// Public: Get all active services
router.get("/services", async (req, res) => {
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

// Public: Get published testimonials
router.get("/testimonials", async (req, res) => {
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

// Public: Get SEO settings for a page path (?path=/campaigns)
router.get("/seo", async (req, res) => {
  try {
    const { path } = req.query;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "path query param required" });
    }
    const seo = await db.seoSetting.findUnique({ where: { pagePath: path } });
    return res.json(seo || null);
  } catch (error: any) {
    console.error("Get SEO settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get navbar settings (dynamic nav links, logo)
router.get("/navbar", async (req, res) => {
  try {
    const nav = await db.navbarSettings.findFirst();
    return res.json(nav ?? null);
  } catch (error: any) {
    console.error("Get navbar error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get footer settings
router.get("/footer", async (req, res) => {
  try {
    const footer = await db.footerSettings.findFirst();
    return res.json(footer ?? null);
  } catch (error: any) {
    console.error("Get footer error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get company profile
router.get("/company", async (req, res) => {
  try {
    const company = await db.companyProfile.findFirst();
    return res.json(company ?? null);
  } catch (error: any) {
    console.error("Get company profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get system settings (banner, maintenance mode)
router.get("/system", async (req, res) => {
  try {
    const sys = await db.systemSettings.findFirst();
    return res.json(sys ?? null);
  } catch (error: any) {
    console.error("Get system settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get visible FAQs
router.get("/faq", async (req, res) => {
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

// Public: Get visible WhyCards
router.get("/why-cards", async (req, res) => {
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

// Public: Get all CTA sections (keyed object for easy access)
router.get("/cta-sections", async (req, res) => {
  try {
    const sections = await db.ctaSection.findMany({ where: { isVisible: true } });
    const byKey: Record<string, any> = {};
    sections.forEach((s) => {
      byKey[s.key] = s;
    });
    return res.json(byKey);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
