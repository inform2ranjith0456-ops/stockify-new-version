import React, { useState } from 'react';
import {
  Boxes,
  LogIn,
  UserPlus,
  Warehouse,
  MapPin,
  Phone,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { WarehouseHeroGraphic } from '../components/landing/WarehouseHeroGraphic';
import { LoginModal } from '../components/landing/LoginModal';
import { RegisterModal } from '../components/landing/RegisterModal';
import { COMPANY_INFO } from '../utils/constants';

export const LoginLandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white bg-warehouse-grid">

      {/* ======================================================
          TOP NAVIGATION BAR
      ====================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-navy-900/80 backdrop-blur-xl px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo & System Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan">
              <Boxes className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-wider text-white">
                  STOCKIFY
                </span>

                <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  ENTERPRISE
                </span>
              </div>

              <p className="text-xs text-slate-400 hidden md:block">
                Smart Inventory Management System
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* LOGIN */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:border-cyan-500 hover:text-white hover:bg-slate-700/80 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>LOGIN</span>
            </button>

            {/* CREATE NEW ACCOUNT */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>CREATE NEW ACCOUNT</span>
            </button>

          </div>
        </div>
      </header>


      {/* ======================================================
          MAIN HERO SECTION
      ====================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-16 flex-1 flex flex-col justify-center">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Next-Gen Inventory Control & AI Demand Forecasting
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Real-Time Stock.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Zero Shrinkage.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Empowering operations managers and warehouse teams across multi-branch retail hubs
              with automated discrepancy detection, predictive stock ordering, and comprehensive loss prevention.
            </p>

            {/* ==================================================
                QUICK ACCESS CTA
            ================================================== */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">

              {/* OPEN MANAGER / STAFF PORTAL */}
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all"
              >
                <span>OPEN MANAGER / STAFF PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>


          {/* ==================================================
              RIGHT COLUMN
              Warehouse Graphic Simulation
          ================================================== */}
          <div className="lg:col-span-6">
            <WarehouseHeroGraphic />
          </div>

        </div>
      </main>


      {/* ======================================================
          FOOTER SECTION
      ====================================================== */}
      <footer className="border-t border-slate-800/80 bg-navy-900/90 py-10 px-4 sm:px-8 mt-12">

        <div className="max-w-7xl mx-auto space-y-6">

          {/* ==================================================
              ABOUT STOCKIFY
          ================================================== */}
          <div className="border-b border-slate-800/60 pb-6">

            <div>
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />

                <h3 className="text-lg font-black tracking-wide text-white">
                  ABOUT STOCKIFY
                </h3>
              </div>

              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Stockify Technologies is an advanced enterprise supply-chain and inventory intelligence platform
                engineered for grocery chains, distribution hubs, and retail supermarkets.
              </p>
            </div>

          </div>


          {/* ==================================================
              COMPANY DETAILS
          ================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">

            {/* COMPANY INFORMATION */}
            <div>
              <p className="font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-cyan-400" />
                Company Information
              </p>

              <p className="text-slate-300 font-medium">
                {COMPANY_INFO.fullLegalName}
              </p>

              <p className="mt-1 text-slate-400">
                Next-Generation Inventory Solutions
              </p>
            </div>


            {/* OFFICE ADDRESS */}
            <div>
              <p className="font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Office Address
              </p>

              <p className="text-slate-300">
                Vellore Institute of Technology
              </p>

              <p className="mt-1 text-slate-400">
                Tiruvalam Rd, Katpadi, Vellore,
                Tamil Nadu 632014, India
              </p>
            </div>


            {/* PHONE NUMBER */}
            <div>
              <p className="font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400" />
                Phone Number
              </p>

              <p className="text-slate-300 font-mono">
                8870810456
              </p>

              <p className="mt-1 text-slate-400">
                Operational Support Available 24/7
              </p>
            </div>

          </div>


          {/* ==================================================
              COPYRIGHT
          ================================================== */}
          <div className="text-center pt-4 border-t border-slate-800/40 text-[11px] text-slate-500">
            © {new Date().getFullYear()} {COMPANY_INFO.fullLegalName}. All rights reserved.
          </div>

        </div>
      </footer>


      {/* ======================================================
          POPUPS & MODALS
      ====================================================== */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

    </div>
  );
};