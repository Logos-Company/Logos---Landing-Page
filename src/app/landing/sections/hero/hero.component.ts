import { Component } from '@angular/core';
import { LogosImages } from '../../../json/logos_images';
import { LogosTexts } from '../../../json/logos_texts';
import { TranslationService } from '../../../services/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) { }

  startCooperation() {
    this.router.navigate(['/contactform']);

  }

  logosTexts = new LogosTexts();
  logosImages = new LogosImages();
}
