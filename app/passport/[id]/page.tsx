'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, ArrowLeft } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  sector: string;
  bio: string;
  hourly_rate: number;
  is_verified: boolean;
};

export default function PassportPage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, sector, bio, hourly_rate, is_verified')
        .eq('id', params.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    if (params?.id) fetchProfile();
  }, [params?.id]);



  const handlePayment = async () => {
  // 1. ADD THIS GUARD: If there's no profile, exit the function immediately.
  if (!profile) {
    console.error("No profile found to process payment.");
    return;
  }

  const res = await fetch('/api/pay', {
    method: 'POST',
    body: JSON.stringify({
      // 2. TypeScript is now happy because it knows 'profile' is not null here.
      amount: profile.hourly_rate,
      phone: "254...", // Collected from the visitor
      businessName: profile.full_name
    })
  });

  if (res.ok) alert("Payment request sent to your device.");
};

    if (res.ok) alert('Payment request sent to your device.');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Node Link Copied to Clipboard.');
  };

  if (loading) {
    return <div className="p-20 text-xs uppercase tracking-[0.3em]">Loading Passport...</div>;
  }

  if (!profile) {
    return <div className="p-20 text-xs uppercase tracking-[0.3em]">Profile Not Found</div>;
  }

  return (
    <main className="min-h-screen bg-white p-8 font-sans selection:bg-black selection:text-white">
      <div className="max-w-2xl mx-auto rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Node Passport</p>
            <div className="flex items-center gap-2 text-gray-400">
              <ArrowLeft className="h-4 w-4" />
              <Share2 className="h-4 w-4" />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase mt-3">{profile.full_name}</h1>
        </div>

        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Service Domain</p>
                <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {profile.sector}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Operational Mission</p>
                <p className="text-gray-600 leading-relaxed italic text-xs">"{profile.bio}"</p>

                <button
                  onClick={handlePayment}
                  className="w-full mt-6 bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  💸 Pay {profile.hourly_rate} KES / Hr
                </button>

              </div>
            </div>

            <div className="bg-white p-2 border border-gray-100 rounded-xl shadow-sm shrink-0">
              <QRCodeSVG
                value={`https://klik.co.ke/passport/${profile.id}`}
                size={80}
                level="H"
                includeMargin={false}
              />
              <p className="text-[7px] font-black text-center mt-2 uppercase tracking-tighter text-gray-300">
                Scan to Verify
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-8 pb-8 pt-6">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 w-4 rounded-full ${profile.is_verified ? 'bg-black' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p
            className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
              profile.is_verified ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                profile.is_verified ? 'bg-green-600 animate-pulse' : 'bg-gray-300'
              }`}
            />
            {profile.is_verified ? 'Node Active: Nairobi' : 'Node Pending Auth'}
          </p>
        </div>


        <button
          onClick={copyLink}
          className="mt-8 w-full border border-gray-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Share2 size={12} /> Share Node Passport
        </button>

      </div>
    </main>
  );
}