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
const transactionSearchableFields = ["type", "status"];
const getMyTransactions = async (
  userId: string,
  query: Record<string, string>
) => {
  // const queryBuilder = await new QueryBuilder(
  //   Transaction.find({
  //     $or: [{ from: userId }, { to: userId }],
  //   }),
  //   query ?? {}
  // );
  // const myAllTransactions = queryBuilder
  //   .filter()
  //   .search(transactionSearchableFields)
  //   .sort()
  //   .fields()
  //   .paginate();
  // const [data, meta] = await Promise.all([
  //   myAllTransactions.build(),
  //   queryBuilder.getMeta(),
  // ]);

  // return {
  //   data,
  //   meta,
  // };
  const baseFilter: Record<string, any> = {
    $or: [{ from: userId }, { to: userId }],
  };

  const reqPage = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const rawSort = query.sort || "-createdAt";
  const rawFields = query.fields || "";
  const searchTerm = (query.searchTerm || "").trim();
  const typeFilter = query.type;
  const statusFilter = query.status;

  const extraFilter: Record<string, any> = {};
  if (typeFilter) extraFilter.type = typeFilter;
  if (statusFilter) extraFilter.status = statusFilter;

  let searchFilter: Record<string, any> | null = null;
  if (searchTerm) {
    searchFilter = {
      $or: transactionSearchableFields.map((f) => ({
        [f]: { $regex: searchTerm, $options: "i" },
      })),
    };
  }

  const combinedFilter =
    Object.keys(extraFilter).length > 0 || searchFilter
      ? {
          $and: [
            baseFilter,
            ...(Object.keys(extraFilter).length > 0 ? [extraFilter] : []),
            ...(searchFilter ? [searchFilter] : []),
          ],
        }
      : baseFilter;

  const total = await Transaction.countDocuments(combinedFilter);

  const totalPage = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(reqPage, totalPage);
  const skip = (page - 1) * limit;

  const select =
    rawFields
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ") || undefined;

  const sort = rawSort;

  // const data = await Transaction.find(combinedFilter)
  //   .sort(sort)
  //   .skip(skip)
  //   .limit(limit)
  //   .select(select || "")
  //   .lean()
  //   .exec();
  let txQuery = Transaction.find(combinedFilter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  if (select) {
    txQuery = txQuery.select(select);
  }

  const data = await txQuery.exec();

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

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

const getDailyTransactionAggregate = async (query: Record<string, any>) => {
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
