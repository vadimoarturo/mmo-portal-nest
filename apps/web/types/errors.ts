import { AxiosError } from "axios";

export interface ErrorResponse {
  statusCode: number;
  status: number;
  message: string;
  name: string;
  response: ErrorResponseType;
  options: object;
}

export interface ErrorResponseType {
  type: string;
  code: string;
  message: string;
  data: object;
}

export type ApiError = ErrorResponse | ErrorResponseType | AxiosError;
