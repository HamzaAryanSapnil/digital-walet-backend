import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";
import { TransactionRoutes } from "../modules/transaction/transaction.routes";
import { AdminRoutes } from "./admin.routes";
export const router = Router();





const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes
  },
  {
    path: "/wallets",
    route: WalletRoutes
  },
  {
    path: "/transactions",
    route: TransactionRoutes
  },
  {
    path: "/admin",
    route: AdminRoutes
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
