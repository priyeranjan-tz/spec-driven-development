import { Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    component: TransactionListComponent
  },
  {
    path: ':ledgerEntryId',
    component: TransactionDetailComponent
  }
];
