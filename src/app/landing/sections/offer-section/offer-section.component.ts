import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  problems = [
    {
      title: 'Kryzys emocjonalny',
      icon: 'assets/icons/crisis.svg',
      description:
        'Terapia ukierunkowana na pomoc w trudnych chwilach życiowych – gdy czujesz, że wszystko Cię przerasta lub tracisz kontrolę nad emocjami.'
    },
    {
      title: 'Relacje i komunikacja',
      icon: 'assets/icons/relationships.svg',
      description:
        'Pomoc w budowaniu zdrowych relacji – w związkach, rodzinie czy pracy. Naucz się mówić o swoich potrzebach i stawiać granice.'
    },
    {
      title: 'Lęk i stres',
      icon: 'assets/icons/stress.svg',
      description:
        'Lęki, napięcie, ataki paniki? Naucz się technik radzenia sobie ze stresem i odzyskaj poczucie bezpieczeństwa.'
    },
    {
      title: 'Budowanie pewności siebie',
      icon: 'assets/icons/selfconfidence.svg',
      description:
        'Wzmocnij samoocenę, przełam wewnętrzne blokady i naucz się żyć bardziej w zgodzie ze sobą.'
    }
  ];
}
