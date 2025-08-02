import {  Transaction } from "./transaction.model";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";
import { Types } from "mongoose";

export const logTransaction = async ({
  type,
  amount,
  fee = 0,
  commission = 0,
  from,
  to,
}: {
  type: TransactionType;
  amount: number;
  fee?: number;
  commission?: number;
  from?: Types.ObjectId ;
  to?: Types.ObjectId ;
}) => {
  const txnData: Partial<ITransaction> = {
    type,
    amount,
    fee,
    commission,
    from,
    to,
    status: TransactionStatus.COMPLETED,
  };

  const transaction = await Transaction.create(txnData);
  return transaction;
};

const getMyTransactions = async (userId: string) => {
  return await Transaction.find({
    $or: [{ from: userId }, { to: userId }],
  }).sort({ createdAt: -1 });
};

const getAllTransactions = async () => {
  return await Transaction.find({}).sort({ createdAt: -1 });
};


const getAgentCommission = async (agentId:string) => {
  return await Transaction.find({
    to: agentId,
    commission: {$gt: 0},
    type: TransactionType.CASH_OUT
  }).sort({createdAt: -1})
}


export const TransactionServices = {
  logTransaction,
  getMyTransactions,
  getAllTransactions,
  getAgentCommission
};
