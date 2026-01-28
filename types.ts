
export type UserRole = 'user' | 'super_admin' | 'admin' | 'support' | 'photographer' | 'editor' | 'marketer';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isBooked: boolean;
  date: string;      // YYYY-MM-DD
}

export type BookingStatus = 'confirmed' | 'arrived' | 'photoshoot_done' | 'editing' | 'completed';
export type PaymentStatus = 'pending' | 'awaiting_verification' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'transfer' | 'qr' | 'online_gateway';

export interface Message {
  id: string;
  userId: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'system' | 'email';
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string; 
  userPhone?: string; 
  slotId: string;
  date: string;
  time: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  price: number;
  conceptId: string;
  receiptBase64?: string;
  transactionId?: string; // For gateway payments
}

export interface Promo {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  isActive: boolean;
  packageId?: string;
}

export interface StudioSettings {
  sessionDuration: number;
  bufferDuration: number;
  openingTime: string;
  closingTime: string;
}
