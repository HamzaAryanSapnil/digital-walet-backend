/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import {
  IAuthProvider,
  IUser,
  Role,
  UserStatus,
} from "../modules/user/user.interface";

export const seedAdmin = async () => {
  try {
    const isAdminExists = await User.findOne({
      email: envVars.ADMIN_EMAIL,
    });

    if (isAdminExists) {
      if (envVars.NODE_ENV === "development") {
        console.log("Admin Already Exists");
      }
      return;
    }

    if (envVars.NODE_ENV === "development") {
      console.log("Trying to create an admin...");
    }

    const hashedPassword = await bcrypt.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Admin",
      role: Role.ADMIN,
      phone: envVars.ADMIN_PHONE,
      status: UserStatus.ACTIVE,
      email: envVars.ADMIN_EMAIL,
      password: hashedPassword,
      auths: [authProvider],
      isVerified: true,
      isApproved: true,
    };

    const admin = await User.create(payload);

    if (envVars.NODE_ENV === "development") {
      console.log("Admin Created Successfully \n");
      console.log(admin);
    }
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      console.log(error);
    }
  }
};
