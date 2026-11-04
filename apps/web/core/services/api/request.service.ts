import axios, { AxiosRequestConfig } from "axios";

export interface IDataRequest<T> {
  readonly path: string;
  readonly method: "GET" | "POST";
  readonly data?: T;
  readonly params?: string;
  readonly config?: AxiosRequestConfig;
}

export async function requestService<Request, Response>({
  path,
  method,
  config,
  data,
  params,
}: IDataRequest<Request>): Promise<Response> {
  let apiUrl: string;
  apiUrl = new URL(
    "/api" + path,
    process.env.NEXT_PUBLIC_API_URL as string,
  ).toString();
  if (params) apiUrl = apiUrl + params;

  const axiosRequestConfig: AxiosRequestConfig = {
    ...config,
    url: apiUrl,
    method: method,
    data: data,
    withCredentials: true,
  };
  const res = await axios.request(axiosRequestConfig);
  return res.data;
}
