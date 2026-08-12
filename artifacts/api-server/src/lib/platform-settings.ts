import { eq } from "drizzle-orm";
import { db, platformSettingsTable } from "@workspace/db";

export const REVIEW_MODE_KEY = "review_mode";

export async function getReviewMode(): Promise<"human" | "ai"> {
  const [setting] = await db.select().from(platformSettingsTable).where(eq(platformSettingsTable.key, REVIEW_MODE_KEY)).limit(1);
  const mode = setting?.value?.mode;
  return mode === "ai" ? "ai" : "human";
}