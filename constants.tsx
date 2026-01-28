
import React from 'react';

export const COLORS = {
  emerald: '#064e3b',
  gold: '#d4af37',
  cream: '#fdfcf0',
};

export const STRINGS = {
  appName: 'Raya Studio Premium',
  tagline: 'Abadikan Memori Indah Aidilfitri',
  cta: 'Tempah Slot Sekarang',
  sessionPrice: 'RM 199',
  sessionDuration: '20 Minit',
  operatingHours: '10:00 AM - 6:00 PM',
};

export const KetupatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
    <path d="M2 12h20M12 2v20" />
    <path d="M7 7l10 10M17 7L7 17" />
  </svg>
);

export const CrescentIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3c.132 0 .263 0 .393.007a9 9 0 0 0 9.426 12.03A9.006 9.006 0 0 1 12 21a9 9 0 1 1 0-18z" />
  </svg>
);

export const PelitaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M8 4l2 2M16 4l-2 2M12 10c-3 0-5 2-5 5h10c0-3-2-5-5-5zM7 15v5h10v-5M10 20v2M14 20v2" />
  </svg>
);
