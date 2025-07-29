import { IErrorResponse } from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDuplicateError = (err: any): IErrorResponse => {
  const matchedArray = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `Duplicate error occurred. ${matchedArray[1]} already exists`,
  };
};
