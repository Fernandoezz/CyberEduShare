import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/shared/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getRoleHomePath } from '../../utils/auth';
import api from '../../api/axios';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      login(res.data.token, res.data.user);
      navigate(getRoleHomePath(res.data.user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
  };

  const maskedEmail = email.replace(/(.{1})(.+)(@.{1})(.+)(\..+)/, '$1****$3****$5');

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your Email</h1>
      <p className="text-sm text-gray-500 mb-8">
        We have sent a verification email to <span className="font-medium">{maskedEmail}</span>.
      </p>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      {resent && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">OTP resent successfully!</div>}
      <form onSubmit={handleVerify} className="space-y-4">
        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" maxLength={4} required
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-300" />
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Didn't receive the email? Check spam or promotion folder or{' '}
        <button onClick={handleResend} className="text-indigo-600 hover:underline font-medium">Resend Email</button>
      </p>
    </AuthLayout>
  );
}