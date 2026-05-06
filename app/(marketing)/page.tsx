'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const id = formData.get('nodeId');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.get('fullName'),
        bio: formData.get('bio'),
        sector: formData.get('sector')
      })
      .eq('id', id);

    setLoading(false);
    if (!error) setSuccess(true);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] p-8 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">Edit Node.</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-10">Secure Management Access</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Your Node ID (Required)</label>
            <input name="nodeId" required className="w-full bg-gray-50 border-none rounded-xl p-4 font-mono font-bold" placeholder="e.g. 7" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Full Name</label>
              <input name="fullName" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Sector</label>
              <input name="sector" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Bio / Mission Statement</label>
            <textarea name="bio" rows={4} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-black" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating Grid...' : 'Update Passport'}
          </button>

          {success && (
            <p className="text-center text-green-600 text-[10px] font-black uppercase animate-bounce">
              Node Updated Successfully.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}