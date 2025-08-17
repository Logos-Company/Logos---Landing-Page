import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inline-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span class="inline-loader" [class.small]="size === 'small'" [class.large]="size === 'large'">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle 
          cx="12" cy="12" r="10" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-dasharray="31.416" 
          stroke-dashoffset="31.416">
          <animate 
            attributeName="stroke-dasharray" 
            dur="2s" 
            values="0 31.416;15.708 15.708;0 31.416;0 31.416" 
            repeatCount="indefinite"/>
          <animate 
            attributeName="stroke-dashoffset" 
            dur="2s" 
            values="0;-15.708;-31.416;-31.416" 
            repeatCount="indefinite"/>
        </circle>
      </svg>
      <span *ngIf="text" class="loader-text">{{ text }}</span>
    </span>
  `,
    styles: [`
    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
    }

    .spinner {
      width: 16px;
      height: 16px;
      color: #17a2b8;
    }

    .inline-loader.small .spinner {
      width: 12px;
      height: 12px;
    }

    .inline-loader.large .spinner {
      width: 20px;
      height: 20px;
    }

    .loader-text {
      font-size: 14px;
      font-weight: 500;
    }

    .inline-loader.small .loader-text {
      font-size: 12px;
    }

    .inline-loader.large .loader-text {
      font-size: 16px;
    }
  `]
})
export class InlineLoaderComponent {
    @Input() text?: string;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
