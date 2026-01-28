
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { generateSlots, saveBooking, saveUser, validatePromoCode } from '../services/mockData';
import { TimeSlot, User, Promo, Booking as BookingType, PaymentMethod } from '../types';
import { KetupatIcon } from '../constants';

const BANK_DETAILS = {
  bankName: 'MAYBANK BERHAD',
  accountName: 'THREESIXTY STUDIO SDN BHD',
  accountNo: '5648 1111 2222'
};

const QR_PAYMENT_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DuitNow_Payment_Demo_Threesixty_Studio';

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
  
  const schedulerRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null') as User | null;
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [familyCount, setFamilyCount] = useState<number>(1);
  const [isDoubleSlot, setIsDoubleSlot] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [authData, setAuthData] = useState({ fullName: '', email: '', phone: '' });

  useEffect(() => {
    setSelectedSlot(null);
    setSlots(generateSlots(selectedDate, themeId));
  }, [selectedDate, themeId]);

  const handleApplyPromo = () => {
    const promo = validatePromoCode(promoCodeInput, themeId);
    if (promo) setAppliedPromo(promo);
    else alert('Kod tidak sah.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const totalPrice = Math.max(0, (isDoubleSlot ? selectedConceptData.price * 2 : selectedConceptData.price) - (appliedPromo?.discountValue || 0));

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptBase64) return alert('Sila muat naik resit.');
    setUploading(true);

    await new Promise(r => setTimeout(r, 1500));
    let userToUse = currentUser;
    if (!currentUser) {
      userToUse = { id: `user-${Date.now()}`, ...authData, role: 'user' };
      saveUser(userToUse);
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
      paymentStatus: 'awaiting_verification',
      paymentMethod,
      price: totalPrice,
      conceptId: selectedConceptData.id,
      receiptBase64
    };

    saveBooking(bookingData);
    setStep('success');
    setUploading(false);
  };

  if (step === 'success') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8 animate-reveal">
        <div className="inline-block p-6 bg-emerald-100 rounded-full mb-2">
            <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-4xl font-serif font-bold text-emerald-900">Pembayaran Dihantar</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">Terima kasih! Kami akan mengesahkan resit anda secepat mungkin.</p>
        <Link to="/dashboard" className="inline-block bg-emerald-900 text-white px-10 py-5 rounded-2xl font-bold shadow-xl">Semak Dashboard</Link>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-reveal">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-50">
          <div className="bg-emerald-900 p-10 text-white">
            <h1 className="text-3xl font-serif font-bold">Langkah Terakhir: Bayaran</h1>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setPaymentMethod('transfer')} className={`p-6 rounded-[2rem] border-2 ${paymentMethod === 'transfer' ? 'border-gold bg-gold/5' : 'border-gray-100 opacity-60'}`}>Bank Transfer</button>
              <button onClick={() => setPaymentMethod('qr')} className={`p-6 rounded-[2rem] border-2 ${paymentMethod === 'qr' ? 'border-gold bg-gold/5' : 'border-gray-100 opacity-60'}`}>QR Payment</button>
            </div>
            <div className="bg-cream p-10 rounded-[2.5rem] border-2 border-dashed border-gold/30 flex flex-col md:flex-row items-center justify-between gap-8">
              {paymentMethod === 'transfer' ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase">Bank Account</p>
                  <p className="text-2xl font-serif font-bold text-emerald-900">{BANK_DETAILS.bankName}</p>
                  <p className="text-3xl font-mono font-bold text-gold">{BANK_DETAILS.accountNo}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <img src={QR_PAYMENT_URL} className="w-40 h-40 rounded-xl" alt="QR" />
                  <p className="text-[10px] font-bold text-gold uppercase">Scan with DuitNow</p>
                </div>
              )}
              <div className="bg-emerald-900 text-white p-6 rounded-2xl text-center min-w-[150px]">
                <p className="text-xs text-gold font-bold">JUMLAH</p>
                <p className="text-3xl font-serif font-bold">RM {totalPrice}</p>
              </div>
            </div>
            <form onSubmit={handleUploadReceipt} className="space-y-6">
              <div className="relative group p-10 border-4 border-dashed rounded-[2.5rem] bg-gray-50 flex flex-col items-center justify-center">
                <input type="file" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 3v12" /></svg>
                <p className="font-bold text-emerald-900">{receiptFile ? receiptFile.name : 'Upload Resit Sini'}</p>
              </div>
              <button disabled={uploading} className="w-full bg-gold text-emerald-900 py-6 rounded-2xl font-bold text-xl shadow-lg">
                {uploading ? 'Memproses...' : 'Hantar Tempahan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-reveal">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-4xl font-serif font-bold text-emerald-900">Pilih Slot Masa</h2>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 rounded-xl border-2 border-emerald-100" />
          <div className="grid grid-cols-3 gap-3">
            {slots.map(s => (
              <button key={s.id} disabled={s.isBooked} onClick={() => setSelectedSlot(s)} className={`p-4 rounded-xl border-2 ${s.isBooked ? 'bg-gray-100 opacity-50' : selectedSlot?.id === s.id ? 'border-gold bg-gold/5' : 'border-emerald-50'}`}>
                {s.startTime}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-8">
          <h3 className="text-2xl font-serif font-bold">Butiran Pelanggan</h3>
          {!currentUser && (
            <div className="space-y-4">
              <input type="text" placeholder="Nama Penuh" onChange={e => setAuthData({...authData, fullName: e.target.value})} className="w-full p-4 rounded-xl border" />
              <input type="email" placeholder="Email" onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full p-4 rounded-xl border" />
              <input type="tel" placeholder="Telefon" onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full p-4 rounded-xl border" />
            </div>
          )}
          {selectedSlot && (
            <button onClick={() => setStep('payment')} className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold">Teruskan ke Bayaran (RM {totalPrice})</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
