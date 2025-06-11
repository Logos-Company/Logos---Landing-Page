import { Component } from '@angular/core';
import { LogosImages } from '../../../json/logos_images';
import { LogosTexts } from '../../../json/logos_texts';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {


  bookSession() {
    // tutaj możesz np. przekierować:
    // this.router.navigate(['/invest']);
    alert("Przekierowanie do rejestracji sesji...");
  }
  logosTexts = new LogosTexts();
  logosImages = new LogosImages();
}
