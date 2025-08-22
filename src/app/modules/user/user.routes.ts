import { Router } from "express";


import {  updateUserZodSchema } from "./user.validation";


import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validate.request";
import { UserControllers } from "./user.controller";

const router = Router();



router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  UserControllers.getMe
);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
