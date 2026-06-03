import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/shared/AuthLayout';
import api from '../../api/axios';

export default function VerifyResetOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter Reset OTP</h1>
      <p className="text-sm text-gray-500 mb-8">Enter the OTP sent to your email to reset your password.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" maxLength={4} required
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-300" />
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </AuthLayout>
  );
}