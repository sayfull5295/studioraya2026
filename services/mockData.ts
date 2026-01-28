
import { User, Booking, TimeSlot, Promo, UserRole, PaymentMethod, StudioSettings, Message } from '../types';

const USERS_KEY = 'raya_studio_users';
const BOOKINGS_KEY = 'raya_studio_bookings';
const PROMOS_KEY = 'raya_studio_promos';
const SETTINGS_KEY = 'raya_studio_settings';
const MESSAGES_KEY = 'raya_studio_messages';

// Communication channel for real-time updates across tabs
const statusChannel = new BroadcastChannel('raya_studio_status');

export const getStoredUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
export const getStoredBookings = (): Booking[] => JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
export const getStoredPromos = (): Promo[] => JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]');
export const getStoredMessages = (): Message[] => JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
export const getStoredSettings = (): StudioSettings => JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"sessionDuration":20,"bufferDuration":10,"openingTime":"10:00","closingTime":"18:00"}');

export const saveUser = (user: User) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const saveBooking = (booking: Booking) => {
  const bookings = getStoredBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  statusChannel.postMessage({ type: 'NEW_BOOKING', payload: booking });
};

export const updateBooking = (updatedBooking: Booking) => {
  const bookings = getStoredBookings();
  const index = bookings.findIndex(b => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    statusChannel.postMessage({ type: 'STATUS_UPDATE', payload: updatedBooking });
  }
};

export const saveMessage = (msg: Message) => {
  const messages = getStoredMessages();
  messages.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  statusChannel.postMessage({ type: 'NEW_MESSAGE', payload: msg });
};

export const validatePromoCode = (code: string, themeId: string): Promo | null => {
  const promos = getStoredPromos();
  const found = promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
  if (!found) return null;
  const expiry = new Date(found.expiryDate);
  if (expiry < new Date()) return null;
  if (found.packageId && found.packageId !== themeId) return null;
  return found;
};

export const generateSlots = (date: string, conceptId: string): TimeSlot[] => {
  const settings = getStoredSettings();
  const slots: TimeSlot[] = [];
  let current = new Date(`${date}T${settings.openingTime}:00`);
  const end = new Date(`${date}T${settings.closingTime}:00`);
  const bookings = getStoredBookings().filter(b => b.date === date && b.conceptId === conceptId);
  while (current < end) {
    const timeStr = current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(current.getTime() + settings.sessionDuration * 60000);
    if (endTime > end) break;
    slots.push({
      id: `${conceptId}-${date}-${timeStr}`,
      date,
      startTime: timeStr,
      endTime: endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      isBooked: bookings.some(b => b.time === timeStr)
    });
    current = new Date(current.getTime() + (settings.sessionDuration + settings.bufferDuration) * 60000);
  }
  return slots;
};

export const listenToUpdates = (callback: (data: any) => void) => {
  statusChannel.onmessage = (event) => callback(event.data);
};
