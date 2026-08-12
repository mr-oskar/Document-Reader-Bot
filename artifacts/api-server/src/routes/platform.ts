import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  auditLogsTable,
  db,
  platformSettingsTable,
} from "@workspace/db";
import { reviewModeSchema } from "@workspace/db/schema";
import { getReviewMode, REVIEW_MODE_KEY } from "../lib/platform-settings";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/v1/admin/platform-settings/review-mode", requireRole("admin", "super_admin"), async (req, res): Promise<void> => {
  const mode = await getReviewMode();
  res.json({ mode, changedAt: new Date().toISOString() });
});

router.put("/v1/admin/platform-settings/review-mode", requireRole("admin", "super_admin"), async (req, res): Promise<void> => {
  const parsed = reviewModeSchema.safeParse(req.body?.mode);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_REVIEW_MODE", message: "Review mode must be human or ai.", requestId: req.id });
    return;
  }

  const now = new Date();
  const [setting] = await db.insert(platformSettingsTable).values({
    key: REVIEW_MODE_KEY,
    value: { mode: parsed.data },
    updatedByUserId: req.platformUser?.id,
  }).onConflictDoUpdate({
    target: platformSettingsTable.key,
    set: { value: { mode: parsed.data }, updatedByUserId: req.platformUser?.id, updatedAt: now },
  }).returning();

  await db.insert(auditLogsTable).values({
    actorUserId: req.platformUser?.id,
    action: "platform.review_mode_changed",
    entityType: "platform_settings",
    entityId: setting?.id,
    after: { mode: parsed.data },
    reason: `${req.platformUser?.role ?? "admin"} configuration`,
  });

  res.json({ mode: parsed.data, changedAt: now.toISOString() });
});

export default router;