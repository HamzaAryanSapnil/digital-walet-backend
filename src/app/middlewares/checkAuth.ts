import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import AppError from "../error-helpers/app-error";
import { verifyToken } from "../utils/jwt";
import { UserStatus } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No token received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExists = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExists) {
        throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exists");
      }

     

      if (isUserExists.status === UserStatus.BLOCKED) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExists.status}`
        );
      }

      if (!isUserExists.isVerified ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is not verified `
        );
      }

      // const {email, userId, role} = verifiedToken

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          "You don't have permission to access this route"
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      if (envVars.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("jwt error", error);
      }
      next(error);
    }
  };
