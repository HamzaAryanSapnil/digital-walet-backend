import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";

const router = Router();

// User/Agent view their own history
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionControllers.getMyTransactions
);


export const TransactionRoutes = router;
