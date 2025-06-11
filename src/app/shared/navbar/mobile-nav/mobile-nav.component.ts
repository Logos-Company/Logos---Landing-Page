import { Component, VERSION } from "@angular/core";
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
@Component({
  selector: 'app-mobile-nav',
  imports: [],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  animations: [
    trigger("openClose", [
      // ...
      state(
        "open",
        style({
          opacity: 1,
          transform: "scale(1, 1)"
        })
      ),
      state(
        "closed",
        style({
          opacity: 0,
          transform: "scale(0.95, 0.95)"
        })
      ),
      transition("open => closed", [animate("100ms ease-in")]),
      transition("closed => open", [animate("200ms ease-out")])
    ])
  ]
})
export class MobileNavComponent {
  name = "Angular " + VERSION.major;
  mobileMenuOpen: boolean = false;

  get openCloseTrigger() {
    return this.mobileMenuOpen ? "open" : "closed";
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
