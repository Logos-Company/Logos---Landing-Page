import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-help-areas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-areas.component.html',
  styleUrl: './help-areas.component.scss'
})
export class HelpAreasComponent {
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
