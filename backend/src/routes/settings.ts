import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

// Public: Get homepage settings
router.get("/", async (req, res) => {
  try {
    const settings = await db.homepageSettings.findFirst();
    if (!settings) return res.json(null);
    return res.json({
      ...settings,
      statReach: settings.statReach ? settings.statReach.toString() : "0",
    });
  } catch (error: any) {
    console.error("Get homepage settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Authenticated: Update homepage settings
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      heroHeadline, heroSubheading, heroEyebrow,
      heroPrimaryBtnText, heroPrimaryBtnHref,
      heroSecondaryBtnText, heroSecondaryBtnHref,
      statCampaigns, statBrands, statCreators, statReach,
      trustedBrandLogos,
      whyHeadline, whySubtext, whyBadges,
    } = req.body;
    if (!heroHeadline || !heroSubheading) {
      return res.status(400).json({ error: "Hero headline and subheading are required" });
    }

    const existing = await db.homepageSettings.findFirst();
    let settings;
    const data: any = {
      heroHeadline,
      heroSubheading,
      heroEyebrow: heroEyebrow ?? null,
      heroPrimaryBtnText: heroPrimaryBtnText ?? null,
      heroPrimaryBtnHref: heroPrimaryBtnHref ?? null,
      heroSecondaryBtnText: heroSecondaryBtnText ?? null,
      heroSecondaryBtnHref: heroSecondaryBtnHref ?? null,
      statCampaigns: Number(statCampaigns) || 0,
      statBrands: Number(statBrands) || 0,
      statCreators: Number(statCreators) || 0,
      statReach: statReach ? BigInt(statReach) : BigInt("0"),
      whyHeadline: whyHeadline ?? null,
      whySubtext: whySubtext ?? null,
      whyBadges: whyBadges ?? null,
      ...(trustedBrandLogos !== undefined && { trustedBrandLogos }),
    };

    if (existing) {
      settings = await db.homepageSettings.update({ where: { id: existing.id }, data });
    } else {
      settings = await db.homepageSettings.create({ data: { ...data, trustedBrandLogos: trustedBrandLogos ?? [] } });
    }

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "UPDATE_HOMEPAGE_SETTINGS", entityType: "HOMEPAGE_SETTINGS", entityId: settings.id },
    }).catch(() => {});

    return res.json({ ...settings, statReach: settings.statReach ? settings.statReach.toString() : "0" });
  } catch (error: any) {
    console.error("Update homepage settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/navbar", async (req, res) => {
  try {
    const nav = await db.navbarSettings.findFirst();
    return res.json(nav ?? null);
  } catch (error: any) {
    console.error("Get navbar settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/navbar", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { logoUrl, faviconUrl, navItems } = req.body;
    const existing = await db.navbarSettings.findFirst();
    let nav;
    const data = {
      ...(logoUrl !== undefined && { logoUrl }),
      ...(faviconUrl !== undefined && { faviconUrl }),
      ...(navItems !== undefined && { navItems }),
    };

    if (existing) {
      nav = await db.navbarSettings.update({ where: { id: existing.id }, data });
    } else {
      nav = await db.navbarSettings.create({ data: { logoUrl, faviconUrl, navItems: navItems ?? [] } });
    }
    await db.auditLog.create({ data: { actorId: req.user!.id, action: "UPDATE_NAVBAR_SETTINGS", entityType: "NAVBAR_SETTINGS", entityId: nav.id } }).catch(() => {});
    return res.json(nav);
  } catch (error: any) {
    console.error("Update navbar settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/footer", async (req, res) => {
  try {
    const footer = await db.footerSettings.findFirst();
    return res.json(footer ?? null);
  } catch (error: any) {
    console.error("Get footer settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/footer", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { quickLinks, copyrightText, description, showSocialIcons } = req.body;
    const existing = await db.footerSettings.findFirst();
    let footer;
    const data = {
      ...(quickLinks !== undefined && { quickLinks }),
      ...(copyrightText !== undefined && { copyrightText }),
      ...(description !== undefined && { description }),
      ...(showSocialIcons !== undefined && { showSocialIcons }),
    };

    if (existing) {
      footer = await db.footerSettings.update({ where: { id: existing.id }, data });
    } else {
      footer = await db.footerSettings.create({ data: { quickLinks: quickLinks ?? [], copyrightText, description, showSocialIcons: showSocialIcons ?? true } });
    }
    await db.auditLog.create({ data: { actorId: req.user!.id, action: "UPDATE_FOOTER_SETTINGS", entityType: "FOOTER_SETTINGS", entityId: footer.id } }).catch(() => {});
    return res.json(footer);
  } catch (error: any) {
    console.error("Update footer settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY PROFILE
// ─────────────────────────────────────────────────────────────────────────────

router.get("/company", async (req, res) => {
  try {
    const company = await db.companyProfile.findFirst();
    return res.json(company ?? null);
  } catch (error: any) {
    console.error("Get company profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/company", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await db.companyProfile.findFirst();
    // Permit any field from the body
    const allowedFields = [
      "companyName","about","mission","vision","history","legalName","address",
      "registrationDetails","email","phone","whatsapp","workingHours",
      "googleMapsEmbedUrl","latitude","longitude","instagram","linkedin",
      "facebook","twitter","youtube"
    ];
    const data: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }

    let company;
    if (existing) {
      company = await db.companyProfile.update({ where: { id: existing.id }, data });
    } else {
      company = await db.companyProfile.create({ data: { companyName: data.companyName || "Socialties", ...data } });
    }
    await db.auditLog.create({ data: { actorId: req.user!.id, action: "UPDATE_COMPANY_PROFILE", entityType: "COMPANY_PROFILE", entityId: company.id } }).catch(() => {});
    return res.json(company);
  } catch (error: any) {
    console.error("Update company profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEO SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seo", async (req, res) => {
  try {
    const seo = await db.seoSetting.findMany({ orderBy: { pagePath: "asc" } });
    return res.json(seo);
  } catch (error: any) {
    console.error("Get SEO settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/seo", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { pagePath, title, description, ogImageUrl, keywords } = req.body;
    if (!pagePath || !title) return res.status(400).json({ error: "pagePath and title are required" });

    const seo = await db.seoSetting.upsert({
      where: { pagePath },
      update: { title, description, ogImageUrl, keywords: keywords ?? [] },
      create: { pagePath, title, description: description ?? "", ogImageUrl, keywords: keywords ?? [] },
    });
    await db.auditLog.create({ data: { actorId: req.user!.id, action: "UPDATE_SEO", entityType: "SEO_SETTING", entityId: seo.id } }).catch(() => {});
    return res.json(seo);
  } catch (error: any) {
    console.error("Update SEO error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/system", async (req, res) => {
  try {
    const sys = await db.systemSettings.findFirst();
    return res.json(sys ?? null);
  } catch (error: any) {
    console.error("Get system settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/system", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { maintenanceMode, bannerText, showBanner, primaryColor } = req.body;
    const existing = await db.systemSettings.findFirst();
    const data: any = {};
    if (maintenanceMode !== undefined) data.maintenanceMode = maintenanceMode;
    if (bannerText !== undefined) data.bannerText = bannerText;
    if (showBanner !== undefined) data.showBanner = showBanner;
    if (primaryColor !== undefined) data.primaryColor = primaryColor;

    let sys;
    if (existing) {
      sys = await db.systemSettings.update({ where: { id: existing.id }, data });
    } else {
      sys = await db.systemSettings.create({ data: { maintenanceMode: false, showBanner: false, primaryColor: "#CCFF00", ...data } });
    }
    await db.auditLog.create({ data: { actorId: req.user!.id, action: "UPDATE_SYSTEM_SETTINGS", entityType: "SYSTEM_SETTINGS", entityId: sys.id } }).catch(() => {});
    return res.json(sys);
  } catch (error: any) {
    console.error("Update system settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS (admin read-only)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/audit-logs", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await db.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    });
    return res.json(logs);
  } catch (error: any) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
