import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/shared/AuthLayout';
import api from '../../api/axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-6">Password reset successfully</h1>
          <button onClick={() => navigate('/login')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm">
            Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-8">Choose a new password for your account</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your new password" required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400 pr-12" />
          <button type="button" onClick={() => setShowPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
        </div>
        <div className="relative">
          <input type={showCf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your new password" required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400 pr-12" />
          <button type="button" onClick={() => setShowCf(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-sm">
          {loading ? 'Resetting...' : 'Reset Password'}
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