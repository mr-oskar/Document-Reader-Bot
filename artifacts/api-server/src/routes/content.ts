import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { contentSubmissionsTable, db, reviewsTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth";
import { getReviewMode } from "../lib/platform-settings";

const router: IRouter = Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/v1/content/review-queue", requireRole("reviewer", "admin", "super_admin"), async (_req, res): Promise<void> => {
  const mode = await getReviewMode();
  if (mode === "ai") {
    res.json([]);
    return;
  }
  const items = await db.select().from(contentSubmissionsTable)
    .where(eq(contentSubmissionsTable.status, "submitted"))
    .orderBy(desc(contentSubmissionsTable.submittedAt));
  res.json(items);
});

router.post("/v1/content/:contentId/review", requireRole("reviewer", "admin", "super_admin"), async (req, res): Promise<void> => {
  const mode = await getReviewMode();
  if (mode === "ai") {
    res.status(409).json({ code: "AI_REVIEW_ENABLED", message: "Human review is paused while AI review mode is enabled.", requestId: req.id });
    return;
  }
  const contentId = String(req.params.contentId);
  const decision = req.body?.decision;
  if (!uuidPattern.test(contentId)) {
    res.status(404).json({ code: "CONTENT_NOT_FOUND", message: "Content was not found.", requestId: req.id });
    return;
  }
  if (!["approved", "rejected", "needs_changes", "escalated"].includes(decision)) {
    res.status(400).json({ code: "INVALID_REVIEW_DECISION", message: "A valid human review decision is required.", requestId: req.id });
    return;
  }
  const [content] = await db.update(contentSubmissionsTable).set({
    status: decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : decision === "needs_changes" ? "needs_changes" : "escalated",
    updatedAt: new Date(),
  }).where(eq(contentSubmissionsTable.id, contentId)).returning();
  if (!content) {
    res.status(404).json({ code: "CONTENT_NOT_FOUND", message: "Content was not found.", requestId: req.id });
    return;
  }
  await db.insert(reviewsTable).values({
    contentSubmissionId: content.id,
    reviewerId: req.platformUser?.id,
    decision,
    checklist: req.body?.checklist && typeof req.body.checklist === "object" ? req.body.checklist : {},
    reason: typeof req.body?.reason === "string" ? req.body.reason : null,
    note: typeof req.body?.note === "string" ? req.body.note : null,
    decidedAt: new Date(),
  });
  res.json(content);
});

export default router;