import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = this.find();

    const income = (await transactions)
      .reduce((prev: number, transaction: Transaction) =>{

        return transaction.type === 'income' ?
          prev + Number(transaction.value) :
          prev},
        0.00);

    const outcome = (await transactions)
      .reduce((prev: number, transaction: Transaction) =>
        transaction.type === 'outcome' ?
          prev + Number(transaction.value) :
          prev,
        0.00);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    }
  }
}

export default TransactionsRepository;
