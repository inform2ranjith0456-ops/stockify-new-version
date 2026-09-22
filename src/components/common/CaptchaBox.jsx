import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const CaptchaBox = ({ onValidate, value, onChange }) => {
  const [captchaCode, setCaptchaCode] = useState('');

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    if (onValidate) onValidate(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const isValid = value && value.toUpperCase() === captchaCode;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-300">
        Security Verification (CAPTCHA)
      </label>
      <div className="flex items-center gap-3">
        {/* Captcha Display Badge */}
        <div className="relative select-none overflow-hidden rounded-lg border border-cyan-500/40 bg-navy-950 px-4 py-2 font-mono text-lg font-extrabold tracking-widest text-cyan-300 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
          <span className="relative z-10 inline-block rotate-[-2deg] scale-105">
            {captchaCode}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateCaptcha}
          title="Generate new CAPTCHA"
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Type code above"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 uppercase tracking-wider focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
          {value && (
            <div className="absolute right-3 top-2.5">
              {isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          )}
        </div>
      </div>
      {value && !isValid && (
        <p className="text-[11px] text-rose-400">CAPTCHA does not match. Please verify.</p>
      )}
    </div>
  );
};
