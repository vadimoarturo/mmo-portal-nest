import { ApiError } from "@/types/errors";

type ErrorShape = {
  code?: string;
  statusCode?: number;
  response?: ErrorShape;
  data?: ErrorShape;
};
export const returnCodeError = (error: ApiError): string | undefined => {
  const value = error as ErrorShape | undefined;
  const candidates = [
    value?.response?.data,
    value?.response?.data?.response,
    value?.response,
    value,
  ];
  for (const candidate of candidates) {
    if (candidate?.code) return candidate.code;
  }
  for (const candidate of candidates) {
    if (typeof candidate?.statusCode === "number")
      return String(candidate.statusCode);
  }
  return undefined;
};
