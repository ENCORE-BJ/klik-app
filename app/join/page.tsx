'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

type JoinForm = {
  full_name: string;
  business_name: string;
  sector: string;
  location: string;
  bio: string;
};

const initialForm: JoinForm = {
  full_name: '',
  business_name: '',
  sector: '',
  location: '',
  bio: '',
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function JoinPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [form, setForm] = useState<JoinForm>(initialForm);

  const [loadingSession, setLoadingSession] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // FIXED: Redirecting to '/login' because '/auth' does not exist in your routes
      if (error || !session?.user) {
        router.replace('/login'); 
        return;
      }

      if (!active) return;

      setUserId(session.user.id);

      const metadata = session.user.user_metadata;

      setForm((current) => ({
        ...current,
        full_name: metadata?.full_name ?? '',
        business_name: metadata?.business_name ?? '',
      }));

      setLoadingSession(false);
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      form.full_name.trim().length >= 2 &&
      form.business_name.trim().length >= 2 &&
      form.sector.trim().length >= 2 &&
      form.location.trim().length >= 2 &&
      form.bio.trim().length >= 20 &&
      !isIssuing
    );
  }, [form, isIssuing]);

  const updateField = <K extends keyof JoinForm>(
    key: K,
    value: JoinForm[K]
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleIssuePassport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!userId) {
      setErrorMessage('Your session expired. Please sign in again.');
      router.replace('/login');
      return;
    }

    if (!canSubmit) {
      setErrorMessage('Complete all required fields before issuing your Passport.');
      return;
    }

    try {
      setIsIssuing(true);

      const baseSlug = createSlug(form.business_name || form.full_name);
      const passportSlug = `${baseSlug}-${userId.slice(0, 6)}`;

      const payload = {
        id: userId,
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim(),
        sector: form.sector.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        passport_slug: passportSlug,
        is_verified: false,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('id, passport_slug')
        .single();

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Passport issued successfully.');

      router.refresh();
      router.replace(`/passport/${data.passport_slug || data.id}`);
    } catch {
      setErrorMessage('Something went wrong while issuing your Passport.');
    } finally {
      setIsIssuing(false);
    }
  };

  if (loadingSession) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 font-sans">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/50">
            Preparing Passport
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-10 font-sans text-black">
      <section className="mx-auto w-full max-w-xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-black/45 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Digital Passport Issuance
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-[-0.08em]">
            KLIK<span className="text-[#FF5A1F]">.</span>
          </h1>

          <p className="mt-4 text-sm font-medium leading-6 text-black/55">
            Create your trusted provider identity. Add your business name,
            sector, location, and trust statement before launching your Passport.
          </p>
        </header>

        <form
          onSubmit={handleIssuePassport}
          className="space-y-5 rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Provider Name
              </label>

              <input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={(event) =>
                  updateField('full_name', event.target.value)
                }
                placeholder="Faith Njeri"
                required
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="business_name"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Business Name
              </label>

              <input
                id="business_name"
                type="text"
                value={form.business_name}
                onChange={(event) =>
                  updateField('business_name', event.target.value)
                }
                placeholder="Faith Beauty Studio"
                required
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="sector"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Service Sector
              </label>

              <input
                id="sector"
                type="text"
                value={form.sector}
                onChange={(event) => updateField('sector', event.target.value)}
                placeholder="Hair & Beauty"
                required
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                placeholder="Juja, Nairobi"
                required
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
            >
              Trust Statement
            </label>

            <textarea
              id="bio"
              rows={5}
              value={form.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              placeholder="Tell customers what you do, where you serve, and why they can trust your work."
              required
              className="w-full resize-none rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold leading-6 outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
            />

            <p className="text-xs font-semibold text-black/35">
              Minimum 20 characters. This appears on your public Passport.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {isIssuing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isIssuing ? 'Issuing Passport...' : 'Issue My Passport'}
          </button>

          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/25">
            Proof • Services • Bookings • Client Memory
          </p>
        </form>
      </section>
    </main>
  );
}