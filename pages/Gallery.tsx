
import React from 'react';
import { Link } from 'react-router-dom';

const GuideStep: React.FC<{ number: string, title: string, desc: string, icon: React.ReactNode }> = ({ number, title, desc, icon }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 flex flex-col items-center text-center space-y-4 group hover:border-gold transition-all duration-500">
    <div className="relative">
      <div className="w-16 h-16 bg-gold text-white rounded-2xl flex items-center justify-center text-2xl font-serif font-bold shadow-lg group-hover:rotate-12 transition-transform">
        {number}
      </div>
      <div className="absolute -inset-2 bg-gold/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
    <div className="w-full aspect-video bg-gray-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden border border-gray-100">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-bold text-emerald-900">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

const Gallery: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-emerald-900">Panduan Bergambar</h1>
        <p className="text-gold font-medium italic">"Cara mudah untuk memilih foto untuk dicetak."</p>
        <div className="w-20 h-1 bg-gold mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <GuideStep 
          number="01" 
          title="Buka Album" 
          desc="Klik pautan Google Photos yang kami hantar di Dashboard atau WhatsApp."
          icon={
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-inner">
                 <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
              <div className="mt-4 px-4 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-400">google.photos/abc...</div>
            </div>
          }
        />
        <GuideStep 
          number="02" 
          title="Klik Ikon 'Info'" 
          desc="Pilih foto kegemaran anda, kemudian klik ikon ( i ) di bahagian atas kanan skrin."
          icon={
            <div className="relative w-32 h-20 bg-white border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
               <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold animate-pulse">i</div>
               <div className="w-20 h-12 bg-gray-100 rounded-md"></div>
            </div>
          }
        />
        <GuideStep 
          number="03" 
          title="Salin No. Foto" 
          desc="Lihat bahagian 'Details'. Ambil nama fail tersebut (Contoh: DSC_0452)."
          icon={
            <div className="w-48 p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
               <div className="h-2 w-20 bg-gray-100 rounded"></div>
               <div className="h-3 w-32 bg-emerald-50 rounded text-[10px] font-mono font-bold text-emerald-600 flex items-center px-2">Filename: DSC_0452.jpg</div>
               <div className="h-2 w-24 bg-gray-100 rounded"></div>
            </div>
          }
        />
        <GuideStep 
          number="04" 
          title="Masukkan No." 
          desc="Kembali ke Dashboard Raya Studio dan masukkan no. tersebut dalam borang cetakan."
          icon={
            <div className="flex flex-col items-center gap-2">
               <div className="w-32 h-10 bg-emerald-900 rounded-lg flex items-center justify-center px-3 gap-2">
                  <div className="h-4 w-16 bg-white/20 rounded"></div>
                  <div className="w-4 h-4 bg-gold rounded-sm"></div>
               </div>
               <p className="text-[10px] font-bold text-gold animate-bounce">Enter DSC_0452</p>
            </div>
          }
        />
      </div>

      <div className="bg-emerald-950 rounded-[3rem] p-12 text-white relative overflow-hidden text-center">
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-serif font-bold">Sudah Faham?</h2>
          <p className="text-emerald-100/60 max-w-xl mx-auto italic font-medium">
            "Sila pastikan nombor foto adalah tepat untuk mengelakkan kesilapan semasa proses cetakan fizikal."
          </p>
          <Link to="/dashboard" className="inline-block bg-gold text-emerald-950 px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-gold/20">
            Kembali ke Dashboard & Cetak
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Gallery;
