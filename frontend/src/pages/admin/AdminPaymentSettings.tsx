import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiCreditCard, FiTruck, FiSave } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';

interface PaymentSettings {
  codEnabled: boolean;
  codDepositThreshold: number;
  codDepositPercentage: number;
}

function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const queryClient = useQueryClient();
  const [codEnabled, setCodEnabled] = useState(initial.codEnabled);
  const [threshold, setThreshold] = useState(String(initial.codDepositThreshold));
  const [percentage, setPercentage] = useState(String(initial.codDepositPercentage));

  const save = useMutation({
    mutationFn: () =>
      api.put('/admin/payments/settings', {
        codEnabled,
        codDepositThreshold: Number(threshold) || 0,
        codDepositPercentage: Number(percentage) || 0,
      }),
    onSuccess: (res) => {
      queryClient.setQueryData(['admin-payment-settings'], res.data);
      toast.success('Payment settings saved');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const previewThreshold = Number(threshold) || 0;
  const previewPercentage = Number(percentage) || 0;
  const exampleTotal = Math.max(previewThreshold * 1.5, previewThreshold + 1000);
  const exampleDeposit = previewThreshold > 0 && previewPercentage > 0
    ? Math.round(exampleTotal * (previewPercentage / 100))
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <FiTruck className="text-primary-500" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Cash on Delivery</h2>
              <p className="text-xs text-gray-500">Let customers pay when their order arrives</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCodEnabled((v) => !v)}
            aria-pressed={codEnabled}
            aria-label="Toggle cash on delivery"
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
              codEnabled ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                codEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className={`space-y-4 ${codEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
          <Input
            label="Deposit threshold (KES)"
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            helperText="Orders above this total require a deposit before delivery. Set to 0 to never require one."
          />
          <Input
            label="Deposit percentage (%)"
            type="number"
            min={0}
            max={100}
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            helperText="Share of the order total collected upfront when the threshold is exceeded."
          />
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition"
        >
          <FiSave size={15} />
          {save.isPending ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3">How this works</h3>
        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
          <li>If cash on delivery is disabled, customers won't see it as a payment option at checkout.</li>
          <li>When enabled with no threshold set (0), customers can pay the full order in cash on delivery.</li>
          <li>
            Once an order total passes the threshold, the customer must pay the deposit percentage online
            first — the remaining balance is collected in cash at delivery.
          </li>
        </ul>

        {codEnabled && previewThreshold > 0 && previewPercentage > 0 && (
          <div className="mt-5 bg-white rounded-xl p-4 border border-gray-200 text-sm">
            <p className="font-semibold text-gray-900 mb-2">Example</p>
            <p className="text-gray-600">
              An order totalling KES {exampleTotal.toLocaleString()} (above your KES {previewThreshold.toLocaleString()} threshold)
              would require a deposit of <span className="font-semibold text-gray-900">KES {exampleDeposit.toLocaleString()}</span>,
              with KES {(exampleTotal - exampleDeposit).toLocaleString()} due on delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPaymentSettings() {
  const { data, isLoading } = useQuery<PaymentSettings>({
    queryKey: ['admin-payment-settings'],
    queryFn: () => api.get('/admin/payments/settings').then((r) => r.data),
  });

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        icon={FiCreditCard}
        title="Payment Settings"
        subtitle="Control cash-on-delivery availability and the deposit required for larger orders."
      />

      {isLoading || !data ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-64" />
      ) : (
        <PaymentSettingsForm initial={data} />
      )}
    </div>
  );
}
