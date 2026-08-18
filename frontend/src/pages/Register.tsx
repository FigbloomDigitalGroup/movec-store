import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../lib/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const loginLink = redirect !== '/' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      await register(payload);
      setSuccess('Registration successful!');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/10">
          <div className="text-6xl mb-6 animate-bounce">✉️</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Verify Your Email</h1>
          <p className="text-gray-600 mb-6">
            We have sent a verification link to <strong className="text-[#10B982] font-semibold">{form.email}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Please check your inbox and click the link to activate your account.
          </p>
          <Link
            to={loginLink}
            className="inline-block w-full bg-[#10B982] text-white py-3 rounded-lg hover:bg-[#0d9b6f] transition font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="w-full border rounded-lg px-4 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border rounded-lg pl-4 pr-10 py-2"
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

          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <div className="relative mt-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full border rounded-lg pl-4 pr-10 py-2"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#10B982] text-white py-2 rounded-lg hover:bg-[#0d9b6f] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Already have an account? <Link to={loginLink} className="text-[#10B982]">Login</Link>
      </p>
    </div>
  );
}