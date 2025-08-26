import { Router } from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { Role } from "../modules/user/user.interface";
import { WalletControllers } from "../modules/wallet/wallet.controller";
import { UserControllers } from "../modules/user/user.controller";
import { TransactionControllers } from "../modules/transaction/transaction.controller";

const router = Router();

router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.ADMIN),
  UserControllers.getAllUsers
);



// Admin view all transactions
router.get(
  "/all-transaction",
  checkAuth(Role.ADMIN),
  TransactionControllers.getAllTransactions
);
router.get(
  "/transactions-summery",
  checkAuth(Role.ADMIN),
  TransactionControllers.getDailyTransactionAggregate
);
router.get(
  "/all-wallets",
  checkAuth(Role.ADMIN),
  WalletControllers.getAllWallets
);






router.patch(
  "/agents/approve/:id",
  checkAuth(Role.ADMIN),
  UserControllers.approveAgent
);

router.patch(
  "/user/block/:id",
  checkAuth(Role.ADMIN),
  UserControllers.blockUser
);
router.patch(
  "/user/unblock/:id",
  checkAuth(Role.ADMIN),
  UserControllers.unBlockUser
);

router.patch(
  "/agents/suspend/:id",
  checkAuth(Role.ADMIN),
  UserControllers.suspendAgent
);


router.patch(
  "/wallets/block/:id",
  checkAuth(Role.ADMIN),
  WalletControllers.blockWallet
);

router.patch(
  "/wallets/unblock/:id",
  checkAuth(Role.ADMIN),
  WalletControllers.unblockWallet
);



export const AdminRoutes = router;
