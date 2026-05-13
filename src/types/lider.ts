export interface LiderExpense {
  id: string;
  description: string;
  amount: number;
  due_date: Date;
  type: 'domain' | 'migration' | 'website' | 'system' | 'other';
  status: 'pending' | 'paid';
}

export interface LiderSystemPayment {
  id: string;
  month_year: string;
  amount: number;
  status: 'pending' | 'paid';
  due_date: Date;
}