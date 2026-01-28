
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredBookings, getStoredPromos, getStoredMessages, listenToUpdates } from '../services/mockData';
import { getFestiveGreeting } from '../services/geminiService';
import { Booking, Promo, BookingStatus, Message } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const StatusStep = ({ label, isActive, isCompleted, isLast }: any) => (
  <div className="flex flex-col items-center flex-1 relative">
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${isCompleted ? 'bg-gold border-gold text-white' : isActive ? 'bg-white border-gold text-gold animate-pulse' : 'bg-white border-gray-200 text-gray-300'}`}>
      {isCompleted ? '✓' : '!'}
    </div>
    <span className="text-[9px] uppercase font-bold tracking-widest mt-2">{label}</span>
    {!isLast && <div className={`absolute top-4 left-[50%] w-full h-0.5 -z-0 ${isCompleted ? 'bg-gold' : 'bg-gray-100'}`}></div>}
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('current_user') || 'null');
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [greeting, setGreeting] = useState("Menjana ucapan...");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'status' | 'messages'>('status');
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return navigate('/auth');
    refreshData();
    getFestiveGreeting(user.fullName).then(setGreeting);
    listenToUpdates(refreshData);
  }, [user]);

  const refreshData = () => {
    const allBookings = getStoredBookings().filter(b => b.userId === user.id);
    if (allBookings.length > 0) {
      const b = allBookings[allBookings.length - 1];
      setLatestBooking(b);
      if (b.paymentStatus === 'paid') {
        QRCode.toDataURL(`ID:${b.id}`).then(setQrCodeUrl);
      }
    }
    setMessages(getStoredMessages().filter(m => m.userId === user.id).reverse());
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current);
    const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('Ticket_Raya_Studio.pdf');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-reveal">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-emerald-900">Selamat Kembali, {user.fullName}</h1>
          <p className="text-gold italic">{greeting}</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-emerald-50">
          <button onClick={() => setActiveTab('status')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'status' ? 'bg-emerald-900 text-white' : 'text-emerald-900/50'}`}>Tempahan</button>
          <button onClick={() => setActiveTab('messages')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'messages' ? 'bg-emerald-900 text-white' : 'text-emerald-900/50'}`}>
            Mesej {messages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">{messages.length}</span>}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'status' ? (
            <section className="bg-white rounded-[3rem] p-10 shadow-xl border border-emerald-50">
              {latestBooking ? (
                <div className="space-y-12">
                  <div className="flex justify-between">
                    <StatusStep label="Pengesahan" isCompleted={latestBooking.paymentStatus === 'paid'} isActive={latestBooking.paymentStatus === 'awaiting_verification'} />
                    <StatusStep label="Photoshoot" isCompleted={latestBooking.status === 'photoshoot_done'} isActive={latestBooking.status === 'confirmed'} />
                    <StatusStep label="Editing" isCompleted={latestBooking.status === 'completed'} isActive={latestBooking.status === 'editing'} />
                    <StatusStep label="Selesai" isCompleted={latestBooking.status === 'completed'} isLast />
                  </div>

                  {latestBooking.paymentStatus === 'paid' ? (
                    <div className="grid md:grid-cols-2 gap-8 items-center bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-serif font-bold text-emerald-900">Tiket Anda Sudah Sedia!</h3>
                        <p className="text-sm text-emerald-900/60 leading-relaxed">Pembayaran telah disahkan. Sila muat turun tiket di bawah untuk ditunjukkan semasa sesi fotografi.</p>
                        <button onClick={downloadTicket} className="bg-gold text-emerald-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all uppercase text-[10px] tracking-widest">Muat Turun Tiket PDF</button>
                      </div>
                      <div className="bg-white p-4 rounded-3xl shadow-lg border border-emerald-900/5 flex flex-col items-center">
                        <img src={qrCodeUrl} className="w-32 h-32" alt="QR" />
                        <p className="text-[10px] font-mono font-bold mt-2">ID: #{latestBooking.id.split('-').pop()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center space-y-4">
                      <p className="text-lg font-serif font-bold text-gray-500 italic">"Pembayaran sedang disahkan oleh Admin..."</p>
                    </div>
                  )}
                </div>
              ) : <p className="text-gray-400 italic">Tiada tempahan aktif.</p>}
            </section>
          ) : (
            <section className="space-y-4">
              {messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-emerald-50 hover:border-gold transition-all animate-reveal">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-emerald-900">{msg.subject}</h4>
                    <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 italic leading-relaxed">"{msg.body}"</p>
                </div>
              )) : <p className="text-center py-20 text-gray-400">Peti masuk kosong.</p>}
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-serif font-bold text-gold">Studio Raya 2026</h3>
            <p className="text-xs opacity-70 mt-2">Pastikan anda datang 10 minit awal sebelum sesi bermula.</p>
            <div className="mt-8 pt-8 border-t border-white/10">
              <Link to="/booking" className="text-xs font-bold uppercase text-gold hover:underline">Tambah Slot Baru &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF content */}
      <div className="fixed -left-[2000px]">
        <div ref={ticketRef} className="w-[800px] h-[400px] bg-white border-[10px] border-emerald-900 p-10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-serif font-bold text-emerald-900 uppercase">Raya Studio Premium</h2>
              <p className="text-gold font-bold uppercase tracking-[0.3em]">Official Entry Ticket 2026</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">BOOKING ID</p>
              <p className="text-xl font-mono font-bold text-emerald-900">#{latestBooking?.id.split('-').pop()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 items-end">
            <div className="space-y-4">
              <div><p className="text-[10px] text-gray-400 font-bold uppercase">Guest</p><p className="text-2xl font-serif font-bold text-emerald-900">{user.fullName}</p></div>
              <div className="flex gap-10">
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Date</p><p className="text-xl font-serif font-bold text-emerald-900">{latestBooking?.date}</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Time</p><p className="text-xl font-serif font-bold text-emerald-900">{latestBooking?.time}</p></div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="p-3 border-2 border-gold rounded-2xl bg-white"><img src={qrCodeUrl} className="w-24 h-24" alt="QR" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
