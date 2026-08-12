import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/v1/me", requireAuth, (req, res): void => {
  const user = req.platformUser;
  if (!user) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Authentication is required.", requestId: req.id });
    return;
  }
  res.json(user);
});

export default router;