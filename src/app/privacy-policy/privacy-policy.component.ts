import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
@Component({
  selector: 'app-privacy-policy',
  imports: [NavbarComponent,
    FooterComponent,
    MobileNavComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
