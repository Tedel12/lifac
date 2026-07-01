declare module "fedapay" {
  export const FedaPay: {
    setApiKey(key: string): void;
    setEnvironment(env: string): void;
    apiKey?: string;
    environment?: string;
  };

  export class Transaction {
    id: string | number;
    status: string;
    amount: number;
    reference: string;
    merchant_reference?: string;
    approved_at?: string | null;
    declined_at?: string | null;
    mode?: string;

    static create(data: Record<string, unknown>): Promise<Transaction>;
    static retrieve(id: string | number): Promise<Transaction>;
    generateToken(): Promise<{ url: string; token: string; status?: string }>;
  }

  export class Customer {
    id: string | number;
    static create(data: Record<string, unknown>): Promise<Customer>;
    static retrieve(id: string | number): Promise<Customer>;
  }
}
