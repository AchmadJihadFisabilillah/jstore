export interface PaymentResult {
  providerTransactionId: string;
  providerReference?: string;
  qrPayload?: string;
  qrImageUrl?: string;
  amount: number;
  expiredAt: Date;
  status: string;
}

export interface PaymentProviderInterface {
  createPayment(
    orderId: string,
    amount: number,
    customer: { name: string; email: string }
  ): Promise<PaymentResult>;
  getStatus(providerTransactionId: string): Promise<PaymentResult>;
  verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<boolean>;
  parseWebhook(rawBody: string): Promise<{
    providerTransactionId: string;
    status: "paid" | "failed" | "expired" | "cancelled";
    amount: number;
    eventId?: string;
  }>;
  cancelPayment?(providerTransactionId: string): Promise<boolean>;
  refundPayment?(providerTransactionId: string, amount: number): Promise<boolean>;
}
