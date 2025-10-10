import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogosImages } from '../../../json/logos_images';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit {
  title = '';
  testimonials: any[] = [];
  visibleCards: boolean[] = [];

  constructor(
    private logos: LogosImages,
    public translationService: TranslationService
  ) {
    this.testimonials = [
      {
        title: '',
        review: this.translationService.t('testimonials.review1.text'),
        name: this.translationService.t('testimonials.review1.author'),
        image: this.logos.testimonialImage2
      },
      {
        title: '',
        review: this.translationService.t('testimonials.review2.text'),
        name: this.translationService.t('testimonials.review2.author'),
        image: this.logos.testimonialImage1
      },
      {
        title: '',
        review: this.translationService.t('testimonials.review3.text'),
        name: this.translationService.t('testimonials.review3.author'),
        image: this.logos.testimonialImage4
      },
      {
        title: '',
        review: this.translationService.t('testimonials.review4.text'),
        name: this.translationService.t('testimonials.review4.author'),
        image: this.logos.testimonialImage3
      }
    ];
  }

  ngOnInit(): void {
    this.visibleCards = new Array(this.testimonials.length).fill(false);
    this.animateCards();
  }

  animateCards(): void {
    this.testimonials.forEach((_, index) => {
      setTimeout(() => {
        this.visibleCards[index] = true;
      }, index * 200);
    });
  }
}