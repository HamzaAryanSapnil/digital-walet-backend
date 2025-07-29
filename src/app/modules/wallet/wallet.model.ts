import { model, Schema } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";




const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // reference
    balance: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
//  division: { type: Schema.Types.ObjectId, ref: "Division", required: true },
//     tourType: { type: Schema.Types.ObjectId, ref: "TourType", required: true },

export const Wallet = model<IWallet>("Wallet", walletSchema);
