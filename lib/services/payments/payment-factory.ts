import { MandiriPaymentService } from "./mandiri-payment-service";
import { PaymentProviderInterface } from "./payment-provider-interface";

export class PaymentFactory {
  static getProvider(provider: string): PaymentProviderInterface {
    switch (provider.toUpperCase()) {
      case "MANDIRI":
        return new MandiriPaymentService();
      default:
        throw new Error(`Payment provider ${provider} tidak didukung.`);
    }
  }
}
