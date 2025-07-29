import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";

const router = Router();

// 🔐 Only for authenticated 'user' role
router.get("/me", checkAuth(Role.USER), WalletControllers.getMyWallet);
router.post(
  "/deposit",
  checkAuth(Role.USER),
  WalletControllers.depositToMyWallet
);
router.post(
  "/withdraw",
  checkAuth(Role.USER),
  WalletControllers.withdrawFromMyWallet
);
router.post(
  "/send",
  checkAuth(Role.USER),
  WalletControllers.sendMoneyToAnotherUser
);

router.post(
  "/agent/cash-in",
  checkAuth(Role.AGENT),
  WalletControllers.agentCashIn
);

router.post(
  "/agent/cash-out",
  checkAuth(Role.AGENT),
  WalletControllers.agentCashOut
);

router.patch(
  "/admin/wallets/block/:id",
  checkAuth(Role.ADMIN),
  WalletControllers.blockWallet
);

router.patch(
  "/admin/wallets/unblock/:id",
  checkAuth(Role.ADMIN),
  WalletControllers.unblockWallet
);
export const WalletRoutes = router;
