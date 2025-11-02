import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './models/user.model';

interface UserState {
  users: User[];
  loading: boolean;
}

const LOCAL_STORAGE_KEY = 'user_management_users';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _state = new BehaviorSubject<UserState>(this.getInitialState());

  readonly users$: Observable<User[]> = this._state.asObservable().pipe(
    map((state: UserState) => state.users)
  );
  readonly loading$: Observable<boolean> = this._state.asObservable().pipe(
    map((state: UserState) => state.loading)
  );

  public get state(): UserState {
    return this._state.getValue();
  }

  private getInitialState(): UserState {
    if (typeof localStorage !== 'undefined') {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          return { users, loading: false };
        } catch (e) {
          console.error("Error parsing users from localStorage", e);
        }
      }
    }
    return { users: [], loading: false };
  }

  private setState(newState: Partial<UserState>) {
    this._state.next({ ...this.state, ...newState });
    if (newState.users !== undefined && typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState.users));
    }
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
