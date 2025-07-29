/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExists) {
      if (envVars.NODE_ENV === "development") {
        console.log("Super Admin Already Exists");
      }
      return;
    }

    if (envVars.NODE_ENV === "development") {
      console.log("Trying to create super admin...");
    }

    const hashedPassword = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      auths: [authProvider],
      isVerified: true,
    };

    const superAdmin = await User.create(payload);

    if (envVars.NODE_ENV === "development") {
      console.log("Super Admin Created Successfully \n");
      console.log(superAdmin);
    }
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      console.log(error);
    }
  }
};
