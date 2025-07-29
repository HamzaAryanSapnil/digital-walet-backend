import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
  _id?: string;
  user: Types.ObjectId; // reference
  balance: number;
  status: WalletStatus;
}
