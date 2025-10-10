import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { LogosImages } from '../../../json/logos_images';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.step', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(200, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HowItWorksComponent {
  steps: { title: string; icon: string; desc: string; }[] = [];

  constructor(
    private logos: LogosImages,
    public translationService: TranslationService
  ) {

    this.steps = [
      {
        icon: logos.psychologistIcon,
        title: this.translationService.t('howItWorks.step1.title'),
        desc: this.translationService.t('howItWorks.step1.desc')
      },
      {
        icon: logos.bookingIcon,
        title: this.translationService.t('howItWorks.step2.title'),
        desc: this.translationService.t('howItWorks.step2.desc')
      },
      {
        icon: logos.laptopIcon,
        title: this.translationService.t('howItWorks.step3.title'),
        desc: this.translationService.t('howItWorks.step3.desc')
      },
      {
        icon: logos.arrowRightIcon,
        title: this.translationService.t('howItWorks.step4.title'),
        desc: this.translationService.t('howItWorks.step4.desc')
      }
    ];
  }
}
