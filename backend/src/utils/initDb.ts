import db from "./db";
import bcrypt from "bcryptjs";

export async function initializeSettings() {
  console.log("[initDb] Running database auto-initialization...");
  try {
    // 1. Roles and Permissions
    const permissionsList = [
      "campaigns.write",
      "campaigns.read",
      "team.write",
      "team.read",
      "leads.write",
      "leads.read",
      "leads.export",
      "settings.write",
      "users.write",
    ];

    const dbPermissions = [];
    for (const key of permissionsList) {
      const perm = await db.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      });
      dbPermissions.push(perm);
    }

    const superAdminRole = await db.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {
        permissions: {
          connect: dbPermissions.map((p) => ({ id: p.id })),
        },
      },
      create: {
        name: "SUPER_ADMIN",
        permissions: {
          connect: dbPermissions.map((p) => ({ id: p.id })),
        },
      },
    });

    // 2. Default Admin User
    const adminEmail = process.env.ADMIN_EMAIL || "admin@socialties.in";
    const passwordHash = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash("admin123", 12);
    await db.user.upsert({
      where: { email: adminEmail },
      update: {
        roleId: superAdminRole.id,
        isActive: true,
      },
      create: {
        name: "Super Admin",
        email: adminEmail,
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });

    // 3. Homepage settings
    const homeSettings = await db.homepageSettings.findFirst();
    if (!homeSettings) {
      await db.homepageSettings.create({
        data: {
          heroHeadline: "Where Brands Meet Real Influence.",
          heroSubheading: "We pair data-driven strategy with authentic storytelling to take your brand from just online to absolutely unforgettable.",
          statCampaigns: 150,
          statBrands: 50,
          statCreators: 500,
          statReach: BigInt("50000000"),
          trustedBrandLogos: [
            { name: "Amazon", logoUrl: "/brands/amazon.svg" },
            { name: "Paytm", logoUrl: "/brands/paytm.svg" },
            { name: "Sugar", logoUrl: "/brands/sugar.svg" },
            { name: "Myntra", logoUrl: "/brands/myntra.svg" },
            { name: "OnePlus", logoUrl: "/brands/oneplus.svg" },
          ],
        },
      });
    }

    // 4. Navbar Settings
    const navSettings = await db.navbarSettings.findFirst();
    if (!navSettings) {
      await db.navbarSettings.create({
        data: {
          logoUrl: "/logo.svg",
          faviconUrl: "/favicon.ico",
          navItems: [
            { label: "Home", href: "/", isExternal: false, show: true },
            { label: "Campaigns", href: "/campaigns", isExternal: false, show: true },
            { label: "Team", href: "/team", isExternal: false, show: true },
            { label: "Contact Us", href: "/contact", isExternal: false, show: true }
          ]
        }
      });
    }

    // 5. Footer Settings
    const footerSettings = await db.footerSettings.findFirst();
    if (!footerSettings) {
      await db.footerSettings.create({
        data: {
          copyrightText: "© {{year}} Socialties. All Rights Reserved. Legal Entity: Pushpa Exim.",
          description: "We pair data-driven strategy with authentic storytelling to take your brand from just online to absolutely unforgettable.",
          showSocialIcons: true,
          quickLinks: [
            { label: "Home", href: "/" },
            { label: "Campaigns", href: "/campaigns" },
            { label: "Team", href: "/team" },
            { label: "Contact Us", href: "/contact" }
          ]
        }
      });
    }

    // 6. Company Profile
    const companyProfile = await db.companyProfile.findFirst();
    if (!companyProfile) {
      await db.companyProfile.create({
        data: {
          companyName: "Socialties",
          legalName: "Pushpa Exim Private Limited",
          about: "We pair data-driven strategy with authentic storytelling to take your brand from just online to absolutely unforgettable.",
          mission: "To establish authentic connections between brands and consumers via strategic storytelling.",
          vision: "To be the leading influencer marketing partner globally.",
          history: "Founded in 2024 with a vision to redefine digital marketing.",
          address: "Azadpur, New Delhi, India",
          registrationDetails: "CIN: U74999DL2024PTC123456",
          email: "connect@socialties.in",
          phone: "+91 98765 43210",
          whatsapp: "+919876543210",
          workingHours: "Mon - Sat: 10:00 AM - 7:00 PM",
          googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3498.4239855845943!2d77.1706692!3d28.7128522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d024623bb410b%3A0xc4802c6cdfb3246a!2sAzadpur%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
          instagram: "https://instagram.com/socialties",
          linkedin: "https://linkedin.com/company/socialties",
          youtube: "https://youtube.com/@socialties"
        }
      });
    }

    // 7. System Settings
    const systemSettings = await db.systemSettings.findFirst();
    if (!systemSettings) {
      await db.systemSettings.create({
        data: {
          maintenanceMode: false,
          showBanner: false,
          bannerText: "Welcome to the new Socialties Platform!",
          primaryColor: "#CCFF00"
        }
      });
    }

    // 8. Default Services
    const defaultServicesCount = await db.service.count();
    if (defaultServicesCount === 0) {
      const services = [
        {
          slug: "influencer-marketing",
          title: "Influencer Marketing",
          description: "Partner with top creators to drive brand awareness, organic engagement, and conversions across Instagram and YouTube.",
          icon: "Megaphone",
          sortOrder: 1,
        },
        {
          slug: "digital-advertising",
          title: "Digital Advertising",
          description: "Performance-driven paid campaigns across Google, Meta, and social ad networks optimized for ROI.",
          icon: "TrendingUp",
          sortOrder: 2,
        },
        {
          slug: "content-creation",
          title: "Content Creation",
          description: "Engaging vertical videos, reels, copy, and graphics tailored for modern platform algorithms.",
          icon: "Video",
          sortOrder: 3,
        },
        {
          slug: "product-photography",
          title: "Product Photography",
          description: "Stunning, high-end product photos and lifestyle shoots designed to make your catalog shine.",
          icon: "Camera",
          sortOrder: 4,
        },
        {
          slug: "website-development",
          title: "Website Development",
          description: "Custom, lightning-fast web applications designed with modern UX/UI and robust features.",
          icon: "Globe",
          sortOrder: 5,
        },
        {
          slug: "app-development",
          title: "App Development",
          description: "Tailored native and cross-platform mobile apps built for performance and high conversion.",
          icon: "Smartphone",
          sortOrder: 6,
        },
      ];
      for (const service of services) {
        await db.service.create({ data: service });
      }
    }

    // 9. SEO Settings
    const defaultSeoPages = [
      { pagePath: "/", title: "Socialties | Leading Influencer Marketing Agency India", description: "Grow your brand with Socialties, India's premier influencer marketing and digital creative agency. Strategy meets storytelling." },
      { pagePath: "/campaigns", title: "Our Campaigns | Socialties Case Studies", description: "Explore how Socialties drives real ROI for top brands. Check out our influencer marketing and advertising case studies." },
      { pagePath: "/team", title: "Meet the Team | Socialties", description: "Meet the strategists, creators, and developers behind Socialties. Our people make influence happen." },
      { pagePath: "/creators", title: "For Creators | Join Socialties Network", description: "Are you a creator? Monetize your audience, land premium brand campaigns, and grow with Socialties representation." },
      { pagePath: "/brands", title: "For Brands | Launch Campaigns with Socialties", description: "Scale your customer acquisition. Partner with Socialties to build end-to-end influencer marketing campaigns." },
      { pagePath: "/contact", title: "Contact Us | Socialties Delhi Office", description: "Get in touch with Socialties. Start your campaign today. Located in Azadpur, New Delhi." }
    ];

    for (const seo of defaultSeoPages) {
      const existingSeo = await db.seoSetting.findUnique({ where: { pagePath: seo.pagePath } });
      if (!existingSeo) {
        await db.seoSetting.create({ data: seo });
      }
    }

    console.log("[initDb] Database auto-initialization complete successfully!");
  } catch (error) {
    console.error("[initDb] Error initializing database:", error);
  }
}
