import { PayProviders } from "@/types/enum/pay-providers.enum";

interface PayBonusDTO {
  readonly amount: string;
  readonly percent: string;
}

export interface PayListDTO {
  readonly provider: PayProviders;
  readonly min: string;
  readonly rate: string;
  readonly icon: string;
  readonly bonus: PayBonusDTO[];
}
