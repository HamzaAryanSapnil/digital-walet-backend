/* eslint-disable @typescript-eslint/no-explicit-any */
// controllers/dashboard.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { OverviewService } from "./overview.service";


// GET /api/v1/dashboard/overview?recentCount=6&timeseriesRange=30d&timezone=+06:00
export const getDashboardOverview = catchAsync(
  async (req: Request, res: Response) => {
    // req.user populated by your auth middleware (JwtPayload with userId and role)
    const user = req.user as JwtPayload;
    if (!user || !user.userId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Unauthorized",
        data: null,
      });
    }

    // optional query params (strings from URL)
    const recentCount = req.query.recentCount
      ? Number(req.query.recentCount)
      : undefined;
    const timeseriesRange = (req.query.timeseriesRange as any) || undefined; // "7d" | "30d" | "90d"
    const timezone = (req.query.timezone as string) || undefined;

    const opts = {
      ...(recentCount ? { recentCount } : {}),
      ...(timeseriesRange ? { timeseriesRange } : {}),
      ...(timezone ? { timezone } : {}),
    };

    let result;
    if (user.role === Role.AGENT) {
      result = await OverviewService.getAgentOverview(user.userId, opts);
    } else {
      // normal user
      result = await OverviewService.getUserOverview(user.userId, opts);
    }

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Dashboard overview retrieved successfully",
      data: result,
    });
  }
);

export const OverviewControllers = {
  getDashboardOverview,
};