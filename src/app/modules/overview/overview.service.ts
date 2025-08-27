/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Types } from "mongoose";
import { ITransaction } from "../transaction/transaction.interface";
import { Transaction } from '../transaction/transaction.model';
import { User } from '../user/user.model';
import { IWallet } from '../wallet/wallet.interface';
import { Wallet } from "../wallet/wallet.model";

type TimeRange = "7d" | "30d" | "90d";

export interface OverviewOpts {
  recentCount?: number;
  timeseriesRange?: TimeRange;
  timezone?: string; // e.g. "+06:00"
}

export interface TimeseriesPoint {
  date: string;
  transactions: number;
  volume: number;
}

export interface TopCounterparty {
  userId: Types.ObjectId | string;
  name?: string | null;
  email?: string | null;
  totalAmount: number;
  txCount: number;
}

export interface OverviewResult {
  walletBalance: number | null;
  totals: {
    cashIn: number;
    cashOut: number;
    commission: number;
    fee: number;
    txCount: number;
    pendingCount: number;
  };
  recent: Partial<ITransaction & { createdAt?: Date; updatedAt?: Date }>[]; // lean results
  timeseries: TimeseriesPoint[];
  topCounterparties: TopCounterparty[];
}

const DEFAULT_OPTS: Required<OverviewOpts> = {
  recentCount: 6,
  timeseriesRange: "30d",
  timezone: "+06:00",
};

function getStartDate(range: TimeRange) {
  const now = new Date();
  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export async function getAgentOverview(
  userId: string,
  opts?: OverviewOpts
): Promise<OverviewResult> {
  const o = { ...DEFAULT_OPTS, ...(opts || {}) };
  const uid = new mongoose.Types.ObjectId(userId);

  // wallet
  const walletP = Wallet.findOne({ user: uid }).lean().exec();

  // totals + pending
  const totalsAggP = Transaction.aggregate([
    { $match: { $or: [{ from: uid }, { to: uid }] } },
    {
      $group: {
        _id: null,
        totalCashIn: {
          $sum: { $cond: [{ $eq: ["$type", "CASH_IN"] }, "$amount", 0] },
        },
        totalCashOut: {
          $sum: { $cond: [{ $eq: ["$type", "CASH_OUT"] }, "$amount", 0] },
        },
        totalCommission: { $sum: { $ifNull: ["$commission", 0] } },
        totalFee: { $sum: { $ifNull: ["$fee", 0] } },
        txCount: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
        },
      },
    },
  ]).exec();

  // recent
  const recentP = Transaction.find({ $or: [{ from: uid }, { to: uid }] })
    .sort({ createdAt: -1 })
    .limit(o.recentCount)
    .lean()
    .exec();

  // timeseries
  const startDate = getStartDate(o.timeseriesRange);
  const timeseriesP = Transaction.aggregate([
    {
      $match: {
        $or: [{ from: uid }, { to: uid }],
        createdAt: { $gte: startDate },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: o.timezone,
          },
        },
        transactions: { $sum: 1 },
        volume: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", transactions: 1, volume: 1 } },
  ]).exec();

  // top counterparties
  const topCounterP = Transaction.aggregate([
    { $match: { $or: [{ from: uid }, { to: uid }] } },
    {
      $project: {
        other: {
          $cond: [{ $eq: ["$from", uid] }, "$to", "$from"],
        },
        amount: 1,
      },
    },
    {
      $group: {
        _id: "$other",
        totalAmount: { $sum: "$amount" },
        txCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 6 },
    { $project: { userId: "$_id", totalAmount: 1, txCount: 1, _id: 0 } },
  ]).exec();

  const [wallet, totalsArr, recent, timeseries, topCounter] = await Promise.all(
    [walletP, totalsAggP, recentP, timeseriesP, topCounterP]
  );

  const totalsRaw = totalsArr && totalsArr.length > 0 ? totalsArr[0] : null;

  const totals = {
    cashIn: totalsRaw?.totalCashIn ?? 0,
    cashOut: totalsRaw?.totalCashOut ?? 0,
    commission: totalsRaw?.totalCommission ?? 0,
    fee: totalsRaw?.totalFee ?? 0,
    txCount: totalsRaw?.txCount ?? 0,
    pendingCount: totalsRaw?.pendingCount ?? 0,
  };

  // fill timeseries gaps
  const start = startDate;
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const dateMap: Record<string, { transactions: number; volume: number }> = {};
  timeseries.forEach(
    (r: any) =>
      (dateMap[r.date] = { transactions: r.transactions, volume: r.volume })
  );

  const dayList: TimeseriesPoint[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dt = d.toISOString().slice(0, 10);
    if (dateMap[dt])
      dayList.push({
        date: dt,
        transactions: dateMap[dt].transactions,
        volume: dateMap[dt].volume,
      });
    else dayList.push({ date: dt, transactions: 0, volume: 0 });
  }

  // resolve top counterparties to user info
  const counterIds = topCounter.map((t: any) => t.userId).filter(Boolean);
  const counterUsers = counterIds.length
    ? await User.find({ _id: { $in: counterIds } })
        .select("name email")
        .lean()
        .exec()
    : [];

  const topCounterparties: TopCounterparty[] = topCounter.map((t: any) => {
    const user = counterUsers.find(
      (u: any) => String(u._id) === String(t.userId)
    );
    return {
      userId: t.userId,
      name: user?.name ?? null,
      email: user?.email ?? null,
      totalAmount: t.totalAmount,
      txCount: t.txCount,
    };
  });

  return {
    walletBalance: (wallet as IWallet | null)?.balance ?? null,
    totals,
    recent,
    timeseries: dayList,
    topCounterparties,
  } as OverviewResult;
}

export async function getUserOverview(
  userId: string,
  opts?: OverviewOpts
): Promise<OverviewResult> {
  const res = await getAgentOverview(userId, opts);
  // optionally remove commission if not needed for general users
  // delete (res as any).totals.commission;
  return res;
}


export const OverviewService = {
  getAgentOverview,
  getUserOverview
};