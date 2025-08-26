/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from "./transaction.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Types } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";

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
  from?: Types.ObjectId;
  to?: Types.ObjectId;
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

const transactionSearchableFields = ["type", "status"];
const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = await new QueryBuilder(Transaction.find(), query ?? {});
  const allTransactions = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([
    allTransactions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getAgentCommission = async (agentId: string) => {
  return await Transaction.find({
    to: agentId,
    commission: { $gt: 0 },
    type: TransactionType.CASH_OUT,
  }).sort({ createdAt: -1 });
};
 
const getDailyTransactionAggregate = async (
  query: Record<string, any>
) => {
  const { from, to, type, status } = query as Record<
    string,
    string | undefined
  >;

  // Build match object based on optional query params
  const match: Record<string, any> = {};

  if (type) match.type = type;
  if (status) match.status = status;

  if (from || to) {
    match.createdAt = {};
    if (from) {
      match.createdAt.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      match.createdAt.$lte = toDate;
    }
  }

  // Aggregation pipeline
  const pipeline: any[] = [
    { $match: match },
    // convert createdAt to YYYY-MM-DD in Asia/Dhaka timezone
    {
      $addFields: {
        dateOnly: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Dhaka",
          },
        },
      },
    },
    {
      $group: {
        _id: "$dateOnly",
        transactions: { $sum: 1 },
        volume: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        transactions: 1,
        volume: 1,
      },
    },
    { $sort: { date: 1 } }, 
  ];

  const aggregated = await Transaction.aggregate(pipeline).exec();


  return aggregated;
};

export const TransactionServices = {
  logTransaction,
  getMyTransactions,
  getAllTransactions,
  getAgentCommission,
  getDailyTransactionAggregate,
};
