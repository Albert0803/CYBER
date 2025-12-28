
export enum Currency {
  MGA = 'Ar',
  USD = '$',
  EUR = '€'
}

export interface BusinessInfo {
  name: string;
  owner: string;
  ownerPhoto: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  stat: string;
  cyberPricePerMin: number;
  gamePricePerMin: number;
  currency: Currency;
  isConfigured: boolean;
}

export interface Session {
  id: string;
  type: 'CYBER' | 'GAME';
  startTime: number;
  durationMinutes: number;
  clientName: string;
  isActive: boolean;
  isFinished: boolean;
}

export interface Subscription {
  id: string;
  clientName: string;
  startDate: string;
  endDate: string;
  type: 'PREMIUM' | 'BASIC';
  price: number;
}

export interface Order {
  id: string;
  clientName: string;
  item: string; 
  category: 'FILM' | 'MUSIC' | 'GAME' | 'SOFTWARE';
  price: number;
  status: 'PENDING' | 'COMPLETED';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}
