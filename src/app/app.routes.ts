import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth.guard';
// import { tenantGuard } from './core/guards/tenant.guard';

/**
 * Main application routes with lazy loading
 * TODO: Re-enable auth and tenant guards after implementing authentication
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'accounts',
    pathMatch: 'full'
  },
  {
    path: 'accounts',
    // canActivate: [authGuard, tenantGuard], // Temporarily disabled for development
    loadChildren: () => import('./features/accounts/accounts.routes').then(m => m.ACCOUNTS_ROUTES)
  },
  {
    path: 'transactions',
    // canActivate: [authGuard, tenantGuard], // Temporarily disabled for development
    loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES)
  },
  {
    path: 'invoices',
    // canActivate: [authGuard, tenantGuard], // Temporarily disabled for development
    loadChildren: () => import('./features/invoices/invoices.routes').then(m => m.INVOICES_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'accounts'
  }
];
