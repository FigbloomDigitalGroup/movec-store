const STEPS = [
  { label: 'Shipping', description: 'Enter delivery address' },
  { label: 'Payment', description: 'Select payment method' },
  { label: 'Confirmation', description: 'Review and complete' },
];

export default function CheckoutSteps({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full px-4 py-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber === currentStep;
            const isDone = stepNumber < currentStep;
            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                      isActive || isDone ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`font-medium ${isActive || isDone ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {stepNumber < STEPS.length && <div className="flex-1 h-px bg-gray-200 mx-4" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
