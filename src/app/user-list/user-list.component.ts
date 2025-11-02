import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: [] // Removed reference to user-list.component.css
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]> | undefined;
  headers: string[] = [];
  loading$: Observable<boolean> | undefined;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.users$ = this.userService.users$.pipe(
      map(users => {
        if (users.length > 0) {
          this.headers = Object.keys(users[0]);
        }
        return users.map(user => ({...user, editing: false}));
      })
    );
    this.loading$ = this.userService.loading$;
  }

  editUser(user: User, field: string, event: any): void {
    const updatedUser = { ...user, [field]: event.target.textContent };
    this.userService.updateUser(updatedUser);
  }

  deleteUser(user: User): void {
    this.userService.deleteUser(user.id);
  }

  getPropertyValue(user: User, key: string): any {
    return (user as any)[key];
  }
}
