
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
export type PaymentStatus = 'pending' | 'awaiting_verification' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'qr' | 'online_card';

export interface Message {
  id: string;
  userId: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'system' | 'email';
}

export interface PrintOrder {
  id: string;
  photoNumber: string;
  size: string;
  orientation: 'portrait' | 'landscape';
  quantity: number;
  unitPrice: number;
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
  discountApplied?: number;
  promoCode?: string;
  conceptId: string;
  googlePhotosLink?: string;
  internalNotes?: string;
  printOrders?: PrintOrder[];
  receiptUrl?: string; // Original URL
  receiptBase64?: string; // Actual binary data for "alive" feel
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
