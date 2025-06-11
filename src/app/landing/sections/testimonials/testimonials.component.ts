import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  title = 'Opinie pacjentów';

  testimonials = [
    {
      title: 'Im absolutely in love with @gather_place.',
      review: 'It’s the first video calling software built for people who meet to get work done. Feeling whole lot productive.',
      name: 'Andrew Jones',
      role: 'Product Developer at Webflow',
      image: 'assets/images/andrew-jones.jpg'
    },
    {
      title: 'Im absolutely in love with @gather_place.',
      review: 'It’s the first video calling software built for people who meet to get work done. Feeling whole lot productive.',
      name: 'Andrew Jones',
      role: 'Product Developer at Webflow',
      image: 'assets/images/andrew-jones.jpg'
    },
    {
      title: 'Im absolutely in love with @gather_place.',
      review: 'It’s the first video calling software built for people who meet to get work done. Feeling whole lot productive.',
      name: 'Andrew Jones',
      role: 'Product Developer at Webflow',
      image: 'assets/images/andrew-jones.jpg'
    },
    {
      title: 'Im absolutely in love with @gather_place.',
      review: 'It’s the first video calling software built for people who meet to get work done. Feeling whole lot productive.',
      name: 'Andrew Jones',
      role: 'Product Developer at Webflow',
      image: 'assets/images/andrew-jones.jpg'
    }
  ];
  visibleCards: boolean[] = [];

  ngOnInit() {
    this.visibleCards = this.testimonials.map(() => false);
    this.animateCards();
  }

  animateCards() {
    this.testimonials.forEach((_, i) => {
      setTimeout(() => {
        this.visibleCards[i] = true;
      }, i * 300);  // opóźnienie 300ms między kolejnymi kartami
    });
  }
}
