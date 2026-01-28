
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { generateSlots, saveBooking, saveUser, validatePromoCode } from '../services/api';
import { TimeSlot, User, Promo, Booking as BookingType, PaymentMethod } from '../types';

const CONCEPTS = [
  { id: 'muji', title: 'Modern Muji', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800', price: 199 },
  { id: 'moden', title: 'Moden Estetik', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800', price: 299 },
  { id: 'taman', title: 'Taman Cahaya', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800', price: 149 }
];

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme') || 'muji';
  const selectedConceptData = CONCEPTS.find(c => c.id === themeId) || CONCEPTS[0];
  
  const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null') as User | null;
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_gateway');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [authData, setAuthData] = useState({ fullName: '', email: '', phone: '' });

  useEffect(() => {
    generateSlots(selectedDate, themeId).then(setSlots);
  }, [selectedDate, themeId]);

  const totalPrice = Math.max(0, selectedConceptData.price - (appliedPromo?.discountValue || 0));

  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    let userToUse = currentUser;
    if (!currentUser) {
      userToUse = { id: `user-${Date.now()}`, ...authData, role: 'user' };
      await saveUser(userToUse);
      localStorage.setItem('current_user', JSON.stringify(userToUse));
    }

    const bookingData: BookingType = {
      id: `book-${Date.now()}`,
      userId: userToUse!.id,
      userName: userToUse!.fullName,
      userPhone: userToUse!.phone,
      slotId: selectedSlot!.id,
      date: selectedSlot!.date,
      time: selectedSlot!.startTime,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'online_gateway' ? 'pending' : 'awaiting_verification',
      paymentMethod,
      price: totalPrice,
      conceptId: selectedConceptData.id,
      receiptBase64: paymentMethod === 'transfer' ? receiptBase64 : undefined
    };

    await saveBooking(bookingData);

    if (paymentMethod === 'online_gateway') {
      // Simulate redirecting to a payment gateway
      navigate(`/payment-gateway?bookingId=${bookingData.id}&amount=${totalPrice}`);
    } else {
      navigate('/dashboard');
    }
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-reveal">
      {step === 'details' ? (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold text-emerald-900">Pilih Slot Masa</h2>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 space-y-6">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-emerald-50 focus:border-gold outline-none transition-all" />
              <div className="grid grid-cols-3 gap-3">
                {slots.map(s => (
                  <button key={s.id} disabled={s.isBooked} onClick={() => setSelectedSlot(s)} className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${s.isBooked ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed' : selectedSlot?.id === s.id ? 'border-gold bg-gold text-white' : 'border-emerald-50 text-emerald-900 hover:border-gold'}`}>
                    {s.startTime}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-8 border border-emerald-50">
            <h3 className="text-2xl font-serif font-bold text-emerald-900">Maklumat Tempahan</h3>
            <div className="space-y-4">
              {!currentUser && (
                <>
                  <input type="text" placeholder="Nama Penuh" onChange={e => setAuthData({...authData, fullName: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
                  <input type="email" placeholder="Email" onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
                  <input type="tel" placeholder="Telefon" onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
                </>
              )}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Konsep Pilihan</p>
                  <p className="font-bold text-emerald-900">{selectedConceptData.title}</p>
                </div>
                <p className="text-xl font-serif font-bold text-gold">RM {totalPrice}</p>
              </div>
            </div>
            {selectedSlot && (
              <button onClick={() => setStep('payment')} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:scale-[1.02] transition-all">Teruskan ke Bayaran &rarr;</button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
           <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-emerald-50">
             <div className="bg-emerald-900 p-10 text-white flex justify-between items-center">
               <h1 className="text-3xl font-serif font-bold">Pilih Cara Bayaran</h1>
               <button onClick={() => setStep('details')} className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest">&larr; Kembali</button>
             </div>
             <div className="p-10 space-y-8">
               <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => setPaymentMethod('online_gateway')} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'online_gateway' ? 'border-gold bg-gold/5' : 'border-gray-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-emerald-900">Perbankan Atas Talian / Kad</p>
                        <p className="text-xs text-gray-400">FPX, Visa, Mastercard (Segera)</p>
                      </div>
                    </div>
                    {paymentMethod === 'online_gateway' && <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                 </button>

                 <button onClick={() => setPaymentMethod('transfer')} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'transfer' ? 'border-gold bg-gold/5' : 'border-gray-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-emerald-900">Pindahan Bank Manual</p>
                        <p className="text-xs text-gray-400">Muat naik resit (Perlu pengesahan 24j)</p>
                      </div>
                    </div>
                    {paymentMethod === 'transfer' && <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                 </button>
               </div>

               {paymentMethod === 'transfer' && (
                 <div className="animate-reveal p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sila muat naik resit pembayaran</p>
                    <input type="file" required onChange={handleFileChange} className="w-full text-xs font-medium text-emerald-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-900 file:text-white hover:file:bg-emerald-800" />
                 </div>
               )}

               <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                 <div className="text-emerald-900/60 text-sm font-medium">Jumlah Bayaran</div>
                 <div className="text-3xl font-serif font-bold text-emerald-900">RM {totalPrice}</div>
               </div>

               <button disabled={isProcessing} onClick={handleFinalizeBooking} className="w-full bg-gold text-emerald-900 py-6 rounded-3xl font-bold text-xl shadow-xl shadow-gold/10 hover:scale-[1.02] transition-all">
                 {isProcessing ? 'Sila tunggu...' : paymentMethod === 'online_gateway' ? 'Bayar Sekarang &rarr;' : 'Hantar Tempahan &rarr;'}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
