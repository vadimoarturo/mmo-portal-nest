import { requestService } from "@/core/services/api/request.service";
import { PayListDTO } from "@/features/payments/contracts/pay-list.dto";
import { PayCreateRequestDTO, PayCreateResponseDTO } from "@/features/payments/contracts/pay-create.dto";

export const paymentsApi = {
async payCreate(data: PayCreateRequestDTO): Promise<PayCreateResponseDTO> {
    return await requestService<PayCreateRequestDTO, PayCreateResponseDTO>({
      path: "/pay/create",
      method: "POST",
      data: data,
    });
  },

async getPaymentMethods(): Promise<PayListDTO[]> {
    return await requestService<null, PayListDTO[]>({
      path: "/pay/list",
      method: "GET",
    });
  },
};
