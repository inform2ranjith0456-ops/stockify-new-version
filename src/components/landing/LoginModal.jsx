import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, UserCheck, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const LoginModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(USER_ROLES.MANAGER);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await login(activeTab, formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
      if (res.user?.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="STOCKIFY Portal Login">
      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => {
            setActiveTab(USER_ROLES.MANAGER);
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            activeTab === USER_ROLES.MANAGER
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          MANAGER LOGIN
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab(USER_ROLES.STAFF);
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            activeTab === USER_ROLES.STAFF
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          INVENTORY STAFF LOGIN
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Username / Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder={activeTab === USER_ROLES.MANAGER ? 'manager or manager@stockify.io' : 'staff.vellore'}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* LOGIN Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>LOGIN</span>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;