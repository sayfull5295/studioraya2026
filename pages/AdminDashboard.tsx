
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredBookings, updateBooking, getStoredUsers, saveMessage, listenToUpdates } from '../services/mockData';
import { getEmailConfirmationMessage } from '../services/geminiService';
import { User, Booking, BookingStatus, Message } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null') as User | null;
  const [activeModule, setActiveModule] = useState<'schedule' | 'payments'>('schedule');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomReceipt, setZoomReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role === 'user') return navigate('/');
    refreshData();
    listenToUpdates(refreshData);
  }, [currentUser]);

  const refreshData = () => {
    setBookings(getStoredBookings());
    setUsers(getStoredUsers());
  };

  const handleApprovePayment = async (booking: Booking) => {
    if (!confirm(`Sahkan bayaran RM${booking.price} untuk ${booking.userName}?`)) return;
    setIsProcessing(true);

    // 1. Update Booking
    updateBooking({ ...booking, paymentStatus: 'paid', status: 'confirmed' });

    // 2. Draft Email via Gemini
    const emailBody = await getEmailConfirmationMessage(booking.userName || 'Pelanggan', booking.id.split('-').pop() || '');

    // 3. Save to User Inbox (The "Alive" part)
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: booking.userId,
      subject: 'Pembayaran Disahkan: Sila Muat Turun Tiket Raya Anda',
      body: emailBody,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'email'
    };
    saveMessage(newMessage);

    setIsProcessing(false);
    alert('Pembayaran disahkan dan emel simulasi telah dihantar ke dashboard pelanggan.');
    refreshData();
  };

  const pendingPayments = bookings.filter(b => b.paymentStatus === 'awaiting_verification');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-emerald-950 text-white p-6 space-y-8">
        <h2 className="text-gold font-serif text-xl font-bold">Staff Portal</h2>
        <nav className="space-y-2">
          <button onClick={() => setActiveModule('schedule')} className={`w-full text-left px-4 py-3 rounded-xl ${activeModule === 'schedule' ? 'bg-gold text-emerald-950' : 'text-emerald-100/60'}`}>Jadual Sesi</button>
          <button onClick={() => setActiveModule('payments')} className={`w-full text-left px-4 py-3 rounded-xl relative ${activeModule === 'payments' ? 'bg-gold text-emerald-950' : 'text-emerald-100/60'}`}>
            Pengesahan Bayaran {pendingPayments.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingPayments.length}</span>}
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-10 space-y-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-900 capitalize">{activeModule === 'schedule' ? 'Daily Schedule' : 'Verify Payments'}</h1>

        {activeModule === 'schedule' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            {bookings.filter(b => b.paymentStatus === 'paid').length > 0 ? (
              <div className="space-y-4">
                {bookings.filter(b => b.paymentStatus === 'paid').map(b => (
                  <div key={b.id} className="p-5 border rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xl font-serif font-bold text-gold">{b.time}</p>
                      <p className="font-bold text-emerald-900">{b.userName}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-900 text-white text-[9px] font-bold uppercase rounded-full">{b.status}</div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic">Tiada sesi berbayar hari ini.</p>}
          </div>
        )}

        {activeModule === 'payments' && (
          <div className="space-y-6">
            {pendingPayments.length > 0 ? pendingPayments.map(b => (
              <div key={b.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8">
                <div className="w-48 h-64 bg-gray-100 rounded-3xl overflow-hidden cursor-zoom-in group relative" onClick={() => setZoomReceipt(b.receiptBase64 || null)}>
                  <img src={b.receiptBase64 || 'https://via.placeholder.com/200x300'} className="w-full h-full object-cover" alt="Receipt" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity font-bold">KLIK ZOOM</div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Pelanggan</p><p className="font-bold">{b.userName}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Jumlah</p><p className="text-xl font-serif font-bold text-gold">RM {b.price}</p></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Slot</p><p className="font-medium text-sm">{b.date} @ {b.time}</p></div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t">
                    <button disabled={isProcessing} onClick={() => handleApprovePayment(b)} className="flex-1 bg-emerald-900 text-white py-4 rounded-xl font-bold uppercase text-xs">Sahkan Bayaran</button>
                    <button className="flex-1 bg-red-50 text-red-500 py-4 rounded-xl font-bold uppercase text-xs">Tolak</button>
                  </div>
                </div>
              </div>
            )) : <p className="text-center py-20 text-gray-400">Tiada bayaran baru.</p>}
          </div>
        )}

        {zoomReceipt && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-10 cursor-zoom-out" onClick={() => setZoomReceipt(null)}>
            <img src={zoomReceipt} className="max-h-full max-w-full rounded-2xl shadow-2xl" alt="Zoom" />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
