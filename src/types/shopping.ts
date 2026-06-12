"use client";

export interface ShoppingItem {
  id: string;
  created_at?: string;
  name: string;
  quantity: number;
  checked: boolean;
  price: number;
  category?: string;
}