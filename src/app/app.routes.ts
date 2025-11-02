import { Routes } from '@angular/router';
import { UserTableComponent } from './user-table/user-table.component';
import { UserDetailComponent } from './user-detail/user-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserTableComponent },
  { path: 'users/:id', component: UserDetailComponent },
];

