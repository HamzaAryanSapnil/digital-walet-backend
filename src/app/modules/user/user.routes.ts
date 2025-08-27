import { Router } from "express";


import {  updateUserZodSchema } from "./user.validation";


import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validate.request";
import { UserControllers } from "./user.controller";
import { getDashboardOverview } from "../overview/overview.controller";

const router = Router();



router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  UserControllers.getMe
);


router.get("/overview", checkAuth(Role.USER, Role.AGENT), getDashboardOverview);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
