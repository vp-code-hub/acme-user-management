import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddUserSheetComponent } from '../add-user-sheet/add-user-sheet.component';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddUserSheetComponent],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css'],
})
export class UserTableComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading: boolean = true;
  private userSubscription!: Subscription;
  private loadingSubscription!: Subscription;

  // Pagination and Sorting
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizes: number[] = [10, 20, 30, 40, 50];
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterValue: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.users$.subscribe((users) => {
      this.users = users;
      this.applyFiltersAndSort();
      console.log('UserTableComponent: Users updated, count:', users.length);
    });
    this.loadingSubscription = this.userService.loading$.subscribe((loading) => {
      this.loading = loading;
      console.log('UserTableComponent: Loading state updated to:', loading);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
  }

  // Data manipulation methods
  onDeleteUser(userId: string | number): void {
    this.userService.deleteUser(userId);
  }

  onViewUser(userId: string | number): void {
    this.router.navigate(['/users', userId]);
  }

  // Table logic
  get paginatedUsers(): User[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAndSortedUsers.slice(start, end);
  }

  get filteredAndSortedUsers(): User[] {
    let filtered = this.users.filter(user =>
      user.name.toLowerCase().includes(this.filterValue.toLowerCase()) ||
      user.language.toLowerCase().includes(this.filterValue.toLowerCase()) ||
      user.bio.toLowerCase().includes(this.filterValue.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = (a as any)[this.sortColumn];
      const bValue = (b as any)[this.sortColumn];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0; // Reset to first page when page size changes
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onFilterChange(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.currentPage = 0; // Reset to first page when filter changes
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    // This method is called to re-evaluate filteredAndSortedUsers and paginatedUsers
    // No explicit action needed here, as getters will re-calculate when accessed.
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAndSortedUsers.length / this.pageSize);
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i);
  }

  // Placeholder for mobile check, will implement later if needed
  isMobile(): boolean {
    return window.innerWidth < 768; // Example breakpoint
  }

  // Editable Cell logic (simplified for now)
  onCellEdit(user: User, field: keyof User, event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    const updatedUser = { ...user, [field]: newValue };
    this.userService.updateUser(updatedUser);
  }
}
