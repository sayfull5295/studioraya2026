import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateSlots, saveBooking, saveUser } from '../services/api';
import { TimeSlot, User, Booking as BookingType, PaymentMethod } from '../types';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authData, setAuthData] = useState({ fullName: '', email: '', phone: '' });

  useEffect(() => {
    generateSlots(selectedDate, themeId).then(setSlots);
  }, [selectedDate, themeId]);

  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
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
      slotId: selectedSlot.id,
      date: selectedSlot.date,
      time: selectedSlot.startTime,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'online_card' ? 'pending' : 'awaiting_verification',
      paymentMethod,
      price: selectedConceptData.price,
      conceptId: selectedConceptData.id
    };

    await saveBooking(bookingData);
    
    if (paymentMethod === 'online_card') {
      navigate(`/payment-gateway?bookingId=${bookingData.id}&amount=${selectedConceptData.price}`);
    } else {
      navigate('/dashboard');
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-reveal">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-4xl font-serif font-bold text-emerald-900">Pilih Slot Masa</h2>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 space-y-6">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-emerald-50 focus:border-gold outline-none" />
            <div className="grid grid-cols-3 gap-3">
              {slots.map(s => (
                <button key={s.id} disabled={s.isBooked} onClick={() => setSelectedSlot(s)} className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${s.isBooked ? 'bg-gray-100 opacity-50 cursor-not-allowed' : selectedSlot?.id === s.id ? 'border-gold bg-gold text-white' : 'border-emerald-50 text-emerald-900 hover:border-gold'}`}>
                  {s.startTime}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-8 border border-emerald-50">
          <h3 className="text-2xl font-serif font-bold text-emerald-900">Maklumat Tempahan</h3>
          {!currentUser && (
            <div className="space-y-4">
              <input type="text" placeholder="Nama Penuh" onChange={e => setAuthData({...authData, fullName: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
              <input type="email" placeholder="Email" onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
              <input type="tel" placeholder="Telefon" onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 ring-gold/20" />
            </div>
          )}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <p className="font-bold text-emerald-900">{selectedConceptData.title}</p>
            <p className="text-xl font-serif font-bold text-gold">RM {selectedConceptData.price}</p>
          </div>
          <div className="space-y-3">
             <button onClick={() => setPaymentMethod('online_card')} className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between ${paymentMethod === 'online_card' ? 'border-gold bg-gold/5' : 'border-gray-100'}`}>
                <span className="font-bold text-emerald-900">Perbankan Atas Talian / Kad</span>
                {paymentMethod === 'online_card' && <span className="text-gold">✓</span>}
             </button>
             <button onClick={() => setPaymentMethod('transfer')} className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between ${paymentMethod === 'transfer' ? 'border-gold bg-gold/5' : 'border-gray-100'}`}>
                <span className="font-bold text-emerald-900">Pindahan Manual (Bank-in)</span>
                {paymentMethod === 'transfer' && <span className="text-gold">✓</span>}
             </button>
          </div>
          {selectedSlot && (
            <button disabled={isProcessing} onClick={handleFinalizeBooking} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:scale-[1.02] transition-all">
              {isProcessing ? 'Sila tunggu...' : 'Hantar Tempahan &rarr;'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;