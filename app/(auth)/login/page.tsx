'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AuthMode = 'LOGIN' | 'SIGNUP';

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('LOGIN');

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSignup = mode === 'SIGNUP';

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (active && data.session) {
        router.replace('/dashboard');
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const cleanEmail = email.trim().toLowerCase();

  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  }, [cleanEmail]);

  const isValidPassword = password.length >= 8;

  const isValidSignupProfile = useMemo(() => {
    if (!isSignup) return true;

    return fullName.trim().length >= 2 && businessName.trim().length >= 2;
  }, [isSignup, fullName, businessName]);

  const canSubmit =
    isValidEmail && isValidPassword && isValidSignupProfile && !loading;

  const resetAlerts = () => {
    setMessage('');
    setErrorMessage('');
  };

  const getFriendlyError = (error: string) => {
    const lower = error.toLowerCase();

    if (lower.includes('invalid login credentials')) {
      return 'The email or password is incorrect.';
    }

    if (lower.includes('email not confirmed')) {
      return 'Please verify your email before signing in.';
    }

    if (lower.includes('user already registered')) {
      return 'An account already exists with this email. Try signing in.';
    }

    return error;
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetAlerts();

    if (!isValidEmail) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (!isValidPassword) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (isSignup && fullName.trim().length < 2) {
      setErrorMessage('Enter the provider name.');
      return;
    }

    if (isSignup && businessName.trim().length < 2) {
      setErrorMessage('Enter the business name.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'LOGIN') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(getFriendlyError(error.message));
          return;
        }

        router.refresh();
        router.replace('/dashboard');
        return;
      }

      const emailRedirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/onboarding`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            business_name: businessName.trim(),
            account_type: 'provider',
          },
        },
      });

      if (error) {
        setErrorMessage(getFriendlyError(error.message));
        return;
      }

      if (data.session) {
        router.refresh();
        router.replace('/onboarding');
        return;
      }

      setMessage(
        'Account created. Check your email to verify your Klik Passport access.'
      );
      setPassword('');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetAlerts();
    setPassword('');
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-black flex items-center justify-center px-5 py-10 font-sans">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-black/50 shadow-sm">
            Klik Passport Access
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-[-0.08em]">
            KLIK<span className="text-[#FF5A1F]">.</span>
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/55">
            Build your trusted service identity, organize proof, manage bookings,
            and remember every client.
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.03] p-1">
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                mode === 'LOGIN'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/45 hover:text-black'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => switchMode('SIGNUP')}
              className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                mode === 'SIGNUP'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/45 hover:text-black'
              }`}
            >
              Create
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
                  >
                    Provider Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Faith Njeri"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
                  >
                    Business Name
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    autoComplete="organization"
                    placeholder="Faith Beauty Studio"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 pr-20 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-black/35 transition hover:text-black"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-2xl bg-black px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {loading
                ? 'Processing...'
                : isSignup
                  ? 'Create Passport Access'
                  : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-[#FFF4EC] p-4">
            <p className="text-xs font-semibold leading-5 text-black/55">
              {isSignup
                ? 'Create secure provider access first. After verification, you will build your Passport, add services, pricing, proof, availability, and booking preferences.'
                : 'Sign in to manage your Passport, booking requests, Proof Inbox, Client Book, and provider dashboard.'}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-black/30">
          Trust Layer For Service Providers
        </p>
      </section>
    </main>
  );
}