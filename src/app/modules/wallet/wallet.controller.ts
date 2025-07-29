/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
// import { WalletServices } from "./wallet.services";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { WalletServices } from "./waller.service";

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  console.log("User id from get my wallet: ", user.userId);

  const result = await WalletServices.getMyWallet(user?.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wallet retrieved successfully",
    data: result,
  });
});

const depositToMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const amount = req.body.amount;
  const result = await WalletServices.deposit(user.userId, amount);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Deposit successful",
    data: result,
  });
});

const withdrawFromMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const amount = req.body.amount;
  const result = await WalletServices.withdraw(user.userId, amount);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Withdrawal successful",
    data: result,
  });
});

const sendMoneyToAnotherUser = catchAsync(
  async (req: Request, res: Response) => {
    const sender = req.user as JwtPayload;
    const { receiverPhone, amount } = req.body;
    const result = await WalletServices.sendMoney(
      sender.userId,
      receiverPhone,
      amount
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Money sent successfully",
      data: result,
    });
  }
);

const agentCashIn = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user as JwtPayload;
  const { userPhone, amount } = req.body;

  const result = await WalletServices.cashInToUserWallet(
    agent?.userId,
    userPhone,
    Number(amount)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash-in successful",
    data: result,
  });
});

const agentCashOut = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user as JwtPayload;
  const { userPhone, amount } = req.body;

  const result = await WalletServices.cashOutFromUserWallet(
    agent?.userId,
    userPhone,
    Number(amount)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash-out successful",
    data: result,
  });
});

const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await WalletServices.blockWallet(walletId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const unblockWallet = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await WalletServices.unblockWallet(walletId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

export const WalletControllers = {
  getMyWallet,
  depositToMyWallet,
  withdrawFromMyWallet,
  sendMoneyToAnotherUser,
  agentCashIn,
  agentCashOut,
  blockWallet,
  unblockWallet
};
