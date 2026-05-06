'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';

type Profile = {
  id: string;
  passport_slug?: string | null;
  full_name: string | null;
  business_name?: string | null;
  sector: string | null;
  bio: string | null;
  location?: string | null;
  hourly_rate: number | null;
  is_verified: boolean | null;
};

export default function PassportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const passportId = params?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      if (!passportId) return;

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, passport_slug, full_name, business_name, sector, bio, location, hourly_rate, is_verified'
        )
        .or(`id.eq.${passportId},passport_slug.eq.${passportId}`)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, [passportId]);

  const passportUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';

    return window.location.href;
  }, []);

  const displayName =
    profile?.business_name?.trim() ||
    profile?.full_name?.trim() ||
    'Klik Provider';

  const providerName = profile?.full_name?.trim() || 'Verified Provider';
  const sector = profile?.sector?.trim() || 'Service Provider';
  const location = profile?.location?.trim() || 'Nairobi, Kenya';
  const bio =
    profile?.bio?.trim() ||
    'This provider is building a trusted Klik Passport with services, proof, reviews, and booking history.';

  const startingPrice =
    typeof profile?.hourly_rate === 'number' && profile.hourly_rate > 0
      ? `From KES ${profile.hourly_rate.toLocaleString()}`
      : 'Price on request';

  const isVerified = Boolean(profile?.is_verified);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);
      }, 2200);
    } catch {
      setErrorMessage('Could not copy link. Please copy it from the browser.');
    }
  };

  const handleBookingRequest = () => {
    if (!profile) return;

    router.push(`/book/${profile.passport_slug || profile.id}`);
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

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 font-sans text-black">
        <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
            Passport Not Found
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.06em]">
            This Klik Passport does not exist.
          </h1>

          <p className="mt-3 text-sm font-medium leading-6 text-black/55">
            The link may be wrong, expired, or the provider has not completed
            their Passport yet.
          </p>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full rounded-2xl bg-black px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-white transition hover:opacity-90"
          >
            Go Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 font-sans text-black selection:bg-black selection:text-white">
      <section className="mx-auto w-full max-w-4xl">
        <nav className="mb-5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/45 shadow-sm transition hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/45 shadow-sm transition hover:text-black"
          >
            {copySuccess ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            {copySuccess ? 'Copied' : 'Share'}
          </button>
        </nav>

        <div className="overflow-hidden rounded-[2.4rem] border border-black/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.10)]">
          <header className="relative overflow-hidden bg-black px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#FF5A1F]/30 blur-3xl" />
            <div className="absolute bottom-[-10rem] left-[-8rem] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/70 ring-1 ring-white/10">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Klik Passport
                  </span>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] ring-1 ${
                      isVerified
                        ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/20'
                        : 'bg-white/10 text-white/60 ring-white/10'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isVerified
                          ? 'bg-emerald-300 animate-pulse'
                          : 'bg-white/35'
                      }`}
                    />
                    {isVerified ? 'Verified Provider' : 'Pending Verification'}
                  </span>
                </div>

                <p className="text-sm font-bold text-white/45">
                  {providerName}
                </p>

                <h1 className="mt-2 text-5xl font-black tracking-[-0.08em] md:text-7xl">
                  {displayName}
                </h1>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    {sector}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                </div>
              </div>

              <div className="w-fit rounded-[1.6rem] bg-white p-3 text-black shadow-2xl">
                <QRCodeSVG
                  value={passportUrl || `https://klik.co.ke/passport/${profile.id}`}
                  size={106}
                  level="H"
                  includeMargin={false}
                />

                <p className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.18em] text-black/30">
                  Scan to verify
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-0 md:grid-cols-[1.35fr_0.65fr]">
            <div className="border-b border-black/10 p-6 md:border-b-0 md:border-r md:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                Trust Statement
              </p>

              <p className="mt-4 text-lg font-semibold leading-8 text-black/70">
                “{bio}”
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-[#FAF7F2] p-5">
                  <div className="flex items-center gap-2 text-black">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
                      Identity
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-black">
                    {isVerified ? 'Verified' : 'Reviewing'}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FAF7F2] p-5">
                  <div className="flex items-center gap-2 text-black">
                    <Star className="h-4 w-4 text-[#FF5A1F]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
                      Trust
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-black">
                    Proof Building
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FAF7F2] p-5">
                  <div className="flex items-center gap-2 text-black">
                    <CalendarCheck className="h-4 w-4 text-sky-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
                      Booking
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-black">
                    Request Slot
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                      Starting Price
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
                      {startingPrice}
                    </p>
                  </div>

                  <button
                    onClick={handleBookingRequest}
                    className="rounded-2xl bg-black px-6 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-white transition hover:-translate-y-0.5 hover:opacity-90"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
            </div>

            <aside className="p-6 md:p-8">
              <div className="rounded-[2rem] bg-[#FAF7F2] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                  Passport Link
                </p>

                <p className="mt-3 break-all rounded-2xl bg-white p-4 text-xs font-semibold leading-5 text-black/50">
                  {passportUrl || `klik.co.ke/passport/${profile.passport_slug || profile.id}`}
                </p>

                <button
                  onClick={copyLink}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-black/45 transition hover:text-black"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </button>
              </div>

              <div className="mt-5 rounded-[2rem] bg-black p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
                  Klik Loop
                </p>

                <div className="mt-5 space-y-4">
                  {['Proof', 'Trust', 'Booking', 'Review', 'Memory'].map(
                    (item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
                          {index + 1}
                        </div>
                        <p className="text-sm font-bold text-white/75">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>

        {errorMessage && (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}