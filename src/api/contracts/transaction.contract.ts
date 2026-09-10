import { Transaction, TransactionStatus, ULPIN } from '@/types';

export interface TransactionFilterParams {
  citizenId?: string;
  status?: TransactionStatus | 'all';
  ulpin?: ULPIN;
}

export interface TransactionService {
  getTransactions(params?: TransactionFilterParams): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
}
