import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
@Component({
  selector: 'app-offer-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-section.component.html',
  styleUrl: './offer-section.component.scss'
})
export class OfferSectionComponent {
  mainTitle = 'Sprawdź, w czym możemy Ci pomóc';
  mainDescription = 'Oferujemy indywidualne podejście i wsparcie dopasowane do Twoich potrzeb:';
  problems: { title: string; icon: string; description: string }[] = [];
  constructor(private logos: LogosImages) {

    this.problems = [
      {
        title: 'Kryzys emocjonalny',
        icon: this.logos.rainIcon,
        description:
          'Czujesz się przytłoczony? Pomożemy Ci odzyskać równowagę emocjonalną i spojrzeć na sytuację z nowej perspektywy.'
      },
      {
        title: 'Relacje i komunikacja',
        icon: this.logos.speakingIcon,
        description:
          'Masz trudności w relacjach? Razem nauczymy się, jak budować zdrowe więzi i jasno wyrażać swoje potrzeby.'
      },
      {
        title: 'Lęk i stres',
        icon: this.logos.lightningIcon,
        description:
          'Doświadczasz napięcia, niepokoju lub ataków paniki? Pokażemy Ci skuteczne techniki radzenia sobie i odzyskania spokoju.'
      },
      {
        title: 'Budowanie pewności siebie',
        icon: this.logos.flexedArmIcon,
        description:
          'Masz wątpliwości co do własnej wartości? Pomagamy w odkrywaniu wewnętrznej siły i życia w zgodzie ze sobą.'
      }
    ];
  }
}
