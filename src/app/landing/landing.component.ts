import { Component } from '@angular/core';
import { HeroComponent } from './sections/hero/hero.component';
import { StatsComponent } from './sections/stats/stats.component';
import { HelpAreasComponent } from './sections/help-areas/help-areas.component';
import { OfferSectionComponent } from './sections/offer-section/offer-section.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { HowItWorksComponent } from './sections/how-it-works/how-it-works.component';
import { FaqComponent } from './sections/faq/faq.component';
import { SpecialistsShowcaseComponent } from './sections/specialists-showcase/specialists-showcase.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    StatsComponent,
    HelpAreasComponent,
    OfferSectionComponent,
    TestimonialsComponent,
    HowItWorksComponent,
    FaqComponent,
    SpecialistsShowcaseComponent,
    CtaSectionComponent,
    NavbarComponent,
    FooterComponent,
    MobileNavComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent { }
