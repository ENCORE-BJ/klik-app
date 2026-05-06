'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Provider = {
  id: string;
  full_name: string;
  sector: string;
  is_verified: boolean;
  created_at: string;
};

type Transaction = {
  id: string;
  amount: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
};

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<'nodes' | 'ledger'>('nodes');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProviders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProviders(data);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setTransactions(data as Transaction[]);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (view === 'ledger') fetchTransactions();
  }, [view]);

  const deleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this Node?')) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setProviders(providers.filter((p) => p.id !== id));
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Update failed:', error.message);
    } else {
      setProviders(
        providers.map((p) => (p.id === id ? { ...p, is_verified: !currentStatus } : p)),
      );
    }
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery),
  );

  if (loading)
    return (
      <div className="p-20 font-sans uppercase tracking-[0.3em] text-xs">Syncing Registry...</div>
    );

  return (
    <main className="min-h-screen bg-white p-8 font-sans selection:bg-black selection:text-white">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Registry.</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-2">
            Klik Infrastructure Management
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto mb-8 flex gap-4">
        <button
          onClick={() => setView('nodes')}
          className={`text-[10px] font-black uppercase tracking-widest ${
            view === 'nodes' ? 'text-black underline' : 'text-gray-300'
          }`}
        >
          Nodes
        </button>
        <button
          onClick={() => setView('ledger')}
          className={`text-[10px] font-black uppercase tracking-widest ${
            view === 'ledger' ? 'text-black underline' : 'text-gray-300'
          }`}
        >
          Ledger
        </button>
      </div>

      {view === 'nodes' ? (
        <>
          <div className="max-w-6xl mx-auto mb-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search Nairobi Grid (Name, Sector, or ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-gray-300 group-focus-within:text-black">
                Search Active
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto overflow-hidden rounded-3xl border border-gray-100 shadow-sm text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                  <th className="p-5">Node</th>
                  <th className="p-5">Provider</th>
                  <th className="p-5">Sector</th>
                  <th className="p-5 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProviders.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-mono font-bold text-gray-400">KL-{user.id}</td>
                    <td className="p-5 font-bold uppercase">{user.full_name}</td>
                    <td className="p-5 text-gray-600">{user.sector}</td>
                    <td className="p-5 text-right space-x-4">
                      <Link
                        href={`/passport/${user.id}`}
                        className="hover:underline font-black uppercase text-[10px]"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => toggleVerification(user.id, user.is_verified)}
                        className={`font-black uppercase text-[10px] ${
                          user.is_verified
                            ? 'text-emerald-600 hover:text-emerald-800'
                            : 'text-amber-600 hover:text-amber-800'
                        }`}
                      >
                        {user.is_verified ? 'Verified' : 'Verify'}
                      </button>

                      <button
                        onClick={() => deleteNode(user.id)}
                        className="text-red-500 hover:text-red-700 font-black uppercase text-[10px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-w-6xl mx-auto space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100"
            >
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">
                  {tx.profiles?.full_name}
                </p>
                <p className="font-bold text-xs mt-1">+{tx.amount} KES</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-medium text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
                <span className="text-[8px] font-black uppercase text-green-600">Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}