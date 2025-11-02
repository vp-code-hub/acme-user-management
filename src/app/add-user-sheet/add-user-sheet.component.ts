import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-add-user-sheet',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-user-sheet.component.html',
  styleUrls: ['./add-user-sheet.component.css'],
})
export class AddUserSheetComponent {
  newUser: Omit<User, 'id' | 'version'> = { name: '', language: '', bio: '' };
  isOpen: boolean = false;

  @Output() userAdded = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  openSheet() {
    this.isOpen = true;
  }

  closeSheet() {
    this.isOpen = false;
    this.newUser = { name: '', language: '', bio: '' }; // Reset form
  }

  onSubmit() {
    this.userService.addUser({ ...this.newUser, version: 1.0 });
    this.userAdded.emit();
    this.closeSheet();
  }
}
