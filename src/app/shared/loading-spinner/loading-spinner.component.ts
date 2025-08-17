import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="loading-container" [class.full-page]="fullPage">
      <div class="loading-content">
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text" *ngIf="showText">{{ text }}</p>
      </div>
    </div>
  `,
    styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      min-height: 200px;
    }

    .loading-container.full-page {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(248, 249, 250, 0.95);
      backdrop-filter: blur(2px);
      z-index: 9999;
      min-height: 100vh;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .spinner-wrapper {
      position: relative;
      width: 50px;
      height: 50px;
    }

    .spinner {
      position: absolute;
      width: 50px;
      height: 50px;
      border: 3px solid #e9ecef;
      border-top: 3px solid #17a2b8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-ring {
      position: absolute;
      width: 50px;
      height: 50px;
      border: 3px solid transparent;
      border-top: 3px solid #28a745;
      border-radius: 50%;
      animation: spin 1.5s linear infinite;
      opacity: 0.6;
    }

    .loading-text {
      margin: 0;
      color: #6c757d;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @media (max-width: 768px) {
      .loading-container {
        padding: 30px 15px;
        min-height: 150px;
      }
      
      .spinner-wrapper {
        width: 40px;
        height: 40px;
      }
      
      .spinner, .spinner-ring {
        width: 40px;
        height: 40px;
      }
      
      .loading-text {
        font-size: 14px;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() text: string = 'Ładowanie...';
    @Input() showText: boolean = true;
    @Input() fullPage: boolean = false;
}
