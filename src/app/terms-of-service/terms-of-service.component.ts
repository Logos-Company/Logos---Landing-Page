import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
@Component({
  selector: 'app-terms-of-service',
  imports: [NavbarComponent,
    FooterComponent,
    MobileNavComponent],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent {

}
