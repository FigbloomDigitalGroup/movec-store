import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import Button from './ui/Button';
import { useCookieConsentStore } from '../store/cookieConsentStore';

export default function CookieConsentBanner() {
  const { showBanner, analytics, acceptAll, rejectNonEssential, savePreferences, closeSettings } =
    useCookieConsentStore();
  const [managing, setManaging] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(analytics);

  if (!showBanner) return null;

  const handleClose = () => {
    setManaging(false);
    closeSettings();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-[#E3E8E5] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {!managing ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 shrink-0 bg-[#10B982]/10 rounded-full flex items-center justify-center">
                  <FiShield className="text-[#10B982]" size={18} />
                </div>
                <p className="text-sm text-gray-700">
                  We use cookies to keep you signed in, remember your cart, and keep the store secure. See our{' '}
                  <Link to="/cookies" className="text-[#10B982] hover:underline font-medium">
                    Cookie Policy
                  </Link>{' '}
                  for details.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setManaging(true)}>
                  Manage
                </Button>
                <Button variant="outline" size="sm" onClick={rejectNonEssential}>
                  Reject Non-Essential
                </Button>
                <Button variant="primary" size="sm" onClick={acceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 bg-[#10B982]/10 rounded-full flex items-center justify-center">
                  <FiShield className="text-[#10B982]" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Cookie Preferences</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose which cookies we can use. Read more in our{' '}
                    <Link to="/cookies" className="text-[#10B982] hover:underline font-medium">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-12">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Necessary</p>
                    <p className="text-xs text-gray-500">Required for login, cart, and checkout to work. Always on.</p>
                  </div>
                  <div className="text-xs font-medium text-gray-400">Always on</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">Helps us understand how the store is used. Reserved for future use.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsChoice}
                    onClick={() => setAnalyticsChoice((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      analyticsChoice ? 'bg-[#10B982]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        analyticsChoice ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => savePreferences(analyticsChoice)}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
