
import httpStatus from "http-status-codes";
import AppError from "../../error-helpers/app-error";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import { WalletStatus } from "./wallet.interface";
import { Role } from "../user/user.interface";


const getMyWallet = async (userId: Types.ObjectId) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  return wallet;
};

const deposit = async (userId: Types.ObjectId, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
  }

  wallet.balance += amount;
  await wallet.save();

  return wallet;
};

const withdraw = async (userId: Types.ObjectId, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Wallet is blocked");
  }

  if (wallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  return wallet;
};

const sendMoney = async (
  senderId: Types.ObjectId,
  receiverPhone: string,
  amount: number
) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const senderWallet = await Wallet.findOne({ user: senderId });

  if (!senderWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
  }

  if (senderWallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Sender wallet is blocked");
  }

  if (senderWallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  const receiverUser = await User.findOne({ phone: receiverPhone });

  if (!receiverUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver user not found");
  }

  if (receiverUser._id.equals(senderId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot send money to yourself"
    );
  }

  const receiverWallet = await Wallet.findOne({ user: receiverUser._id });

  if (!receiverWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
  }

  if (receiverWallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
  }

  // All good → process transaction
  senderWallet.balance -= amount;
  receiverWallet.balance += amount;

  await senderWallet.save();
  await receiverWallet.save();

  return {
    message: "Money sent successfully",
    senderBalance: senderWallet.balance,
    receiverPhone,
    amount,
  };
};

const cashInToUserWallet = async (
  agentId: Types.ObjectId,
  userPhone: string,
  amount: number
) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agent = await User.findById(agentId);

  if (!agent || agent.role !== Role.AGENT || !agent.isApproved) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Unauthorized agent or not approved"
    );
  }

  const user = await User.findOne({ phone: userPhone });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const userWallet = await Wallet.findOne({ user: user._id });
  if (!userWallet)
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

  if (userWallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
  }

  userWallet.balance += amount;
  await userWallet.save();

  return {
    message: "Cash-in successful",
    userPhone,
    addedAmount: amount,
    newBalance: userWallet.balance,
  };
};

const cashOutFromUserWallet = async (
  agentId: Types.ObjectId,
  userPhone: string,
  amount: number
) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agent = await User.findById(agentId);

  if (!agent || agent.role !== Role.AGENT || !agent.isApproved) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Unauthorized agent or not approved"
    );
  }

  const user = await User.findOne({ phone: userPhone });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const userWallet = await Wallet.findOne({ user: user._id });
  if (!userWallet)
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

  if (userWallet.status === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
  }

  if (userWallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "User has insufficient balance");
  }

  userWallet.balance -= amount;
  await userWallet.save();

  return {
    message: "Cash-out successful",
    userPhone,
    withdrawnAmount: amount,
    remainingBalance: userWallet.balance,
  };
};


const blockWallet = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  wallet.status = WalletStatus.BLOCKED;
  await wallet.save();

  return {
    message: "Wallet blocked successfully",
    walletId: wallet._id,
    status: wallet.status,
  };
};

const unblockWallet = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  wallet.status = WalletStatus.ACTIVE;
  await wallet.save();

  return {
    message: "Wallet unblocked successfully",
    walletId: wallet._id,
    status: wallet.status,
  };
};



export const WalletServices = {
  getMyWallet,
  deposit,
  withdraw,
  sendMoney,
  cashInToUserWallet,
  cashOutFromUserWallet,
  blockWallet,
  unblockWallet,
};