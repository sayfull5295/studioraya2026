
import { User, Booking, TimeSlot, Promo, UserRole, PaymentMethod, StudioSettings, Message } from '../types';

const USERS_KEY = 'raya_studio_users';
const BOOKINGS_KEY = 'raya_studio_bookings';
const PROMOS_KEY = 'raya_studio_promos';
const SETTINGS_KEY = 'raya_studio_settings';
const MESSAGES_KEY = 'raya_studio_messages';

const statusChannel = new BroadcastChannel('raya_studio_status');

// Helper to simulate network latency for a "real" feel
const delay = (ms: number = 500) => new Promise(res => setTimeout(res, ms));

export const getStoredUsers = async (): Promise<User[]> => {
  await delay(200);
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getStoredBookings = async (): Promise<Booking[]> => {
  await delay(300);
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
};

export const getStoredMessages = async (userId: string): Promise<Message[]> => {
  await delay(200);
  const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
  return all.filter((m: Message) => m.userId === userId);
};

export const getStoredSettings = (): StudioSettings => {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"sessionDuration":20,"bufferDuration":10,"openingTime":"10:00","closingTime":"18:00"}');
};

export const saveUser = async (user: User) => {
  const users = await getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const saveBooking = async (booking: Booking) => {
  await delay(1000); // Simulate upload time
  const bookings = await getStoredBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  statusChannel.postMessage({ type: 'NEW_BOOKING', payload: booking });
};

export const updateBooking = async (updatedBooking: Booking) => {
  const bookings = await getStoredBookings();
  const index = bookings.findIndex(b => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    statusChannel.postMessage({ type: 'STATUS_UPDATE', payload: updatedBooking });
  }
};

export const saveMessage = async (msg: Message) => {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
  messages.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  statusChannel.postMessage({ type: 'NEW_MESSAGE', payload: msg });
};

export const validatePromoCode = async (code: string, themeId: string): Promise<Promo | null> => {
  const promos = JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]');
  const found = promos.find((p: Promo) => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
  if (!found) return null;
  return found;
};

export const generateSlots = async (date: string, conceptId: string): Promise<TimeSlot[]> => {
  const settings = getStoredSettings();
  const slots: TimeSlot[] = [];
  let current = new Date(`${date}T${settings.openingTime}:00`);
  const end = new Date(`${date}T${settings.closingTime}:00`);
  const bookings = (await getStoredBookings()).filter(b => b.date === date && b.conceptId === conceptId);
  
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
