import { getAuth } from "@clerk/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import { appRoleSchema } from "@workspace/db/schema";

declare global {
  namespace Express {
    interface Request {
      platformUser?: User;
    }
  }
}

type AuthenticatedRequest = Request & { platformUser: User };

function sessionUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth.userId ?? null;
}

async function resolvePlatformUser(req: Request): Promise<User | null> {
  const clerkUserId = sessionUserId(req);
  if (!clerkUserId) return null;

  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, clerkUserId)).limit(1);
  if (existing[0]) return existing[0];

  const auth = getAuth(req);
  const claims = auth.sessionClaims as Record<string, unknown> | undefined;
  const email = typeof claims?.email === "string" ? claims.email : null;
  const displayName = typeof claims?.name === "string" ? claims.name : null;
  const requestedRole = appRoleSchema.safeParse(claims?.metadata && typeof claims.metadata === "object"
    ? (claims.metadata as Record<string, unknown>).role
    : undefined);
  const [created] = await db.insert(usersTable).values({
    clerkUserId,
    email,
    displayName,
    role: requestedRole.success ? requestedRole.data : "creator",
  }).returning();
  return created ?? null;
}

export const requireAuth: RequestHandler = async (req, res, next): Promise<void> => {
  const user = await resolvePlatformUser(req);
  if (!user || !user.isActive) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Authentication is required.", requestId: req.id });
    return;
  }
  req.platformUser = user;
  next();
};

export function requireRole(...roles: User["role"][]): RequestHandler {
  return async (req, res, next): Promise<void> => {
    await requireAuth(req, res, () => undefined);
    const user = (req as AuthenticatedRequest).platformUser;
    if (res.headersSent) return;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ code: "FORBIDDEN", message: "You do not have permission to perform this action.", requestId: req.id });
      return;
    }
    next();
  };
}