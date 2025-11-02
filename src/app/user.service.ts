import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, switchMap, catchError } from 'rxjs/operators';
import { User } from './models/user.model';
import { ToastService } from './services/toast.service';
import { UserStore } from './user.store'; // Import the new UserStore

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private localDataUrl = 'assets/user-data.json';
  private remoteDataUrl = 'assets/64KB.json';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private userStore: UserStore // Inject UserStore
  ) {
    this.loadUsers();
  }

  // Expose store observables
  get users$(): Observable<User[]> {
    return this.userStore.users$;
  }

  get loading$(): Observable<boolean> {
    return this.userStore.loading$;
  }

  private loadUsers() {
    this.userStore.setLoading(true);

    this.http.get<any[]>(this.localDataUrl).pipe(
      map(data => data.map((user: any, index: number) => ({
        id: user.id ?? index + 1,
        name: user.name ?? 'Unknown',
        language: user.language ?? 'N/A',
        bio: user.bio ?? 'No bio available.',
        version: user.version ?? 1.0,
      }))),
      catchError(error => {
        console.warn(`Could not load initial data from ${this.localDataUrl}. Starting with empty list.`, error);
        return of([]);
      }),
      switchMap(initialUsers => {
        this.userStore.setUsers(initialUsers);
        this.userStore.setLoading(false);

        return of(initialUsers).pipe(
          delay(3000),
          switchMap(() => this.http.get<any[]>(this.remoteDataUrl).pipe(
            map(remoteData => remoteData.map((user: any, index: number) => ({
              id: user.id ?? index + 1,
              name: user.name ?? 'Unknown',
              language: user.language ?? 'N/A',
              bio: user.bio ?? 'No bio available.',
              version: user.version ?? 1.0,
            }))),
            catchError(error => {
              console.error(`Error loading remote data from ${this.remoteDataUrl}.`, error);
              return of([]);
            })
          ))
        );
      })
    ).subscribe({
      next: (remoteUsers) => {
        const currentUsers = this.userStore.state.users;
        const currentUsersMap = new Map<string | number, User>(currentUsers.map(u => [u.id, u]));

        let updated = false;
        remoteUsers.forEach(remoteUser => {
          if (!currentUsersMap.has(remoteUser.id)) {
            currentUsersMap.set(remoteUser.id, remoteUser);
            updated = true;
          }
        });

        if (updated) {
          const mergedUsers = Array.from(currentUsersMap.values());
          this.userStore.setUsers(mergedUsers);
          this.toastService.show({
            title: 'Data Synchronized',
            description: 'Missing data updated from remote source.',
            type: 'info'
          });
        }
        this.userStore.setLoading(false);
      },
      error: (err) => {
        console.error('Error during user data synchronization:', err);
        this.userStore.setLoading(false);
      }
    });
  }

  addUser(userData: Omit<User, 'id'>) {
    this.userStore.addUser(userData);
    this.toastService.show({
      title: 'User added',
      description: `${userData.name} has been successfully added.`,
      type: 'success'
    });
  }

  updateUser(updatedUser: User) {
    this.userStore.updateUser(updatedUser);
    this.toastService.show({
      title: 'User updated',
      description: `User ${updatedUser.name} has been successfully updated.`,
      type: 'success'
    });
  }

  deleteUser(userId: string | number) {
    this.userStore.deleteUser(userId);
    this.toastService.show({
      title: 'User deleted',
      description: `User with ID ${userId} has been successfully deleted.`,
      type: 'success'
    });
  }

  getUserById(id: string | number): User | undefined {
    return this.userStore.getUserById(id);
  }
}
