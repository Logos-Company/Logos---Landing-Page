import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  title = 'Opinie pacjentów';
  testimonials: { title: string; image: string; review: string; name: string; }[] = [];
  constructor(private logos: LogosImages) {

    this.testimonials = [
      {
        title: 'Zmieniło moje życie!',
        review: 'Dzięki terapii odzyskałam spokój i kontrolę nad emocjami. Sesje online były wygodne i dyskretne.',
        name: 'Marta K.',
        image: this.logos.testimonialImage2
      },
      {
        title: 'Poprawiłem relacje z bliskimi',
        review: 'Nauczyłem się jasno wyrażać swoje potrzeby i stawiać granice. Dzięki temu moje kontakty rodzinne i zawodowe się poprawiły.',
        name: 'Adam W.',
        image: this.logos.testimonialImage1
      },
      {
        title: 'Wsparcie w walce z lękiem',
        review: 'Techniki, które poznałam, pomogły mi opanować ataki paniki i radzić sobie ze stresem na co dzień.',
        name: 'Paulina L.',
        image: this.logos.testimonialImage4
      },
      {
        title: 'Zwiększyłem pewność siebie',
        review: 'Przez lata miałem wątpliwości co do siebie. Teraz czuję się silniejszy i bardziej sobą.',
        name: 'Michał R.',
        image: this.logos.testimonialImage3
      }
    ];
  }
  visibleCards: boolean[] = [];

  ngOnInit() {
    this.visibleCards = this.testimonials.map(() => false);
    this.animateCards();
  }

  animateCards() {
    this.testimonials.forEach((_, i) => {
      setTimeout(() => {
        this.visibleCards[i] = true;
      }, i * 300);  // opóźnienie 300ms między kolejnymi kartami
    });
  }
}
