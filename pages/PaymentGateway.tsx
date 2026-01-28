
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStoredBookings, updateBooking, saveMessage } from '../services/api';
import { getEmailConfirmationMessage } from '../services/geminiService';
import { Message } from '../types';

const BANKS = [
  { id: 'mbb', name: 'Maybank2u', color: 'bg-yellow-400' },
  { id: 'cimb', name: 'CIMB Clicks', color: 'bg-red-600' },
  { id: 'pbb', name: 'Public Bank', color: 'bg-red-700' },
  { id: 'rhb', name: 'RHB Now', color: 'bg-blue-700' },
  { id: 'hlb', name: 'Hong Leong Connect', color: 'bg-blue-900' }
];

const PaymentGateway: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  
  const [step, setStep] = useState<'bank_selection' | 'processing' | 'success'>('bank_selection');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handlePay = async () => {
    if (!selectedBank) return;
    setStep('processing');
    
    // Simulate gateway delay
    await new Promise(r => setTimeout(r, 2500));
    
    const bookings = await getStoredBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
      // 1. Mark as Paid Instantly
      const updated = { ...booking, paymentStatus: 'paid' as any, transactionId: `TXN-${Date.now()}` };
      await updateBooking(updated);

      // 2. Automated Festive Greeting via Gemini
      const emailBody = await getEmailConfirmationMessage(booking.userName || 'Pelanggan', bookingId?.split('-').pop() || '');
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        userId: booking.userId,
        subject: 'Pembayaran Diterima: Tiket Anda Telah Sedia!',
        body: emailBody,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'email'
      };
      await saveMessage(newMessage);
    }
    
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-12 rounded-[3.5rem] shadow-2xl text-center space-y-6 animate-reveal">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-emerald-900">Bayaran Berjaya!</h1>
            <p className="text-gray-500 font-medium">Transaksi anda telah disahkan secara automatik.</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-3xl text-left border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">Resit Digital</p>
            <div className="flex justify-between text-sm font-bold text-emerald-900">
              <span>Booking ID</span>
              <span>#{bookingId?.split('-').pop()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-900">
              <span>Jumlah</span>
              <span>RM {amount}</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 transition-all hover:scale-105">Kembali ke Dashboard &rarr;</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-gray-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-xs italic">FPX</div>
             <span className="text-sm font-bold tracking-tight">Secure Checkout</span>
          </div>
          <div className="text-xs font-medium text-gray-400">Order #{bookingId?.split('-').pop()}</div>
        </div>

        <div className="p-8 space-y-8">
          {step === 'bank_selection' ? (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount to Pay</p>
                <h2 className="text-4xl font-serif font-bold text-gray-900">RM {amount}</h2>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Your Bank</p>
                <div className="grid grid-cols-1 gap-2">
                  {BANKS.map(bank => (
                    <button key={bank.id} onClick={() => setSelectedBank(bank.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedBank === bank.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 hover:border-gray-200'}`}>
                       <div className={`w-8 h-8 rounded ${bank.color}`}></div>
                       <span className="font-bold text-gray-700 text-sm">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={!selectedBank} onClick={handlePay} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 transition-all hover:bg-emerald-700">Bayar Secara Selamat</button>
              <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-2 uppercase font-bold tracking-widest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                SSL SECURED ENCRYPTION
              </p>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
               <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="text-center space-y-2">
                 <h3 className="text-xl font-bold text-gray-900 italic">Processing Transaction...</h3>
                 <p className="text-sm text-gray-500">Sila jangan tutup tetingkap ini sehingga selesai.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
