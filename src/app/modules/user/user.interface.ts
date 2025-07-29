import { Types } from "mongoose";


export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}


export interface IAuthProvider {
  provider: "google" | "credentials"; // google, credentials
  providerId: string;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  status: UserStatus;
  auths: IAuthProvider[];
  isVerified?: boolean;

  commissionRate?: number;
  isApproved?: boolean;
}
