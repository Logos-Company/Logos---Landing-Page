import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogosImages } from '../json/logos_images';

interface Psychologist {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  description: string;
  workingDays: string[];
  workingHours: string;
  additionalInfo?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  psychologists: Psychologist[] = [];
  selectedPsychologistId: string = '';  // id psychologa do szczegółów
  userName = JSON.parse(localStorage.getItem('user') || '{}')?.firstName || 'Użytkowniku';
  message = '';
  successMessage = '';

  constructor(private logos: LogosImages, private router: Router) {
    this.psychologists = [
      {
        id: '1',
        name: 'Anna Nowak',
        specialization: 'Psycholog kliniczny',
        avatar: logos.specialistImage2,
        description: 'Specjalizuję się w terapii zaburzeń lękowych i depresji. Posiadam 10 lat doświadczenia.',
        workingDays: ['Poniedziałek', 'Środa', 'Piątek'],
        workingHours: '9:00 - 17:00',
        additionalInfo: 'Sesje prowadzone online oraz stacjonarnie.'
      },
      {
        id: '2',
        name: 'Piotr Kowalski',
        specialization: 'Terapeuta poznawczo-behawioralny',
        avatar: logos.specialistImage3,
        description: 'Pomagam w radzeniu sobie ze stresem i kryzysami życiowymi.',
        workingDays: ['Wtorek', 'Czwartek'],
        workingHours: '10:00 - 18:00',
        additionalInfo: 'Specjalne sesje dla młodzieży.'
      },
      {
        id: '3',
        name: 'Magdalena Wiśniewska',
        specialization: 'Psycholog dziecięcy',
        avatar: logos.specialistImage4,
        description: 'Pracuję z dziećmi i rodzinami w celu wspierania zdrowia psychicznego.',
        workingDays: ['Poniedziałek', 'Wtorek', 'Czwartek'],
        workingHours: '8:00 - 15:00',
      },
      {
        id: '4',
        name: 'Tomasz Lewandowski',
        specialization: 'Psychoterapia par',
        avatar: logos.specialistImage1,
        description: 'Pomagam parom odnaleźć wspólny język i zbudować trwałe relacje.',
        workingDays: ['Środa', 'Piątek'],
        workingHours: '11:00 - 19:00',
      }
    ];
  }

  // Zwraca pełne dane psychologa wg id
  get selectedPsychologist(): Psychologist | undefined {
    return this.psychologists.find(p => p.id === this.selectedPsychologistId);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/home']);
  }

  async confirmBooking() {
    if (!this.selectedPsychologistId) {
      this.message = 'Wybierz psychologa, proszę.';
      return;
    }
    const psy = this.selectedPsychologist!;
    const confirm = window.confirm(`Chcesz umówić spotkanie z ${psy.name}?`);
    if (confirm) {
      await this.sendMeetingRequest(psy);
      this.successMessage = `Wysłano prośbę do ${psy.name}. Sprawdź maila za link do Teams.`;
      this.message = '';
    }
  }

  private async sendMeetingRequest(psy: Psychologist) {
    return new Promise<void>(resolve => setTimeout(resolve, 500));
  }
  selectPsychologist(id: string) {
    this.selectedPsychologistId = id;
    this.message = '';
    this.successMessage = '';
  }

}