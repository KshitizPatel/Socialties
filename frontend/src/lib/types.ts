/**
 * Shared enums mirroring Prisma schema — used on the frontend
 * so we don't need @prisma/client's generated types in the Next.js bundle.
 */

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
export const LeadStatus = {
  NEW: "NEW" as LeadStatus,
  CONTACTED: "CONTACTED" as LeadStatus,
  QUALIFIED: "QUALIFIED" as LeadStatus,
  WON: "WON" as LeadStatus,
  LOST: "LOST" as LeadStatus,
};

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export const ApplicationStatus = {
  PENDING: "PENDING" as ApplicationStatus,
  APPROVED: "APPROVED" as ApplicationStatus,
  REJECTED: "REJECTED" as ApplicationStatus,
};

export type CampaignType =
  | "PRODUCT_LAUNCH"
  | "BRAND_AWARENESS"
  | "EVENT_PROMOTION"
  | "GIFTING"
  | "PERFORMANCE_ADS"
  | "AMBASSADOR_PROGRAM";

export const CampaignType = {
  PRODUCT_LAUNCH: "PRODUCT_LAUNCH" as CampaignType,
  BRAND_AWARENESS: "BRAND_AWARENESS" as CampaignType,
  EVENT_PROMOTION: "EVENT_PROMOTION" as CampaignType,
  GIFTING: "GIFTING" as CampaignType,
  PERFORMANCE_ADS: "PERFORMANCE_ADS" as CampaignType,
  AMBASSADOR_PROGRAM: "AMBASSADOR_PROGRAM" as CampaignType,
};

export type CampaignStatus = "DRAFT" | "LIVE" | "COMPLETED" | "ARCHIVED";
export const CampaignStatus = {
  DRAFT: "DRAFT" as CampaignStatus,
  LIVE: "LIVE" as CampaignStatus,
  COMPLETED: "COMPLETED" as CampaignStatus,
  ARCHIVED: "ARCHIVED" as CampaignStatus,
};
