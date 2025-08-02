import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { TransactionServices } from "./transaction.service";

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await TransactionServices.getMyTransactions(user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My transactions retrieved successfully",
    data: result,
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.getAllTransactions();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All transactions retrieved successfully",
    data: result,
  });
});

const getAgentCommissions = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user as JwtPayload;
  const result = await TransactionServices.getAgentCommission(agent.userId);

  if (result.length === 0) {
   return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "You don't have any commissions yet",
      data: result,
    });


  }

 return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent commission history retrieved successfully",
    data: result,
  });
});

export const TransactionControllers = {
  getMyTransactions,
  getAllTransactions,
  getAgentCommissions,
};
