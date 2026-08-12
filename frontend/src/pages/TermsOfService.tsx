import { FiMapPin, FiPhone, FiMail, FiFileText } from 'react-icons/fi';
import AnimatedContent from '../components/AnimatedContent';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#10B982]/10 rounded-xl flex items-center justify-center">
              <FiFileText className="text-[#10B982]" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">Last updated: July 21, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-8">
            These Terms of Service ("Terms") govern your access to and use of the Movec Store website, products, and services (the "Service"), operated in Nairobi, Kenya. By creating an account, placing an order, or otherwise using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          <div className="space-y-8">
            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">1. Eligibility & Accounts</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account and place orders.</li>
                <li>You must provide accurate, current information when registering and keep it up to date.</li>
                <li>You are responsible for maintaining the confidentiality of your password and for all activity under your account.</li>
                <li>We may suspend or terminate accounts that provide false information, violate these Terms, or engage in fraudulent or abusive activity.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">2. Products & Pricing</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We sell Starlink satellite internet equipment, CCTV and surveillance systems, related accessories, and installation services.</li>
                <li>Product descriptions, images, and specifications are provided for guidance; we make reasonable efforts to keep them accurate but do not warrant they are error-free.</li>
                <li>Prices are listed in the currency shown at checkout and may change at any time without notice, but changes will not affect orders already confirmed.</li>
                <li>Product availability is subject to stock. If an item becomes unavailable after you order it, we will notify you and offer a substitute, backorder, or refund.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">3. Orders & Payment</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Placing an order is an offer to purchase, which we may accept or decline at our discretion (for example, in cases of suspected fraud or pricing errors).</li>
                <li>We accept payment via M-Pesa, Paystack (card payments), PayPal, and bank transfer.</li>
                <li>For bank transfer orders, your order is marked "awaiting payment" until we confirm receipt of funds.</li>
                <li>You are responsible for ensuring payment details you provide are accurate and that you are authorized to use the selected payment method.</li>
                <li>An order is confirmed once payment is successfully verified and you receive a confirmation email with your order number.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">4. Shipping & Delivery</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Estimated delivery times shown at checkout are estimates, not guarantees, and may be affected by location, courier delays, or stock availability.</li>
                <li>Risk of loss and title to products pass to you upon delivery to the address provided at checkout.</li>
                <li>You are responsible for providing an accurate delivery address and being reasonably available to receive the shipment.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">5. Installation Services</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Installation bookings are subject to technician availability and internal review before being scheduled.</li>
                <li>You must provide safe, reasonable access to the installation site and accurate site details.</li>
                <li>If additional work is required beyond the original scope (e.g. extra cabling, structural modifications), the final price may be adjusted with your agreement before work proceeds.</li>
                <li>Rescheduling or cancelling a confirmed installation appointment should be done as early as possible; late cancellations may be subject to a call-out fee.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">6. Cancellations & Refunds</h2>
              <p className="text-gray-700">
                Order cancellations, returns, and refunds are governed by our Refund Policy, which forms part of these Terms.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">7. Product Warranty</h2>
              <p className="text-gray-700">
                Hardware sold through the Service may carry a manufacturer or supplier warranty against defects, as indicated on the product page or invoice. Warranty claims are handled in accordance with the applicable manufacturer's terms. Warranties do not cover damage caused by misuse, unauthorized modification, improper installation not performed by us, power surges, or normal wear and tear.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">8. Reviews & User Content</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may submit reviews and ratings for products you have purchased. Reviews must be honest, relevant, and free of abusive, defamatory, or unlawful content.</li>
                <li>We may moderate, edit for formatting, or remove reviews that violate these Terms.</li>
                <li>By submitting a review, you grant us a non-exclusive, royalty-free license to display it on the Service.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">9. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
                <li>Attempt to gain unauthorized access to our systems, other users' accounts, or data.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Use automated means (bots, scrapers) to access the Service without our written permission.</li>
                <li>Resell products purchased through the Service without our authorization, where resale restrictions apply.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on the Service, including text, graphics, logos, and software, is owned by or licensed to Movec Store and is protected by applicable intellectual property laws. You may not copy, reproduce, or distribute our content without prior written consent, except as necessary to use the Service for its intended purpose.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the fullest extent permitted by Kenyan law, Movec Store shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service or products purchased through it. Our total liability for any claim relating to an order shall not exceed the amount you paid for the relevant order.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">12. Third-Party Services</h2>
              <p className="text-gray-700">
                The Service integrates third-party providers, including Safaricom M-Pesa, Paystack, PayPal, and delivery partners. We are not responsible for the acts, omissions, or service interruptions of these third parties, which are governed by their own terms.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700">
                We may suspend or terminate your access to the Service at any time if you breach these Terms. You may close your account at any time by contacting us. Provisions that by their nature should survive termination (such as payment obligations and limitation of liability) will continue to apply.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the Republic of Kenya. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Kenya.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">15. Changes to These Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. Material changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">16. Contact Us</h2>
              <p className="text-gray-700 mb-4">Questions about these Terms can be directed to:</p>
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
