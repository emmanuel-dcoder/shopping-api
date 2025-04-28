export interface IPaymentProvider {
  initiatePayment(payload: { amount: number; email: string }): Promise<any>;

  verifyCardPayment(payload: Record<string, string>): Promise<any>;

  verifyProviderPayment(reference: string): Promise<any>;
}
