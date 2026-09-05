// Minimal ambient types for the Paystack Inline v2 SDK, loaded globally via the
// <script src="https://js.paystack.co/v2/inline.js"> tag in index.html (see
// https://paystack.com/docs/payments/accept-payments/#popup). Not an npm
// package, so there's no @types/* package to install — this is the real shape
// of the two things we actually call.
interface PaystackTransactionResult {
  reference: string;
  status?: string;
  trans?: string;
  message?: string;
}

interface PaystackTransactionOptions {
  key: string;
  email: string;
  amount: number;
  ref: string;
  onSuccess?: (transaction: PaystackTransactionResult) => void;
  onCancel?: () => void;
}

interface PaystackPopInstance {
  newTransaction(options: PaystackTransactionOptions): void;
}

interface PaystackPopConstructor {
  new (): PaystackPopInstance;
}

interface Window {
  PaystackPop: PaystackPopConstructor;
}
