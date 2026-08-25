'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './Toast';
import { ConversionDirection } from '@/types/converter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    currentUser,
    allUsers,
    isAuthenticated,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
    switchUser,
    updatePreferences,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'signin' | 'signup' | 'switch'>(
    currentUser.isGuest ? 'signin' : 'profile'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile preferences
  const [prefPrecision, setPrefPrecision] = useState<number>(currentUser.defaultPrecision || 4);
  const [prefDirection, setPrefDirection] = useState<ConversionDirection>(
    currentUser.defaultDirection || 'km_to_mi'
  );

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = signIn(email, password);
    if (res.success) {
      showToast(`Welcome back, ${email}!`, 'success');
      setEmail('');
      setPassword('');
      setActiveTab('profile');
    } else {
      setErrorMsg(res.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = signUp(name, email, password);
    if (res.success) {
      showToast(`Account created for ${name}!`, 'success');
      setName('');
      setEmail('');
      setPassword('');
      setActiveTab('profile');
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  const handleSavePreferences = () => {
    updatePreferences({
      defaultPrecision: prefPrecision,
      defaultDirection: prefDirection,
    });
    showToast('Saved user preferences!', 'success');
  };

  const handleSwitch = (userId: string) => {
    switchUser(userId);
    showToast('Switched user account!', 'info');
    setActiveTab('profile');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="auth-modal-title"
                className="text-base font-extrabold text-slate-900 dark:text-white"
              >
                User Authentication & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage personal conversion data & profiles
              </p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          id="auth-nav-tabs"
          className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
        >
          <button
            id="tab-auth-profile"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            id="tab-auth-signin"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === 'signin'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-auth-signup"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            id="tab-auth-switch"
            onClick={() => {
              setActiveTab('switch');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === 'switch'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Accounts
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div
              id="auth-error-banner"
              className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div id="profile-view-content" className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </span>
                    {!currentUser.isGuest && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Default Conversion Preferences
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 text-[11px]">
                      Preferred Default Direction:
                    </label>
                    <select
                      id="select-pref-direction"
                      value={prefDirection}
                      onChange={(e) => setPrefDirection(e.target.value as ConversionDirection)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="km_to_mi">Kilometers → Miles (Metric to Imperial)</option>
                      <option value="mi_to_km">Miles → Kilometers (Imperial to Metric)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1 text-[11px]">
                      Default Decimal Precision:
                    </label>
                    <select
                      id="select-pref-precision"
                      value={prefPrecision}
                      onChange={(e) => setPrefPrecision(Number(e.target.value))}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="2">2 Decimal Places (Standard)</option>
                      <option value="3">3 Decimal Places</option>
                      <option value="4">4 Decimal Places (Standard scientific)</option>
                      <option value="6">6 Decimal Places (High precision)</option>
                      <option value="-1">Exact Decimals</option>
                    </select>
                  </div>

                  <button
                    id="btn-save-preferences"
                    onClick={handleSavePreferences}
                    className="w-full mt-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>

              {/* Sign out or guest switch */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  id="btn-switch-to-guest"
                  onClick={() => {
                    signInAsGuest();
                    showToast('Switched to Guest session.', 'info');
                    onClose();
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold"
                >
                  Use as Guest
                </button>
                <button
                  id="btn-sign-out"
                  onClick={() => {
                    signOut();
                    showToast('Signed out of profile.', 'info');
                  }}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form id="form-sign-in" onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label
                  htmlFor="input-signin-email"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. stanley.remy@pursuit.org"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-signin-password"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Password or Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security passcode"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                id="btn-submit-sign-in"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Securely</span>
              </button>

              <div className="text-center pt-2 text-slate-500">
                Don&#39;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form id="form-sign-up" onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label
                  htmlFor="input-signup-name"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-signup-email"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-signup-password"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Create Passcode / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a passcode"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                id="btn-submit-sign-up"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account & Save Profile</span>
              </button>
            </form>
          )}

          {/* Switch Account */}
          {activeTab === 'switch' && (
            <div id="switch-account-list" className="space-y-2">
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Select an account profile to switch your active session and view its isolated
                conversion history:
              </p>
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  id={`btn-select-user-${user.id}`}
                  onClick={() => handleSwitch(user.id)}
                  className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between gap-3 ${
                    user.id === currentUser.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  {user.id === currentUser.id && (
                    <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
