
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getStoredUsers } from '../services/api';
import { User } from '../types';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showDemoKeys, setShowDemoKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const staffAccounts = [
    { role: 'Super Admin', email: 'super@raya.com', pass: '011-1111111' },
    { role: 'Test Account (Printing)', email: 'test@print.com', pass: '019-1234567' },
    { role: 'Admin (Ops)', email: 'ops@raya.com', pass: '022-2222222' },
    { role: 'Photographer', email: 'photo@raya.com', pass: '044-4444444' },
    { role: 'Editor', email: 'editor@raya.com', pass: '055-5555555' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const users = await getStoredUsers();

    if (isLogin) {
      const user = users.find(u => u.email === formData.email && u.phone === formData.phone);
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        if (user.role !== 'user') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('Maklumat tidak tepat. Pastikan Email dan No. Telefon (Password) adalah betul.');
      }
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'user'
      };
      await saveUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      alert('Pendaftaran Berjaya! Nombor telefon anda telah ditetapkan sebagai password anda.');
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const fillDemo = (email: string, pass: string) => {
    setFormData({ ...formData, email, phone: pass });
    setIsLogin(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 py-12 md:py-20 bg-[#fdfcf0]">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-gold/10 mb-8">
        <div className="p-10 md:p-14 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-serif font-bold text-emerald-900">
              {isLogin ? 'Log Masuk' : 'Daftar Akaun'}
            </h2>
            <p className="text-gray-500 font-medium italic">"Sertai komuniti eksklusif Raya Studio 2026."</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Nama Penuh</label>
                <input type="text" required placeholder="Nama penuh anda" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-gold outline-none transition-all" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Alamat Email</label>
              <input type="email" required placeholder="email@contoh.com" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-gold outline-none transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                {isLogin ? 'No. Telefon (Password)' : 'No. Telefon'}
              </label>
              <input type="tel" required placeholder="01x-xxxxxxx" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-gold outline-none transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <button disabled={isLoading} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:scale-[1.02] active:scale-100 transition-all text-lg disabled:opacity-50">
              {isLoading ? 'Menghubungkan...' : isLogin ? 'Masuk ke Portal' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="text-center pt-4">
            <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-900 text-sm font-bold hover:text-gold transition-colors">
              {isLogin ? 'Tiada akaun pelanggan? Daftar sekarang &rarr;' : 'Sudah ada akaun? Log masuk di sini &rarr;'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl space-y-4">
        <button 
          onClick={() => setShowDemoKeys(!showDemoKeys)}
          className="w-full flex items-center justify-between p-6 bg-emerald-900/5 border border-emerald-900/10 rounded-3xl hover:bg-emerald-900/10 transition-all group"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            <span className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Akses Kakitangan (Demo)</span>
          </div>
          <span className={`text-emerald-900 transition-transform ${showDemoKeys ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </span>
        </button>

        {showDemoKeys && (
          <div className="grid grid-cols-1 gap-3 animate-reveal">
            {staffAccounts.map((staff, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-gold uppercase tracking-widest">{staff.role}</div>
                  <div className="text-sm font-bold text-emerald-900">{staff.email}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">Pass: {staff.pass}</div>
                </div>
                <button 
                  onClick={() => fillDemo(staff.email, staff.pass)}
                  className="px-4 py-2 bg-gold/10 text-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all whitespace-nowrap"
                >
                  Gunakan Akses
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
