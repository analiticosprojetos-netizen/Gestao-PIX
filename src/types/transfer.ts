export interface Transfer {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  date: Date;
  friend_name: string;
  receipt_url?: string;
  type: 'in' | 'out';
  status: 'pending' | 'completed';
}

export interface CardTransaction {
  id: string;
  description: string;
  total_amount: number;
  installments_count: number;
  recipient_name: string;
  purchase_date: Date;
  closing_day: number;
}

export interface CardInstallment {
  id: string;
  transaction_id: string;
  number: number;
  amount: number;
  due_date: Date;
  status: 'pending' | 'paid';
}