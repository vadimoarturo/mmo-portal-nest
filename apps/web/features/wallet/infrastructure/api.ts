import { requestService } from "@/core/services/api/request.service";

export const walletApi = {
async getBalance(): Promise<string> {
    return await requestService<null, string>({
      path: "/user/balance",
      method: "GET",
    });
  },
};
