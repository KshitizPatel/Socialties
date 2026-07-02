import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:51214/template1";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

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

  console.log("Creating permissions...");
  const dbPermissions = [];
  for (const key of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
    dbPermissions.push(perm);
  }

  console.log("Creating roles...");
  // SUPER_ADMIN
  const superAdminRole = await prisma.role.upsert({
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

  // ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      permissions: {
        connect: dbPermissions
          .filter((p) => p.key !== "users.write")
          .map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "ADMIN",
      permissions: {
        connect: dbPermissions
          .filter((p) => p.key !== "users.write")
          .map((p) => ({ id: p.id })),
      },
    },
  });

  // EDITOR
  const editorRole = await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: {
      permissions: {
        connect: dbPermissions
          .filter((p) => ["campaigns.write", "campaigns.read", "team.write", "team.read", "leads.read"].includes(p.key))
          .map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "EDITOR",
      permissions: {
        connect: dbPermissions
          .filter((p) => ["campaigns.write", "campaigns.read", "team.write", "team.read", "leads.read"].includes(p.key))
          .map((p) => ({ id: p.id })),
      },
    },
  });

  // 2. Default Super Admin User
  console.log("Creating default super admin...");
  const adminEmail = "admin@socialties.in";
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
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

  // 3. Services
  console.log("Creating services...");
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
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        description: service.description,
        icon: service.icon,
        sortOrder: service.sortOrder,
      },
      create: service,
    });
  }

  // 4. Settings
  console.log("Creating settings...");
  const existingSettings = await prisma.homepageSettings.findFirst();
  if (!existingSettings) {
    await prisma.homepageSettings.create({
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

  // 5. SEO Settings
  console.log("Creating default SEO settings...");
  const seoPages = [
    { pagePath: "/", title: "Socialties | Leading Influencer Marketing Agency India", description: "Grow your brand with Socialties, India's premier influencer marketing and digital creative agency. Strategy meets storytelling." },
    { pagePath: "/campaigns", title: "Our Campaigns | Socialties Case Studies", description: "Explore how Socialties drives real ROI for top brands. Check out our influencer marketing and advertising case studies." },
    { pagePath: "/team", title: "Meet the Team | Socialties", description: "Meet the strategists, creators, and developers behind Socialties. Our people make influence happen." },
    { pagePath: "/creators", title: "For Creators | Join Socialties Network", description: "Are you a creator? Monetize your audience, land premium brand campaigns, and grow with Socialties representation." },
    { pagePath: "/brands", title: "For Brands | Launch Campaigns with Socialties", description: "Scale your customer acquisition. Partner with Socialties to build end-to-end influencer marketing campaigns." },
    { pagePath: "/contact", title: "Contact Us | Socialties Delhi Office", description: "Get in touch with Socialties. Start your campaign today. Located in Azadpur, New Delhi." }
  ];

  for (const seo of seoPages) {
    await prisma.seoSetting.upsert({
      where: { pagePath: seo.pagePath },
      update: {
        title: seo.title,
        description: seo.description,
      },
      create: seo,
    });
  }

  // Seed FAQs
  console.log("Seeding FAQs...");
  const faqData = [
    { question: "How do you select influencers for my campaign?", answer: "We use a mix of data analysis and manual screening. We evaluate target audience alignment, historical performance metrics, real vs bot follower ratios, brand safety, and engagement quality to curate a highly optimized creator shortlist.", sortOrder: 0 },
    { question: "What is your pricing model?", answer: "Our pricing depends on the campaign scale, objectives, and creator tiers involved. We operate on project-based management fees or retainer options with zero hidden costs or markups on creator rates.", sortOrder: 1 },
    { question: "How do you track campaign performance?", answer: "We provide comprehensive live performance dashboards and post-campaign analytical audits tracking CTRs, direct sales/conversions, cost-per-acquisition (CPA), return on ad spend (ROAS), and real engagement reach.", sortOrder: 2 },
    { question: "I am a creator, how do I apply to join Socialties?", answer: "Simple! Head over to our Creators page, fill out the application form, link your active social handles, and upload your latest media kit. Our creator relations team will review your application within 3-5 business days.", sortOrder: 3 },
    { question: "How long does it take to launch an influencer campaign?", answer: "For standard gifting or product promotion campaigns, we can go live within 2-3 weeks from the brief sign-off, which includes influencer sourcing, agreement contracts, content review, and posting.", sortOrder: 4 },
    { question: "Do you handle paid advertising along with influencer campaigns?", answer: "Yes, absolutely. We run performance ads using creator content (creator-licensing whitelist ads) on Meta and TikTok/Google, which consistently drives 2-3x higher conversion compared to standard brand ads.", sortOrder: 5 },
  ];
  const existingFaqs = await prisma.faqItem.count();
  if (existingFaqs === 0) {
    for (const faq of faqData) {
      await prisma.faqItem.create({ data: { ...faq, isVisible: true } });
    }
  }

  // Seed WhyCards
  console.log("Seeding WhyCards...");
  const whyCardData = [
    { title: "Vast Creator Network", description: "Access a curated roster of pre-vetted creators across multiple niches with active, engaged followings.", icon: "Users", sortOrder: 0 },
    { title: "Swift Campaign Execution", description: "Go from campaign concept to active live postings in record time with our streamlined execution pipeline.", icon: "Zap", sortOrder: 1 },
    { title: "Verified Audiences", description: "We filter out fake followers and bot engagement to ensure every dollar is spent on genuine real people.", icon: "ShieldCheck", sortOrder: 2 },
    { title: "Transparent Partnership", description: "No hidden management fees, clear pricing models, and honest feedback loop on campaign expectations.", icon: "CheckCircle2", sortOrder: 3 },
    { title: "End-to-End Management", description: "From discovery, briefing, negotiation, content supervision to posting, we handle every detail.", icon: "Layers", sortOrder: 4 },
    { title: "Performance Analytics", description: "Track conversions, click-through rates, reach, and total engagement with our granular post-campaign reports.", icon: "BarChart3", sortOrder: 5 },
    { title: "Dedicated Account Support", description: "A single dedicated campaign manager coordinating every step of your campaigns to ensure flawless execution.", icon: "HelpCircle", sortOrder: 6 },
  ];
  const existingWhyCards = await prisma.whyCard.count();
  if (existingWhyCards === 0) {
    for (const card of whyCardData) {
      await prisma.whyCard.create({ data: { ...card, isVisible: true } });
    }
  }

  // Seed CTA Sections
  console.log("Seeding CTA Sections...");
  const ctaSectionData = [
    { key: "brands_banner", headline: "Launch a campaign that drives real sales.", subtext: "Skip the vanity metrics. Partner with top vetted creators and run optimized social acquisition funnels built for ROI.", badge: "For Brands", ctaText: "Work With Us", ctaHref: "/brands", variant: "dark" },
    { key: "creators_banner", headline: "Turn your influence into consistent income.", subtext: "Get access to premium brand campaigns, transparent payouts, creative support, and long-term representation.", badge: "For Creators", ctaText: "Apply to Join", ctaHref: "/creators", variant: "dark" },
    { key: "final_band", headline: "Ready to grow? Let's talk.", subtext: "Get in touch with our team to kickstart your next campaign today.", ctaText: "Call Us", ctaHref: "tel:+919876543210", ctaText2: "WhatsApp", ctaHref2: "https://wa.me/919876543210", variant: "gradient" },
  ];
  for (const cta of ctaSectionData) {
    await prisma.ctaSection.upsert({
      where: { key: cta.key },
      update: {},
      create: { ...cta, isVisible: true },
    });
  }

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
