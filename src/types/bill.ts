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
  contacts: string[]; // Nova lista de contatos pré-definidos
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