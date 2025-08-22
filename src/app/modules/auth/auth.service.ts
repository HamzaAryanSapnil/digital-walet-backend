
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { createNewAccessTokenWithNewRefreshToken } from "../../utils/userTokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../error-helpers/app-error";
import { sendEmail } from "../../utils/sendEmail";
import { UserStatus } from "../user/user.interface";


const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithNewRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPassMatched = await bcryptjs.compare(
    oldPassword,
    user?.password as string
  );

  if (!isOldPassMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Doesn't Matched");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};



const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (!isUserExist.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
  }
  if (
    isUserExist.status === UserStatus.BLOCKED 
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.status}`
    );
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });

  /**
   * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
   */
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};
export const AuthServices = {
  getNewAccessToken,
  resetPassword,
  changePassword,
  forgotPassword,
};
