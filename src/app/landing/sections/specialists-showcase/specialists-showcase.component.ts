import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  query,
  style,
  stagger,
  animate
} from '@angular/animations';
import { LogosImages } from '../../../json/logos_images';
@Component({
  selector: 'app-specialists-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialists-showcase.component.html',
  styleUrl: './specialists-showcase.component.scss',
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.specialist-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(150, [
            animate(
              '600ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ])
      ])
    ])
  ]
})
export class SpecialistsShowcaseComponent {
  specialists: { name: string; image: string; profession: string }[] = [];

  constructor(private logos: LogosImages) {

    this.specialists = [
      {
        name: 'Anna Kowalska',
        profession: 'Psycholog kliniczny',
        image: logos.specialistImage2
      },
      {
        name: 'Marek Nowak',
        profession: 'Terapeuta poznawczo-behawioralny',
        image: logos.specialistImage1
      },
      {
        name: 'Ewa Zielińska',
        profession: 'Psychoterapeuta dziecięcy',
        image: logos.specialistImage4
      },
      {
        name: 'Tomasz Grabowski',
        profession: 'Psycholog sportowy',
        image: logos.specialistImage3
      },
      {
        name: 'Magdalena Lewandowska',
        profession: 'Psycholog zdrowia',
        image: logos.specialistImage5
      },
      {
        name: 'Paweł Wiśniewski',
        profession: 'Psychoterapeuta rodzinny',
        image: logos.specialistImage7
      },
      {
        name: 'Katarzyna Maj',
        profession: 'Psycholog biznesu',
        image: logos.specialistImage6
      },
      {
        name: 'Wiktoria Szymańska',
        profession: 'Psychoterapeuta uzależnień',
        image: logos.specialistImage8
      }
    ];
  }
}
