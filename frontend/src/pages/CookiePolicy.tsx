import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { useCookieConsentStore } from '../store/cookieConsentStore';

export default function CookiePolicy() {
  const openSettings = useCookieConsentStore((s) => s.openSettings);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <FiShield className="text-primary-500" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: August 17, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-8">
            This Cookie Policy explains what cookies are, which ones Movec Store ("we", "us", "our") uses, and how you can manage your preferences. It should be read alongside our{' '}
            <Link to="/privacy" className="text-primary-500 hover:underline font-medium">Privacy Policy</Link>.
          </p>

          <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">1. What Are Cookies</h2>
                <p className="text-gray-700">
                  Cookies are small text files stored on your device when you visit a website. We also use similar technologies, such as browser local storage, for the same purposes described below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">2. Necessary Cookies</h2>
                <p className="text-gray-700 mb-4">
                  These are required for the Service to function and cannot be switched off. They include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Authentication cookies:</strong> keep you signed in to your account securely.</li>
                  <li><strong>Security cookies:</strong> help us detect and block cross-site request forgery attempts.</li>
                  <li><strong>Cart cookies/local storage:</strong> remember items in your cart between visits.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">3. Analytics Cookies</h2>
                <p className="text-gray-700">
                  We do not currently use analytics or advertising cookies. If we introduce them in the future, they will only be activated if you opt in, and this policy will be updated accordingly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">4. Third-Party Cookies</h2>
                <p className="text-gray-700">
                  Our payment providers (M-Pesa, Paystack, PayPal) may set their own cookies while you complete a payment, governed by their own privacy and cookie policies. We do not control these cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">5. Managing Your Preferences</h2>
                <p className="text-gray-700 mb-4">
                  You can review and change your cookie preferences at any time, or disable cookies entirely in your browser settings — though some features, such as checkout, may not work correctly without necessary cookies.
                </p>
                <Button variant="outline" onClick={openSettings}>Manage Cookie Preferences</Button>
              </section>

              <section>
                <h2 className="text-2xl font-section-title text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-700 mb-4">If you have questions about this Cookie Policy, contact us:</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
