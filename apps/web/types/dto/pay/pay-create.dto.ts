export interface PayCreateRequestDTO {
  readonly amount: string;
  readonly provider: string;
  readonly lang?: string;
}

export interface PayCreateResponseDTO {
  readonly type: "redirect" | "payment";
  readonly url?: string;
  readonly currency?: string;
  readonly amount?: string;
}
