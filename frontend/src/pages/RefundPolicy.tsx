import { FiMapPin, FiPhone, FiMail, FiRefreshCw } from 'react-icons/fi';
import AnimatedContent from '../components/AnimatedContent';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiRefreshCw className="text-blue-600" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: July 21, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-8">
            This Refund Policy explains how order cancellations, returns, and refunds work for purchases made through Movec Store, covering products (Starlink kits, CCTV equipment, networking gear, accessories) and installation services. It forms part of our Terms of Service.
          </p>

          <div className="space-y-8">
            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">1. Order Cancellations</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may cancel an order yourself from your account while it is still in PENDING status (before it has been confirmed and processed).</li>
                <li>If a PENDING order was already paid for, cancelling it triggers an automatic refund to your original payment method.</li>
                <li>Once an order moves to PROCESSING or SHIPPED, it can no longer be cancelled directly — please contact support and we will assist where possible.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">2. Returns & Refund Eligibility</h2>
              <p className="text-gray-700 mb-4">You may request a return and refund within 7 days of delivery if:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The item received is defective, damaged, or faulty on arrival.</li>
                <li>The item received is materially different from what you ordered (wrong product, wrong specification).</li>
                <li>The item is unused, in its original packaging, with all accessories, manuals, and documentation included.</li>
              </ul>
              <p className="text-gray-700 mt-4">To be eligible, please contact us with your order number, photos of the item, and a description of the issue before sending anything back.</p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">3. Non-Returnable Items</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Products that have been installed, activated, or have a broken security seal, unless found defective.</li>
                <li>Custom, made-to-order, or clearance/final-sale items, as indicated on the product page.</li>
                <li>Items damaged due to misuse, unauthorized modification, or improper installation not performed by our technicians.</li>
                <li>Change-of-mind requests made after the 7-day window.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">4. Return Process</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Contact us via the details below with your order number and reason for return.</li>
                <li>We will review your request and, if approved, provide return instructions and, where applicable, arrange pickup.</li>
                <li>Once the returned item is received and inspected, we will notify you of the approval or rejection of your refund.</li>
                <li>Approved refunds are processed within 7–14 business days.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">5. Refund Method</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>M-Pesa:</strong> refunded to the originating M-Pesa number.</li>
                <li><strong>Stripe (card payments):</strong> refunded to the original card, typically reflecting within 5–10 business days depending on your bank.</li>
                <li><strong>PayPal:</strong> refunded to your PayPal account.</li>
                <li><strong>Bank transfer:</strong> refunded via bank transfer to the account the payment originated from.</li>
              </ul>
              <p className="text-gray-700 mt-4">Shipping fees are non-refundable unless the return is due to our error (wrong or defective item).</p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">6. Installation Service Refunds</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>If you cancel an installation request before it is scheduled, any amount paid upfront is fully refundable.</li>
                <li>If you cancel a confirmed/scheduled appointment with less than 24 hours' notice, a call-out fee may be deducted from your refund to cover technician dispatch costs.</li>
                <li>If a technician cannot complete the installation due to a fault on our side, you are entitled to a full refund of the installation fee or a free rescheduled visit, at your choice.</li>
                <li>If installation is completed and you are unsatisfied with the work due to a service defect, contact us within 7 days so we can arrange a fix or partial refund.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">7. Damaged or Incorrect Items on Delivery</h2>
              <p className="text-gray-700">
                Please inspect your order upon delivery. If an item arrives damaged or incorrect, notify us within 48 hours with photos of the item and packaging so we can arrange a free replacement or full refund, including any shipping costs.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">8. Late or Missing Refunds</h2>
              <p className="text-gray-700">
                If you haven't received a refund within the timeframe above, please first check with your bank or payment provider, as processing times vary. If it still hasn't appeared, contact us and we will investigate.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 mb-4">To request a cancellation, return, or refund, reach out to us:</p>
              <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-gray-400 flex-shrink-0" size={18} />
                  <span className="text-gray-700">Nairobi, Kenya</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-400 flex-shrink-0" size={18} />
                  <span className="text-gray-700">+254 796285718</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400 flex-shrink-0" size={18} />
                  <span className="text-gray-700">sales@movec.com</span>
                </div>
              </div>
            </section>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </div>
  );
}
