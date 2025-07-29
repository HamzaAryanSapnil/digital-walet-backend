/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { IErrorResponse } from "../interfaces/error.types";

export const handleCastError = (
  err: mongoose.Error.CastError
): IErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid Mongodb Object Id. Please provide a valid id",
  };
};
