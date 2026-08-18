import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import AnimatedContent from '../components/AnimatedContent';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#10B982]/10 rounded-xl flex items-center justify-center">
              <FiShield className="text-[#10B982]" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: July 21, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-8">
            Movec Store ("we", "us", "our") provides Starlink internet equipment, CCTV and surveillance systems, networking equipment, smart devices, and related installation services in Kenya through our website and platform (the "Service"). This Privacy Policy explains what personal information we collect, how we use it, and the choices you have. By using the Service, you agree to the collection and use of information as described here.
          </p>

          <div className="space-y-8">
            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">We collect the following categories of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account information:</strong> first name, last name, email address, phone number, password (stored as a secure hash), and optional profile photo.</li>
                <li><strong>Address information:</strong> shipping and billing addresses used for delivery and installation scheduling.</li>
                <li><strong>Order information:</strong> products purchased, order history, quantities, prices, coupon usage, and reviews you submit.</li>
                <li><strong>Payment information:</strong> when you pay via M-Pesa, Paystack, PayPal, or bank transfer, payment is processed directly by that provider. We store limited transaction metadata (amount, status, reference number) but we do not store your full card number, M-Pesa PIN, or bank credentials.</li>
                <li><strong>Installation information:</strong> preferred dates, installation address, and notes you provide when booking a Starlink or CCTV installation.</li>
                <li><strong>Support information:</strong> messages, attachments, and details you share when you raise a support ticket or contact us.</li>
                <li><strong>Technical information:</strong> IP address, browser type, device information, and usage data collected automatically via cookies and similar technologies.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.2}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To create and manage your account, and verify your identity via email.</li>
                <li>To process orders, payments, shipping, and installation bookings.</li>
                <li>To send order confirmations, shipping updates, and installation status updates by email and, where applicable, SMS.</li>
                <li>To respond to support tickets and customer service requests.</li>
                <li>To assign and coordinate technicians for installation services.</li>
                <li>To detect and prevent fraud, abuse, and security incidents, and to enforce our Terms of Service.</li>
                <li>To comply with legal, tax, and regulatory obligations.</li>
                <li>To improve our products, website, and customer experience.</li>
                <li>With your consent, to send promotional offers, which you may opt out of at any time.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal information. We share information only with:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Payment processors:</strong> Safaricom M-Pesa (Daraja API), Paystack, and PayPal, solely to process your payment.</li>
                <li><strong>Cloudinary:</strong> to store and deliver product images and other media.</li>
                <li><strong>Delivery and logistics partners:</strong> to fulfil and track shipments.</li>
                <li><strong>Installation technicians:</strong> your installation address, contact details, and job notes, solely to carry out a booked installation.</li>
                <li><strong>Email and SMS providers:</strong> to deliver transactional notifications.</li>
                <li><strong>Authorities:</strong> where required by Kenyan law, regulation, or a valid legal process.</li>
              </ul>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">4. Cookies</h2>
              <p className="text-gray-700">
                We use cookies and similar technologies to keep you logged in, remember items in your cart, and keep the Service secure. See our{' '}
                <Link to="/cookies" className="text-[#10B982] hover:underline font-medium">Cookie Policy</Link>{' '}
                for full details and how to manage your preferences.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700">
                We retain personal information for as long as your account is active or as needed to provide the Service, comply with our legal and tax obligations, resolve disputes, and enforce our agreements. Order records are generally retained for at least the period required under applicable Kenyan tax and consumer protection law.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700">
                We apply industry-standard safeguards, including encrypted password storage, HTTPS encryption in transit, access controls, and rate limiting, to protect your information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">Subject to applicable law, including the Kenya Data Protection Act, 2019, you may:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access, review, and update your personal information from your account profile.</li>
                <li>Request a copy of the personal information we hold about you.</li>
                <li>Request correction or deletion of your personal information, subject to legal retention requirements.</li>
                <li>Withdraw consent to marketing communications at any time.</li>
                <li>Lodge a complaint with the Office of the Data Protection Commissioner, Kenya.</li>
              </ul>
              <p className="text-gray-700 mt-4">To exercise any of these rights, contact us using the details in Section 10.</p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                The Service is not directed at children under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.
              </p>
            </section>
            </AnimatedContent>

            <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1}>
            <section>
              <h2 className="text-2xl font-section-title text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">If you have questions about this Privacy Policy or how we handle your data, contact us:</p>
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
