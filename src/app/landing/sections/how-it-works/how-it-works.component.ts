import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
  steps = [
    {
      icon: 'assets/icons/specialist.svg',
      title: 'Wybierz specjalistę',
      desc: 'Przeglądaj profile psychologów i wybierz osobę, która najbardziej Ci odpowiada.'
    },
    {
      icon: 'assets/icons/calendar.svg',
      title: 'Zarezerwuj termin',
      desc: 'Wybierz dogodny dzień i godzinę – bez dzwonienia i kolejek.'
    },
    {
      icon: 'assets/icons/meeting.svg',
      title: 'Dołącz do spotkania',
      desc: 'Spotkanie odbywa się online lub stacjonarnie, w zależności od Twoich preferencji.'
    },
    {
      icon: 'assets/icons/start.svg',
      title: 'Zrób pierwszy krok',
      desc: 'Pierwsza rozmowa to początek zmiany – nie musisz być sam/a.'
    }
  ];
}
