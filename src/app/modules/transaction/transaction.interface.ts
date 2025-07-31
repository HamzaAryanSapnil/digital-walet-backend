// {
//   "type": "send_money",
//   "amount": 200,
//   "from": "user123",
//   "to": "user456",
//   "fee": 5,
//   "status": "completed",
//   "createdAt": "2025-07-29T06:00:00Z"
// }

import { Types } from "mongoose";


// Enum for Transaction Type
export enum TransactionType {
  ADD_MONEY = 'ADD_MONEY',
  WITHDRAW = 'WITHDRAW',
  SEND_MONEY = 'SEND_MONEY',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
}

// Enum for Transaction Status
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
}

// Interface
export interface ITransaction { 
  _id?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  fee?: number; 
  commission?: number; 
  from?: Types.ObjectId; 
  to?: Types.ObjectId;   
  status: TransactionStatus;
}





