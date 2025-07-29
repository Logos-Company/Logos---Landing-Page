import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
@Component({
  selector: 'app-help-areas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-areas.component.html',
  styleUrl: './help-areas.component.scss'
})


export class HelpAreasComponent {
  problems: { title: string; icon: string; description: string }[] = [];
  constructor(private logos: LogosImages) {

    this.problems = [
      {
        title: 'Kryzys emocjonalny',
        icon: this.logos.brokenHeartIcon,
        description:
          'Terapia ukierunkowana na pomoc w trudnych chwilach życiowych – gdy czujesz, że wszystko Cię przerasta lub tracisz kontrolę nad emocjami.'
      },
      {
        title: 'Relacje i komunikacja',
        icon: this.logos.handShakeIcon,
        description:
          'Pomoc w budowaniu zdrowych relacji – w związkach, rodzinie czy pracy. Naucz się mówić o swoich potrzebach i stawiać granice.'
      },
      {
        title: 'Lęk i stres',
        icon: this.logos.sadFaceIcon,
        description:
          'Lęki, napięcie, ataki paniki? Naucz się technik radzenia sobie ze stresem i odzyskaj poczucie bezpieczeństwa.'
      },
      {
        title: 'Budowanie pewności siebie',
        icon: this.logos.startIcon2,
        description:
          'Wzmocnij samoocenę, przełam wewnętrzne blokady i naucz się żyć bardziej w zgodzie ze sobą.'
      },
      {
        title: 'Potrzeba rozmowy',
        icon: this.logos.speakingIcon,
        description:
          'Masz po prostu potrzebę rozmowy z kimś, kto nie będzie pytał, oceniał? Oferujemy wsparcie bez osądzania.'
      }
    ];
  }
}
