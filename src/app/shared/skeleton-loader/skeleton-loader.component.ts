import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="skeleton-container" [class.dashboard]="type === 'dashboard'">
      <!-- Dashboard Skeleton -->
      <div *ngIf="type === 'dashboard'" class="dashboard-skeleton">
        <!-- Header Skeleton -->
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
        
        <!-- Navigation Skeleton -->
        <div class="skeleton-nav">
          <div class="skeleton-tab" *ngFor="let tab of [1,2,3,4]"></div>
        </div>
        
        <!-- Content Skeleton -->
        <div class="skeleton-content">
          <div class="skeleton-cards">
            <div class="skeleton-card" *ngFor="let card of [1,2,3,4]">
              <div class="skeleton-card-header"></div>
              <div class="skeleton-card-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Simple Skeleton -->
      <div *ngIf="type === 'simple'" class="simple-skeleton">
        <div class="skeleton-line" *ngFor="let line of [1,2,3]"></div>
      </div>
    </div>
  `,
    styles: [`
    .skeleton-container {
      padding: 20px;
      background: #f8f9fa;
    }

    .skeleton-container.dashboard {
      min-height: 100vh;
      padding: 0;
    }

    .dashboard-skeleton {
      width: 100%;
    }

    .skeleton-header {
      background: white;
      padding: 20px 30px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skeleton-title {
      width: 200px;
      height: 32px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-actions {
      display: flex;
      gap: 12px;
    }

    .skeleton-button {
      width: 80px;
      height: 36px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }

    .skeleton-nav {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 0 30px;
      display: flex;
      gap: 0;
    }

    .skeleton-tab {
      width: 120px;
      height: 48px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-right: 20px;
      border-radius: 4px 4px 0 0;
    }

    .skeleton-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px;
    }

    .skeleton-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .skeleton-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e9ecef;
    }

    .skeleton-card-header {
      width: 60%;
      height: 24px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .skeleton-card-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      width: 100%;
    }

    .skeleton-line.short {
      width: 40%;
    }

    .skeleton-line.medium {
      width: 70%;
    }

    .simple-skeleton {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @media (max-width: 768px) {
      .skeleton-header {
        padding: 16px 20px;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .skeleton-nav {
        padding: 0 20px;
        overflow-x: auto;
      }

      .skeleton-content {
        padding: 20px;
      }

      .skeleton-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
    @Input() type: 'dashboard' | 'simple' = 'simple';
}
