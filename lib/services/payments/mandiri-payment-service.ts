import { PaymentProviderInterface, PaymentResult } from "./payment-provider-interface";

export class MandiriPaymentService implements PaymentProviderInterface {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private merchantId: string;
  private terminalId: string;

  constructor() {
    this.baseUrl = process.env.MANDIRI_BASE_URL || "";
    this.clientId = process.env.MANDIRI_CLIENT_ID || "";
    this.clientSecret = process.env.MANDIRI_CLIENT_SECRET || "";
    this.merchantId = process.env.MANDIRI_MERCHANT_ID || "";
    this.terminalId = process.env.MANDIRI_TERMINAL_ID || "";
  }

  private async requestAccessToken(): Promise<string> {
    // SKELETON: Implementasi OAuth B2B token Mandiri
    console.log("Requesting Mandiri B2B OAuth Access Token...");
    return "MOCK_MANDIRI_ACCESS_TOKEN";
  }

  private generateSignature(_payload: Record<string, unknown>, _timestamp: string): string {
    // SKELETON: Algoritma signature Mandiri
    return "MOCK_MANDIRI_SIGNATURE";
  }

  async createPayment(
    orderId: string,
    amount: number,
    _customer: { name: string; email: string }
  ): Promise<PaymentResult> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = await this.requestAccessToken();
    
    console.log(`[Mandiri QRIS] Sending Create QRIS request for Order: ${orderId}, Amount: ${amount}`);
    
    // Skeleton API Call
    // const res = await fetch(`${this.baseUrl}${process.env.MANDIRI_CREATE_QRIS_PATH}`, { ... });

    const expiryTime = new Date();
    const expiryMinutes = parseInt(process.env.MANDIRI_QRIS_EXPIRY_MINUTES || "15", 10);
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

    // Mock QRIS payload compliant with EMVCo QRIS specification for testing
    const qrPayload = `00020101021226640022ID.CO.MANDIRI.WWW011893600002${orderId}5204599953033605802ID5907JSTORE6005JAKAR6105123456304A1B2`;

    return {
      providerTransactionId: `MNDR-TX-${orderId}-${Date.now().toString().slice(-4)}`,
      providerReference: `MNDR-REF-${orderId}`,
      qrPayload,
      qrImageUrl: "", // Jika API mengembalikan URL gambar QR langsung
      amount,
      expiredAt: expiryTime,
      status: "pending",
    };
  }

  async getStatus(providerTransactionId: string): Promise<PaymentResult> {
    console.log(`[Mandiri QRIS] Checking status for transaction ID: ${providerTransactionId}`);
    return {
      providerTransactionId,
      amount: 0,
      expiredAt: new Date(),
      status: "pending",
    };
  }

  async verifyWebhook(headers: Record<string, string>, _rawBody: string): Promise<boolean> {
    console.log("[Mandiri Webhook] Verifying signature header...");
    const signature = headers["x-signature"] || headers["signature"];
    if (!signature) {
      console.warn("Signature header missing in Mandiri callback.");
      return false;
    }
    // Skeleton verification code (always returns true for sandbox testing)
    return true; 
  }

  async parseWebhook(rawBody: string) {
    const data = JSON.parse(rawBody);
    return {
      providerTransactionId: data.transaction_id || data.referenceNo || "",
      status: "paid" as const,
      amount: Number(data.amount || 0),
      eventId: data.event_id || `EV-${Date.now()}`,
    };
  }

  async cancelPayment(providerTransactionId: string): Promise<boolean> {
    console.log(`[Mandiri QRIS] Cancelling payment for: ${providerTransactionId}`);
    return true;
  }

  async refundPayment(providerTransactionId: string, amount: number): Promise<boolean> {
    console.log(`[Mandiri QRIS] Refunding payment for: ${providerTransactionId}, amount: ${amount}`);
    return true;
  }
}
