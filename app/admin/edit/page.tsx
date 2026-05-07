'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Save, Search, User, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

// Next.js requires Suspense for components using useSearchParams
function EditNodeContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [profile, setProfile] = useState({ 
    full_name: '', 
    sector: '', 
    bio: '', 
    hourly_rate: 0,
    is_verified: false 
  });

  // STEP 2: AUTO-FILL LOGIC
  useEffect(() => {
    if (urlId) {
      setNodeId(urlId);
      fetchNode(urlId); // Automatically trigger fetch if ID is in URL
    }
  }, [urlId]);

  const fetchNode = async (idToFetch?: string) => {
    const id = idToFetch || nodeId;
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setProfile(data);
    if (error) console.error("Fetch Error:", error);
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', nodeId);

    if (!error) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-4 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-1">Grid Infrastructure</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">Edit Node</h1>
        </header>

        {/* ACCESS CARD */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Access</span>
          </div>
          <div className="flex gap-3">
            <input 
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              placeholder="Paste Node UUID..."
              className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-mono focus:ring-1 focus:ring-black outline-none"
            />
            <button 
              onClick={() => fetchNode()} 
              disabled={loading}
              className="bg-black text-white px-8 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />} Fetch
            </button>
          </div>
        </div>

        {/* CONFIGURATION CARD */}
        <form onSubmit={handleUpdate} className="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-2 text-gray-400 border-b border-gray-50 pb-6">
            <User size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profile Settings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Full Name</label>
              <input 
                type="text" 
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full border-b border-gray-100 py-2 text-sm focus:border-black outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Sector</label>
              <input 
                type="text" 
                value={profile.sector}
                onChange={(e) => setProfile({...profile, sector: e.target.value})}
                className="w-full border-b border-gray-100 py-2 text-sm focus:border-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Bio / Mission Statement</label>
            <textarea 
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs italic text-gray-600 outline-none focus:border-black transition-all"
            />
          </div>

          {/* STEP 3: VERIFICATION TOGGLE */}
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-900 block">Node Authentication</label>
              <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Toggle green pulse visibility on Passport</p>
            </div>
            <input 
              type="checkbox" 
              checked={profile.is_verified}
              onChange={(e) => setProfile({...profile, is_verified: e.target.checked})}
              className="h-6 w-6 accent-black cursor-pointer"
            />
          </div>

          <button 
            type="submit"
            disabled={status === 'saving'}
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:bg-gray-300"
          >
            {status === 'saving' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : status === 'success' ? (
              <CheckCircle2 className="text-green-400" size={16} />
            ) : (
              <Save size={16} />
            )}
            {status === 'saving' ? 'Syncing...' : status === 'success' ? 'Grid Updated' : 'Update Passport'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditNodePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-mono text-[10px] uppercase tracking-widest text-gray-400">Initializing Grid...</div>}>
      <EditNodeContent />
    </Suspense>
  );
}