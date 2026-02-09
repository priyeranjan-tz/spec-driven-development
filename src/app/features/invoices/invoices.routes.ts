import { Routes } from '@angular/router';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    component: InvoiceListComponent
  },
  {
    path: ':invoiceId',
    component: InvoiceDetailComponent
  }
];
