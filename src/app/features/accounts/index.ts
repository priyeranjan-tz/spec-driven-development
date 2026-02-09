/**
 * Accounts Feature Module
 * Exports public API for accounts feature
 */

// Routes
export { ACCOUNTS_ROUTES } from './accounts.routes';

// Services
export { AccountsApiService } from './services/accounts-api.service';

// Models
export type { Account } from './models/account.model';
export { AccountType } from './models/account-type.enum';
export { AccountStatus } from './models/account-status.enum';

// Components
export { AccountListComponent } from './pages/account-list/account-list.component';
export { AccountDetailComponent } from './pages/account-detail/account-detail.component';
export { AccountCardComponent } from './components/account-card/account-card.component';
export { AccountSummaryComponent } from './components/account-summary/account-summary.component';
