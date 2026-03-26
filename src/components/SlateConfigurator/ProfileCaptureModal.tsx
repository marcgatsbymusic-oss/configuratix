import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export function ProfileCaptureModal({ onClose, onComplete }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const setSession = useSessionStore(s => s.setSession);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setSession(name, email);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a1a1b] border border-[#eab676]/30 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(234,182,118,0.1)] overflow-hidden relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-8 pt-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#eab676]/20 rounded-full flex items-center justify-center text-[#eab676]">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Save Your Project</h2>
              <p className="text-sm text-white/50">Create a quick profile to manage your windows.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111112] border border-[#2a2a2b] rounded-xl p-4 text-white focus:outline-none focus:border-[#eab676] transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#111112] border border-[#2a2a2b] rounded-xl p-4 text-white focus:outline-none focus:border-[#eab676] transition-colors" placeholder="john@example.com" />
            </div>
            <button type="submit" className="mt-2 bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ffc882] transition-colors shadow-[0_0_20px_rgba(234,182,118,0.2)]">
              Save Profile & Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
