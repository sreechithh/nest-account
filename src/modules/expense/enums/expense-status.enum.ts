import { registerEnumType } from '@nestjs/graphql';

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

registerEnumType(ExpenseStatus, {
  name: 'ExpenseStatus',
  description: 'The status of an expense',
});
