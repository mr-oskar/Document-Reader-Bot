import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { campaignsTable, db, organizationsTable, organizationMembersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/v1/campaigns", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const filters = [eq(campaignsTable.organizationId, campaignsTable.organizationId)];
  if (status) filters.push(eq(campaignsTable.status, status as typeof campaignsTable.status.enumValues[number]));
  const campaigns = await db.select().from(campaignsTable).where(and(...filters)).orderBy(desc(campaignsTable.createdAt)).limit(limit);
  res.json({ items: campaigns, nextCursor: null });
});

router.post("/v1/campaigns", requireRole("advertiser", "admin", "super_admin"), async (req, res): Promise<void> => {
  const { name, brief, budgetMinor, currency, cpvMinor, targetViews, target, requirements, platforms, startsOn, endsOn } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || !Number.isInteger(budgetMinor) || !Number.isInteger(cpvMinor) || !Number.isInteger(targetViews)) {
    res.status(400).json({ code: "INVALID_CAMPAIGN", message: "Campaign name and integer budget fields are required.", requestId: req.id });
    return;
  }
  const [organization] = await db.insert(organizationsTable).values({
    name: `${req.platformUser?.displayName ?? "AdPerform"} Organization`,
    slug: `org-${req.platformUser?.id ?? "unknown"}`,
  }).onConflictDoNothing().returning();
  const organizationId = organization?.id;
  if (!organizationId || !req.platformUser) {
    res.status(500).json({ code: "ORGANIZATION_NOT_READY", message: "Could not create the advertiser organization.", requestId: req.id });
    return;
  }
  await db.insert(organizationMembersTable).values({ organizationId, userId: req.platformUser.id, role: req.platformUser.role }).onConflictDoNothing();
  const [campaign] = await db.insert(campaignsTable).values({
    organizationId,
    createdByUserId: req.platformUser.id,
    name: name.trim(),
    brief: typeof brief === "string" ? brief : null,
    budgetMinor,
    currency: typeof currency === "string" ? currency : "SAR",
    cpvMinor,
    targetViews,
    target: target && typeof target === "object" ? target : {},
    requirements: requirements && typeof requirements === "object" ? requirements : {},
    platforms: Array.isArray(platforms) ? platforms.filter((value): value is string => typeof value === "string") : [],
    startsOn: startsOn ? new Date(startsOn) : null,
    endsOn: endsOn ? new Date(endsOn) : null,
  }).returning();
  res.status(201).json(campaign);
});

router.get("/v1/campaigns/:campaignId", requireAuth, async (req, res): Promise<void> => {
  const campaignId = String(req.params.campaignId);
  if (!uuidPattern.test(campaignId)) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign was not found.", requestId: req.id });
    return;
  }
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaignId)).limit(1);
  if (!campaign) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign was not found.", requestId: req.id });
    return;
  }
  res.json(campaign);
});

router.patch("/v1/campaigns/:campaignId", requireRole("advertiser", "admin", "super_admin"), async (req, res): Promise<void> => {
  const campaignId = String(req.params.campaignId);
  if (!uuidPattern.test(campaignId)) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign was not found.", requestId: req.id });
    return;
  }
  const [existing] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaignId)).limit(1);
  if (!existing) {
    res.status(404).json({ code: "CAMPAIGN_NOT_FOUND", message: "Campaign was not found.", requestId: req.id });
    return;
  }
  if (existing.status !== "draft") {
    res.status(409).json({ code: "CAMPAIGN_NOT_EDITABLE", message: "Only draft campaigns can be edited.", requestId: req.id });
    return;
  }
  const body = req.body ?? {};
  const [campaign] = await db.update(campaignsTable).set({
    name: typeof body.name === "string" ? body.name.trim() : existing.name,
    brief: typeof body.brief === "string" ? body.brief : existing.brief,
    budgetMinor: Number.isInteger(body.budgetMinor) ? body.budgetMinor : existing.budgetMinor,
    cpvMinor: Number.isInteger(body.cpvMinor) ? body.cpvMinor : existing.cpvMinor,
    targetViews: Number.isInteger(body.targetViews) ? body.targetViews : existing.targetViews,
    target: body.target && typeof body.target === "object" ? body.target : existing.target,
    requirements: body.requirements && typeof body.requirements === "object" ? body.requirements : existing.requirements,
    platforms: Array.isArray(body.platforms) ? body.platforms.filter((value: unknown): value is string => typeof value === "string") : existing.platforms,
    updatedAt: new Date(),
  }).where(eq(campaignsTable.id, existing.id)).returning();
  res.json(campaign);
});

export default router;