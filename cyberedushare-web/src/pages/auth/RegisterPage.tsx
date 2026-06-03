import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/shared/AuthLayout';
import api from '../../api/axios';

const ROLES = [
  { value: 'student',   label: 'Student' },
  { value: 'faculty',   label: 'Faculty' },
  { value: 'moderator', label: 'Moderator' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please agree to the Terms of Service.'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
      <p className="text-sm text-gray-500 mb-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline font-medium">Login</Link>
      </p>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="Username" required
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400" />
        <div className="relative">
          <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Password" required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400 pr-12" />
          <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
            </svg>
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">I am a</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${form.role === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-gray-500">I agree to CyberEduShare <span className="text-indigo-600">Terms of service</span> and <span className="text-indigo-600">Privacy policy</span></span>
        </label>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}