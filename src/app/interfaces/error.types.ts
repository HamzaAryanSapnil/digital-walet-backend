export interface IErrorSources {
  path: string;
  message: string;
}

export interface IErrorResponse {
  statusCode: number;
  message: string;
  errorSources?: IErrorSources[];
}
