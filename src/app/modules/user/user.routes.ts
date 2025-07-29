import { Router } from "express";


import { createUserZodSchema, updateUserZodSchema } from "./user.validation";


import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validate.request";
import { UserControllers } from "./user.controller";

const router = Router();

router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.ADMIN),
  UserControllers.getAllUsers
);

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
