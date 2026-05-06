'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  AlertCircle,
  Check,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

type Profile = {
  full_name: string;
  business_name: string;
  sector: string;
  bio: string;
  location: string;
  hourly_rate: number | '';
  is_verified?: boolean;
};

const emptyProfile: Profile = {
  full_name: '',
  business_name: '',
  sector: '',
  bio: '',
  location: '',
  hourly_rate: '',
  is_verified: false,
};

export default function EditPassportPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canSave = useMemo(() => {
    return (
      profile.full_name.trim().length >= 2 &&
      profile.business_name.trim().length >= 2 &&
      profile.sector.trim().length >= 2 &&
      !saving
    );
  }, [profile, saving]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage('');

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace('/auth');
        return;
      }

      const authUserId = session.user.id;

      if (!active) return;

      setUserId(authUserId);

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'full_name, business_name, sector, bio, location, hourly_rate, is_verified'
        )
        .eq('id', authUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name ?? '',
          business_name: data.business_name ?? '',
          sector: data.sector ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
          hourly_rate:
            typeof data.hourly_rate === 'number' ? data.hourly_rate : '',
          is_verified: Boolean(data.is_verified),
        });
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSuccessMessage('');
    setErrorMessage('');

    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!userId) {
      setErrorMessage('Your session expired. Please sign in again.');
      router.replace('/auth');
      return;
    }

    if (profile.full_name.trim().length < 2) {
      setErrorMessage('Enter your provider name.');
      return;
    }

    if (profile.business_name.trim().length < 2) {
      setErrorMessage('Enter your business name.');
      return;
    }

    if (profile.sector.trim().length < 2) {
      setErrorMessage('Enter your service sector.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: userId,
        full_name: profile.full_name.trim(),
        business_name: profile.business_name.trim(),
        sector: profile.sector.trim(),
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        hourly_rate:
          profile.hourly_rate === '' ? null : Number(profile.hourly_rate),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Passport updated successfully.');
      router.refresh();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch {
      setErrorMessage('Something went wrong while updating your Passport.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 font-sans">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/50">
            Loading Passport
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-8 font-sans text-black selection:bg-black selection:text-white">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em] text-black/35">
              Provider Command Center
            </p>

            <h1 className="text-4xl font-black tracking-[-0.06em] text-black">
              Edit Passport
            </h1>

            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-black/55">
              Keep your identity, service category, pricing, and story accurate
              before customers book from your Klik Passport.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
              {profile.is_verified ? 'Verified' : 'Pending Review'}
            </span>
          </div>
        </header>

        <form
          onSubmit={handleUpdate}
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-black/[0.03] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black text-black">
                {profile.business_name || 'Your Klik Passport'}
              </p>
              <p className="text-xs font-semibold text-black/45">
                This information appears on your public Passport.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
                value={profile.full_name}
                onChange={(event) =>
                  updateField('full_name', event.target.value)
                }
                placeholder="Faith Njeri"
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
                value={profile.business_name}
                onChange={(event) =>
                  updateField('business_name', event.target.value)
                }
                placeholder="Faith Beauty Studio"
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

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
                value={profile.sector}
                onChange={(event) => updateField('sector', event.target.value)}
                placeholder="Hair & Beauty"
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Location / Service Area
              </label>

              <input
                id="location"
                type="text"
                value={profile.location}
                onChange={(event) =>
                  updateField('location', event.target.value)
                }
                placeholder="Juja, Nairobi, Westlands"
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="hourly_rate"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Starting Price / Hourly Rate
              </label>

              <input
                id="hourly_rate"
                type="number"
                min="0"
                value={profile.hourly_rate}
                onChange={(event) =>
                  updateField(
                    'hourly_rate',
                    event.target.value === '' ? '' : Number(event.target.value)
                  )
                }
                placeholder="1500"
                className="w-full rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="bio"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40"
              >
                Bio / Trust Statement
              </label>

              <textarea
                id="bio"
                rows={5}
                value={profile.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                placeholder="Tell customers what you do, where you serve, and why they can trust your work."
                className="w-full resize-none rounded-2xl border border-black/10 bg-[#F7F7F7] px-4 py-4 text-sm font-semibold leading-6 outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canSave}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-black px-5 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : successMessage ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? 'Saving Passport'
                : successMessage
                  ? 'Passport Updated'
                  : 'Save Passport'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-2xl border border-black/10 bg-white px-5 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-black/45 transition hover:text-black"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}