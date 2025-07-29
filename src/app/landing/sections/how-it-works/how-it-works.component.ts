import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { LogosImages } from '../../../json/logos_images';

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

  constructor(private logos: LogosImages) {

    this.steps = [
      {
        icon: logos.psychologistIcon,
        title: 'Wybierz specjalistę',
        desc: 'Przeglądaj profile psychologów i wybierz osobę, która najbardziej Ci odpowiada.'
      },
      {
        icon: logos.bookingIcon,
        title: 'Zarezerwuj termin',
        desc: 'Wybierz dogodny dzień i godzinę – bez dzwonienia i kolejek.'
      },
      {
        icon: logos.laptopIcon,
        title: 'Dołącz do spotkania',
        desc: 'Spotkanie odbywa się online w bezpiecznej i wygodnej atmosferze.'
      },
      {
        icon: logos.arrowRightIcon,
        title: 'Zrób pierwszy krok',
        desc: 'Pierwsza rozmowa to początek zmiany – nie musisz być sam/a.'
      }
    ];
  }
}
