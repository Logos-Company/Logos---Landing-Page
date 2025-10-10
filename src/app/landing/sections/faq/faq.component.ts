import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { TranslationService } from '../../../services/translation.service';

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
  faqs: any[] = [];
  expandedIndex: number | null = null;

  constructor(public translationService: TranslationService) {
    this.faqs = [
      {
        question: this.translationService.t('faq.question1'),
        answer: 'Pierwsze spotkanie ma charakter konsultacyjny – służy rozpoznaniu Twoich potrzeb oraz określeniu kierunku dalszej pracy terapeutycznej.'
      },
      {
        question: this.translationService.t('faq.question2'),
        answer: 'Tak, terapia online jest równie skuteczna jak stacjonarna i zapewnia wygodę oraz bezpieczeństwo.'
      },
      {
        question: this.translationService.t('faq.question3'),
        answer: 'Cena wizyty zależy od specjalisty i rodzaju terapii – więcej informacji znajdziesz na stronie cennika.'
      },
      {
        question: this.translationService.t('faq.question4'),
        answer: 'Tak, rezygnacja bez opłat jest możliwa, jeśli zgłosisz ją na co najmniej 24 godziny przed wizytą.'
      },
      {
        question: this.translationService.t('faq.question5'),
        answer: 'Tak, wszystkie rozmowy są objęte tajemnicą zawodową i odbywają się w bezpiecznej, poufnej atmosferze.'
      }
    ];
  }

  toggle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
