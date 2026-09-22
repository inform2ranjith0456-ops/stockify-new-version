import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, User, Mail, Lock, Eye, EyeOff, Building, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import { USER_ROLES } from '../../utils/constants';

export const RegisterModal = ({ isOpen, onClose }) => {
  const [accountType, setAccountType] = useState(USER_ROLES.MANAGER);
  const [showPassword, setShowPassword] = useState(false);
  const [availableStores, setAvailableStores] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    storeId: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch stores when registering staff so they can be assigned
  useEffect(() => {
    if (isOpen) {
      inventoryService.getStores().then((stores) => {
        setAvailableStores(stores || []);
        if (stores && stores.length > 0 && !formData.storeId) {
          setFormData((prev) => ({ ...prev, storeId: stores[0].id }));
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in username, email, and password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (accountType === USER_ROLES.STAFF && !formData.storeId) {
      setError('Please select an assigned store for this staff member.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await register(accountType, {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: accountType,
      storeId: accountType === USER_ROLES.STAFF ? formData.storeId : null,
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
      if (res.user?.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Stockify Account" maxWidth="max-w-lg">
      {/* Account Type Selector */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => {
            setAccountType(USER_ROLES.MANAGER);
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            accountType === USER_ROLES.MANAGER
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          MANAGER ACCOUNT
        </button>

        <button
          type="button"
          onClick={() => {
            setAccountType(USER_ROLES.STAFF);
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            accountType === USER_ROLES.STAFF
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          INVENTORY STAFF ACCOUNT
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username (Requirement 5: Username instead of Full Name) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. arun.kumar"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="e.g. arun@stockify.io"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* If Staff: Store Association (Requirement 19 & 20) */}
        {accountType === USER_ROLES.STAFF && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assigned Store / Facility
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <select
                required
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
              >
                {availableStores.map((s) => (
                  <option key={s.id} value={s.id} className="bg-navy-900 text-white">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Staff members are store-specific and can only view and submit data for their assigned facility.
            </p>
          </div>
        )}

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
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

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account in Database...</span>
              </>
            ) : (
              <span>CREATE ACCOUNT</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterModal;
