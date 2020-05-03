import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

import { getCustomRepository, getRepository } from 'typeorm';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string,
  isFromFileImport?: boolean;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    isFromFileImport = false
  }: Request): Promise<Transaction | null> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository
      .findOne({ where: { title: category } })

    let categoryToUse: Category | undefined = categoryExists;

    if (!categoryExists) {
      const newCategory = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      categoryToUse = newCategory;
    }

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (balance.total < value) {
        if (!isFromFileImport) {
          throw new AppError('Not able to create outcome transaction without a valid balance');
        } else {
          return null;
        }
      }
    }

    const newTransaction = await transactionRepository.create({
      category_id: categoryToUse?.id,
      title,
      value,
      type
    });

    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
