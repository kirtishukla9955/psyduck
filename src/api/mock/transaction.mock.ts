import { TransactionService, TransactionFilterParams } from '../contracts/transaction.contract';
import { mockStore } from './mockStore';
import { Transaction } from '@/types';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockTransactionService implements TransactionService {
  async getTransactions(params?: TransactionFilterParams): Promise<Transaction[]> {
    await delay();
    let list = mockStore.getTransactions();

    if (!params) return list;

    if (params.status && params.status !== 'all') {
      list = list.filter((t) => t.status === params.status);
    }

    if (params.ulpin) {
      list = list.filter((t) => t.parcelUlpin.toLowerCase() === params.ulpin!.trim().toLowerCase());
    }

    return list;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    await delay();
    return mockStore.getTransactionById(id);
  }
}
