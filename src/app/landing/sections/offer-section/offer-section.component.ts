import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
import { TranslationService } from '../../../services/translation.service';
@Component({
  selector: 'app-offer-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-section.component.html',
  styleUrl: './offer-section.component.scss'
})
export class OfferSectionComponent {
  mainTitle = '';
  mainDescription = '';
  problems: { title: string; icon: string; description: string }[] = [];
  constructor(
    private logos: LogosImages,
    public translationService: TranslationService
  ) {

    this.problems = [
      {
        title: this.translationService.t('helpAreas.emotional.title'),
        icon: this.logos.rainIcon,
        description: this.translationService.t('helpAreas.emotional.shortDesc')
      },
      {
        title: this.translationService.t('helpAreas.relationships.title'),
        icon: this.logos.speakingIcon,
        description: this.translationService.t('helpAreas.relationships.shortDesc')
      },
      {
        title: this.translationService.t('helpAreas.anxiety.title'),
        icon: this.logos.lightningIcon,
        description: this.translationService.t('helpAreas.anxiety.shortDesc')
      },
      {
        title: this.translationService.t('helpAreas.confidence.title'),
        icon: this.logos.flexedArmIcon,
        description: this.translationService.t('helpAreas.confidence.shortDesc')
      }
    ];
  }
}
