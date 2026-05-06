'use client'; // Essential for forms and redirects

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function JoinPage() {
  const [fullName, setFullName] = useState('');
  const [sector, setSector] = useState('');
  const [bio, setBio] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);

  const handleIssuePassport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsIssuing(true);

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        full_name: fullName, 
        sector: sector, 
        bio: bio,
        is_verified: false 
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error.message);
      setIsIssuing(false);
      return;
    }

    if (data && data.id) {
      console.log("Success! Moving to Node:", data.id);
      window.location.href = `/passport/${data.id}`; 
    } else {
      console.error("No ID returned from Supabase.");
    }

    setIsIssuing(false);
  };

  return (
    <main className="min-h-screen p-8 flex items-center justify-center font-sans">
      <form onSubmit={handleIssuePassport} className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-black italic tracking-tighter">KLIK.</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Digital Passport Issuance
        </p>
        
        <input 
          className="w-full border-b-2 p-2 outline-none" 
          placeholder="Legal Full Name" 
          onChange={(e) => setFullName(e.target.value)} 
          required 
        />
        <input 
          className="w-full border-b-2 p-2 outline-none" 
          placeholder="Service Sector (e.g. Beauty)" 
          onChange={(e) => setSector(e.target.value)} 
          required 
        />
        <textarea 
          className="w-full border-b-2 p-2 outline-none" 
          placeholder="Professional Mission" 
          onChange={(e) => setBio(e.target.value)} 
          required 
        />

        <button 
          type="submit" 
          disabled={isIssuing}
          className="w-full bg-black text-white p-4 rounded-2xl font-bold uppercase text-xs tracking-widest"
        >
          {isIssuing ? "Authenticating Node..." : "Issue My Passport"}
        </button>
      </form>
    </main>
  );
}