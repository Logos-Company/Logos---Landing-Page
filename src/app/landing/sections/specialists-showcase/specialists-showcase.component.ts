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
  specialists = [
    {
      name: 'Julian Jameson',
      profession: 'Psycholog kliniczny',
      image: 'assets/specialists/julian.jpg'
    },
    {
      name: 'Julian Jameson',
      profession: 'Terapeuta poznawczo-behawioralny',
      image: 'assets/specialists/julian2.jpg'
    },
    {
      name: 'Julian Jameson',
      profession: 'Psychoterapeuta dziecięcy',
      image: 'assets/specialists/julian3.jpg'
    },
    {
      name: 'Julian Jameson',
      profession: 'Psycholog sportowy',
      image: 'assets/specialists/julian4.jpg'
    },
    {
      name: 'Julian Jameson',
      profession: 'Psycholog zdrowia',
      image: 'assets/specialists/julian5.jpg'
    },
    // dodaj więcej specjalistów jeśli trzeba
  ];
}
