import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.faq__item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class FaqComponent {
  faqs = [
    {
      question: 'Jak wygląda pierwsze spotkanie z psychologiem?',
      answer: 'Pierwsze spotkanie to rozmowa, w której poznajemy Twoje potrzeby i ustalamy cele terapii.'
    },
    {
      question: 'Czy terapia online jest skuteczna?',
      answer: 'Tak, terapia online jest równie skuteczna jak stacjonarna i zapewnia wygodę oraz bezpieczeństwo.'
    },
    {
      question: 'Ile kosztuje wizyta?',
      answer: 'Cena wizyty zależy od specjalisty i rodzaju terapii – więcej informacji znajdziesz na stronie cennika.'
    },
    {
      question: 'Czy mogę zrezygnować z wizyty bez opłat?',
      answer: 'Tak, rezygnacja bez opłat jest możliwa, jeśli zgłosisz ją na co najmniej 24 godziny przed wizytą.'
    },
    {
      question: 'Czy rozmowy są w pełni poufne?',
      answer: 'Tak, wszystkie rozmowy są objęte tajemnicą zawodową i odbywają się w bezpiecznej, poufnej atmosferze.'
    }
  ];

  expandedIndex: number | null = null;

  toggle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
