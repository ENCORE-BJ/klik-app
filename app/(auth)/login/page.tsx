'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
    setLoading(true);
    const { data, error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      // If signup, they need to check email. If login, send to dashboard.
      if (type === 'LOGIN') router.push('/dashboard');
      else alert("Check your email for the verification link!");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter">KLIK.</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mt-2">Secure Node Access</p>
        </div>

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-1 focus:ring-black"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleAuth('LOGIN')}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          <button 
            onClick={() => handleAuth('SIGNUP')}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-black transition-all"
          >
            Create New Node
          </button>
        </div>
      </div>
    </main>
  );
}