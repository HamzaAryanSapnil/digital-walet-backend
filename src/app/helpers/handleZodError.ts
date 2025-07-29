/* eslint-disable @typescript-eslint/no-explicit-any */

import { IErrorResponse, IErrorSources } from "../interfaces/error.types";

export const handleZodError = (err: any): IErrorResponse => {
  const errorSources: IErrorSources[] = [];

  err.issues.forEach((issue: any) => {
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    });
  });

  return {
    statusCode: 400,
    message: `Zod Validation Error. ${err.issues[0]?.message}`,
    errorSources,
  };
};
