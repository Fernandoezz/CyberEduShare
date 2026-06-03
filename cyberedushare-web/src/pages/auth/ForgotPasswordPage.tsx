import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/shared/AuthLayout';
import api from '../../api/axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally { setLoading(false); }
  };

  const maskedEmail = email.replace(/(.{1})(.+)(@.{1})(.+)(\..+)/, '$1****$3****$5');

  if (sent) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your Email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We have sent an email with password reset information to <span className="font-medium">{maskedEmail}</span>.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-400 text-center">Didn't receive the email? Check spam or promotion folder or</p>
          <button onClick={handleSend} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm">
            Resend Email
          </button>
          <button onClick={() => navigate('/verify-reset-otp', { state: { email } })} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">
            Enter OTP
          </button>
          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-indigo-600">Back to Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter the email you used to create your account so we can send you instructions on how to reset your password.
      </p>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSend} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400" />
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm">
          {loading ? 'Sending...' : 'Send'}
        </button>
        <Link to="/login">
          <button type="button" className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50">
            Back to Login
          </button>
        </Link>
      </form>
    </AuthLayout>
  );
}