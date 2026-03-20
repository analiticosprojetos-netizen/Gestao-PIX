export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  category: string;
}

export interface AppSettings {
  alerts: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    vibration: boolean;
    sound: boolean;
    push: boolean;
  };
  intervals: {
    first: number;
    second: number;
    third: number;
  };
}