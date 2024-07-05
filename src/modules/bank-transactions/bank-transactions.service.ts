import { Injectable } from '@nestjs/common';
import { CreateBankTransactionInput } from './dto/create-bank-transaction.input';
import { UpdateBankTransactionInput } from './dto/update-bank-transaction.input';

@Injectable()
export class BankTransactionsService {
  create(createBankTransactionInput: CreateBankTransactionInput) {
    return 'This action adds a new bankTransaction';
  }

  findAll() {
    return `This action returns all bankTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bankTransaction`;
  }

  update(id: number, updateBankTransactionInput: UpdateBankTransactionInput) {
    return `This action updates a #${id} bankTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} bankTransaction`;
  }
}
