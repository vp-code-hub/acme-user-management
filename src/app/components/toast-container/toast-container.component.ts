import { Component, OnInit, OnDestroy } from '@angular/core';
import { Toast, ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css'],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private toastSubscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      setTimeout(() => this.removeToast(toast), 3000); // Remove after 3 seconds
    });
  }

  ngOnDestroy(): void {
    this.toastSubscription.unsubscribe();
  }

  removeToast(toastToRemove: Toast) {
    this.toasts = this.toasts.filter((toast) => toast !== toastToRemove);
  }
}
