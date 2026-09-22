import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, KeyRound, ShieldCheck, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { CaptchaBox } from '../common/CaptchaBox';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';

export const SignInModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(USER_ROLES.MANAGER);
  const [formData, setFormData] = useState({
    mailId: '',
    phone: '',
    staffId: '',
    verificationCode: '',
    captchaInput: '',
  });
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const { signInWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSendOtp = () => {
    if (activeTab === USER_ROLES.MANAGER && (!formData.mailId || !formData.phone)) {
      setError('Please provide Mail ID and Phone Number to receive OTP.');
      return;
    }
    if (activeTab === USER_ROLES.STAFF && (!formData.staffId || !formData.mailId)) {
      setError('Please provide Staff ID and Mail ID to receive OTP.');
      return;
    }
    setOtpSent(true);
    setFormData((prev) => ({ ...prev, verificationCode: '984012' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify Captcha
    if (!formData.captchaInput || formData.captchaInput.toUpperCase() !== generatedCaptcha) {
      setError('Invalid CAPTCHA code. Please type the characters shown above.');
      return;
    }

    // Verify Verification Code
    if (!formData.verificationCode || formData.verificationCode.length < 4) {
      setError('Please enter a valid verification code.');
      return;
    }

    const res = await signInWithOtp(activeTab, formData);
    if (res && res.success) {
      onClose();
      if (res.user?.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res?.message || 'Invalid credentials or user not found');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="STOCKIFY Two-Factor Sign In">
      {/* Role Switcher */}
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
          MANAGER SIGN IN
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
          INVENTORY STAFF SIGN IN
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {activeTab === USER_ROLES.MANAGER ? (
          <>
            {/* Manager Mail ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mail ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="manager@stockify.io"
                  value={formData.mailId}
                  onChange={(e) => handleInputChange('mailId', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Manager Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98401 23456"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Staff ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Staff ID
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="STF-8820"
                  value={formData.staffId}
                  onChange={(e) => handleInputChange('staffId', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 uppercase focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Staff Mail ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mail ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="staff.member@stockify.io"
                  value={formData.mailId}
                  onChange={(e) => handleInputChange('mailId', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>
          </>
        )}

        {/* Verification Code */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              Verification Code (OTP)
            </label>
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {otpSent ? 'Resend Code' : 'Send Code'}
            </button>
          </div>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={formData.verificationCode}
            onChange={(e) => handleInputChange('verificationCode', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 tracking-widest text-center font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {otpSent && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Code sent! (Use demo code: 984012)
            </p>
          )}
        </div>

        {/* CAPTCHA */}
        <CaptchaBox
          value={formData.captchaInput}
          onChange={(val) => handleInputChange('captchaInput', val)}
          onValidate={(code) => setGeneratedCaptcha(code)}
        />

        {/* VERIFY & CONTINUE Button */}
        <button
          type="submit"
          className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-[0.99] transition-all"
        >
          VERIFY & CONTINUE
        </button>
      </form>
    </Modal>
  );
};
