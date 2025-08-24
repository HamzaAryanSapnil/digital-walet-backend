import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";
import AppError from "../../error-helpers/app-error";
import { Wallet } from "../wallet/wallet.model";
import { WalletStatus } from "../wallet/wallet.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";


const userSearchableFields = ["name", "email", "role", "phone", "status"];
const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = await new QueryBuilder(
    User.find().select("-password"),
    query ?? {}
  );
  const allUsers = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    allUsers.build(),
    queryBuilder.getMeta(),
  ]);

  // const users = await User.find({});
  // const totalUsers = await User.countDocuments();
  return {
    data,
    meta
  };
};
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return {
    data: user,
  };
};

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    ...rest,
    password: hashedPassword,
    auths: [authProvider],
  });

  await Wallet.create({
    user: user._id,
    balance: 50,
    status: WalletStatus.ACTIVE, // optional if default in schema
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (isUserExists.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user cannot be updated");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You don't have permission to change user's role"
      );
    }
  }

  if (payload.status || payload.isVerified || payload.isApproved) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized or you don't have permission to take such kinds of actions"
      );
    }
  }
  if (payload.commissionRate) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized or you don't have permission to take such kinds of actions"
      );
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};


const blockUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.status = UserStatus.BLOCKED;
  await user.save();

  return {
    message: "User blocked successfully",
  };
};

const unblockUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.status = UserStatus.ACTIVE;
  await user.save();

  return {
    message: "User unblocked successfully",
  };
};

// user.service.ts

const approveAgent = async (agentId: string) => {
  const agent = await User.findOne({ _id: agentId, role: Role.AGENT });
  if (!agent) throw new AppError(404, "Agent not found");

  agent.isApproved = true;
  await agent.save();

  return { message: "Agent approved", agentId };
};

const suspendAgent = async (agentId: string) => {
  const agent = await User.findOne({ _id: agentId, role: Role.AGENT });
  if (!agent) throw new AppError(404, "Agent not found");

  agent.isApproved = false;
  await agent.save();

  return { message: "Agent suspended", agentId };
};



export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  blockUser,
  unblockUser,
  approveAgent,
  suspendAgent,
  getMe,
};
