import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage, resendVerification } from '../lib/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email before resending verification.');
      return;
    }
    setResendLoading(true);
    try {
      await resendVerification(email);
      setError('A new verification email has been sent. Please check your inbox and spam folder.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((c) => Math.max(c - 1, 0)), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl md:text-4xl font-section-title text-center mb-8">Login</h1>
        {error && (
          <Alert variant="danger" className="mb-4">
            <p>{error}</p>
            {error.includes('Please verify your email') && (
              <div className="mt-2 text-sm">
                <p className="inline">Didn't receive the email? </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-primary-500 underline hover:text-primary-600 disabled:opacity-50"
                >
                  {resendLoading ? 'Resending...' : 'Resend Verification Email'}
                </button>
                {resendCooldown > 0 && (
                  <span className="ml-2 text-gray-500">(available in {resendCooldown}s)</span>
                )}
              </div>
            )}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password<span className="text-red-500" aria-hidden="true"> *</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link
            to={redirect !== '/' ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
            className="text-primary-500"
          >
            Register
          </Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link to="/forgot-password" className="text-primary-500">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}

