import  { model, Schema } from "mongoose";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    auths: [authProviderSchema],
    commissionRate: {
      type: Number,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// export const User = model<IUser>("User", userSchema);
export const User = model<IUser>("User", userSchema);
