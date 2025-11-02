import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map operator
import { User } from './models/user.model';

interface UserState {
  users: User[];
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _state = new BehaviorSubject<UserState>({
    users: [],
    loading: false,
  });

  readonly users$: Observable<User[]> = this._state.asObservable().pipe(
    map((state: UserState) => state.users) // Explicitly type state
  );
  readonly loading$: Observable<boolean> = this._state.asObservable().pipe(
    map((state: UserState) => state.loading) // Explicitly type state
  );

  public get state(): UserState { // Made state getter public
    return this._state.getValue();
  }

  private setState(newState: Partial<UserState>) {
    this._state.next({ ...this.state, ...newState });
  }

  setLoading(loading: boolean) {
    this.setState({ loading });
  }

  setUsers(users: User[]) {
    this.setState({ users });
  }

  addUser(userData: Omit<User, 'id'>) {
    const newUser: User = {
      id: this.generateUniqueId(),
      name: userData.name,
      language: userData.language,
      bio: userData.bio,
      version: userData.version,
      editing: userData.editing,
    };
    const updatedUsers = [newUser, ...this.state.users];
    this.setUsers(updatedUsers);
  }

  updateUser(updatedUser: User) {
    const updatedUsers = this.state.users.map(u =>
      u.id === updatedUser.id ? updatedUser : u
    );
    this.setUsers(updatedUsers);
  }

  deleteUser(userId: string | number) {
    const updatedUsers = this.state.users.filter(u => u.id !== userId);
    this.setUsers(updatedUsers);
  }

  getUserById(id: string | number): User | undefined {
    const parsedId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return this.state.users.find(user => user && user.id !== undefined && user.id.toString() === parsedId.toString());
  }

  private generateUniqueId(): string {
    return (
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10)
    ).toUpperCase();
  }
}
