import AppError from '../errors/AppError';

import { getRepository } from "typeorm";

import Transaction from "../models/Transaction";

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new AppError('Transaction does not exists.')
    }

    await transactionRepository.delete(transaction.id);
  }
}

export default DeleteTransactionService;
