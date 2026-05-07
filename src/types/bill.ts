export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  category: string;
  recurring: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  contacts: string[];
  cardClosingDay: number; // Novo campo para o dia de fechamento
  alerts: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    vibration: boolean;
    sound: boolean;
    push: boolean;
  };
  contact: {
    phoneNumber: string;
    email: string;
  };
  intervals: {
    first: number;
    second: number;
    third: number;
  };
}