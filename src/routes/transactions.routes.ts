import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance
  })
});

transactionsRouter.post('/', async (request, response) => {
  const { title, category, type, value } = request.body;
  const createTransaction = new CreateTransactionService();
  const newTransaction = await createTransaction.execute({
    title,
    category,
    type,
    value
  });
  return response.json(newTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.json({ ok: true });
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  console.log('import >>>',  request.file.filename);
  const uploadTransaction = new ImportTransactionsService();

  const transactions = await uploadTransaction.execute({
    transactionFileName: request.file.filename,
  });

  return response.json(transactions);
});

export default transactionsRouter;
