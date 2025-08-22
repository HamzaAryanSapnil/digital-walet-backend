/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { UserServices } from "./user.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  }
);
const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  }
);

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userDoc = await UserServices.createUser(req.body);
    const user = userDoc.toObject();
    const { password, ...rest } = user;

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: rest,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;

    const verifiedToken = req.user;
    if (envVars.NODE_ENV === "development") {
      console.log("verified token", verifiedToken);
    }
    const payload = req.body;
    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User updated Successfully",
      data: user,
    });
  }
);

const approveAgent = catchAsync(async (req, res) => {
  const agentId = req.params.id;
  const result = await UserServices.approveAgent(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

const suspendAgent = catchAsync(async (req, res) => {
  const agentId = req.params.id;
  const result = await UserServices.suspendAgent(agentId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  approveAgent,
  suspendAgent,
  getMe,
};
