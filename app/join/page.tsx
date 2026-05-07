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
  <main className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row font-sans">
    {/* LEFT SIDE: Brand & Trust (Visible on Desktop) */}
    <section className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between bg-gradient-to-br from-[#FAF7F2] to-[#f0ece5]">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.04em]">KLIK<span className="text-[#FF5A1F]">.</span></h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#10B981]">
          <ShieldCheck className="h-3 w-3" />
          Trusted Service Infrastructure
        </div>
      </div>
      
      <div className="max-w-md">
        <h2 className="text-5xl font-black leading-[1.1] tracking-tight text-black mb-6">
          Create the identity your business deserves.
        </h2>
        <p className="text-lg text-black/50 font-medium italic">
          "Bookings. Proof. Reviews. Portfolio. All in one Passport."
        </p>
      </div>

      {/* Feature Stack */}
      <div className="grid grid-cols-2 gap-4">
        {['Verified Identity', 'Smart Booking', 'Digital Portfolio', 'Client Memory'].map((feat) => (
          <div key={feat} className="p-4 rounded-3xl bg-white/40 border border-white shadow-sm backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">{feat}</p>
          </div>
        ))}
      </div>
    </section>

    {/* RIGHT SIDE: The Onboarding Flow */}
    <section className="flex-1 p-6 lg:p-12 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5A1F] mb-2">Step 1 of 3</p>
          <h3 className="text-3xl font-black tracking-tight">Issue Your Passport</h3>
          <p className="text-black/50 font-medium">Set up your public provider identity on the Grid.</p>
        </div>

        {/* YOUR EXISTING FORM COMPONENT GOES HERE */}
        <form onSubmit={handleIssuePassport} className="space-y-6">
           {/* Wrap inputs in premium 'Card' containers */}
           <div className="bg-white p-6 rounded-[2rem] shadow-klik-card border border-black/5">
              {/* Name, Business, Sector, etc. */}
           </div>
           
           <button 
             type="submit" 
             disabled={!canSubmit}
             className="w-full py-5 rounded-2xl bg-[#FF5A1F] text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FF5A1F]/20 hover:scale-[1.02] transition-transform"
           >
             Issue My Passport
           </button>
        </form>
      </div>
    </section>
  </main>
);