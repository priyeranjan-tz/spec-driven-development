import { Routes } from '@angular/router';

/**
 * Accounts Feature Routes
 * Guards are applied at the app-level routing
 */
export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/account-list/account-list.component').then(
            (m) => m.AccountListComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/account-detail/account-detail.component').then(
            (m) => m.AccountDetailComponent
          ),
        children: [
          {
            path: 'transactions',
            loadChildren: () =>
              import('../transactions/transactions.routes').then(
                (m) => m.TRANSACTIONS_ROUTES
              )
          },
          {
            path: 'invoices',
            loadChildren: () =>
              import('../invoices/invoices.routes').then(
                (m) => m.INVOICES_ROUTES
              )
          }
        ]
      }
    ]
  }
];
