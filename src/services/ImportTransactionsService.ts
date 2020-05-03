import Transaction from '../models/Transaction';
import fs from "fs";
import path from "path";
import uploadConfig from '../config/upload'
import csvParse from 'csv-parse';

import CreateTransactionService from './CreateTransactionService';
interface Request {
  transactionFileName: string
}
class ImportTransactionsService {
  async execute({ transactionFileName }: Request): Promise<Transaction[]> {

    const csvFilePath = path.resolve(uploadConfig.directory, transactionFileName);
    const lines = await loadCSV(csvFilePath);

    const newTransactions = [];
    for (const transaction of lines) {
      const createTransaction = new CreateTransactionService();
      const newTransaction = await createTransaction.execute({
        title: transaction[0],
        type: transaction[1],
        value: transaction[2],
        category: transaction[3],
        isFromFileImport: true,
      });
      if (newTransaction) {
        newTransactions.push(newTransaction);
      }
    }

    return newTransactions;

  }
}

async function loadCSV(csvFilePath: string): Promise<any[]> {
  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] | PromiseLike<any[]> = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}


export default ImportTransactionsService;
