/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
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

const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await TransactionServices.getAllTransactions(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All Transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

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

export const getDailyTransactionAggregate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const aggregated = await TransactionServices.getDailyTransactionAggregate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query as Record<string, any>
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Daily transaction aggregate retrieved successfully",
      data: aggregated,
    });
  }
);

export const TransactionControllers = {
  getMyTransactions,
  getAllTransactions,
  getAgentCommissions,
  getDailyTransactionAggregate,
};
