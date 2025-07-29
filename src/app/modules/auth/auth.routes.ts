import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

const router = Router();

router.post("/login");
router.post("/refresh-token");
router.post("/logout");
router.post("/reset-password");

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" })
);

export const AuthRoutes = router;