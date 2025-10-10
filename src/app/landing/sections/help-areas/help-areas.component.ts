import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
import { TranslationService } from '../../../services/translation.service';
@Component({
  selector: 'app-help-areas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-areas.component.html',
  styleUrl: './help-areas.component.scss'
})


export class HelpAreasComponent {
  problems: { title: string; icon: string; description: string }[] = [];
  constructor(
    private logos: LogosImages,
    public translationService: TranslationService
  ) {

    this.problems = [
      {
        title: this.translationService.t('helpAreas.emotional.title'),
        icon: this.logos.brokenHeartIcon,
        description: this.translationService.t('helpAreas.emotional.desc')
      },
      {
        title: this.translationService.t('helpAreas.relationships.title'),
        icon: this.logos.handShakeIcon,
        description: this.translationService.t('helpAreas.relationships.desc')
      },
      {
        title: this.translationService.t('helpAreas.anxiety.title'),
        icon: this.logos.sadFaceIcon,
        description: this.translationService.t('helpAreas.anxiety.desc')
      },
      {
        title: this.translationService.t('helpAreas.confidence.title'),
        icon: this.logos.startIcon2,
        description: this.translationService.t('helpAreas.confidence.desc')
      },
      {
        title: this.translationService.t('helpAreas.conversation.title'),
        icon: this.logos.speakingIcon,
        description: this.translationService.t('helpAreas.conversation.desc')
      }
    ];
  }
}
