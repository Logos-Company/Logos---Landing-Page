import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Psychologist {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  psychologists: Psychologist[] = [
    { id: '1', name: 'Anna Nowak', specialization: 'Psycholog kliniczny', avatar: 'assets/avatars/anna.jpg' },
    { id: '2', name: 'Piotr Kowalski', specialization: 'Terapeuta poznawczo-behawioralny', avatar: 'assets/avatars/piotr.jpg' },
    { id: '3', name: 'Magdalena Wiśniewska', specialization: 'Psycholog dziecięcy', avatar: 'assets/avatars/magdalena.jpg' },
    { id: '4', name: 'Tomasz Lewandowski', specialization: 'Psychoterapia par', avatar: 'assets/avatars/tomasz.jpg' },
  ];

  selectedPsychologist: string = '';
  userName = JSON.parse(localStorage.getItem('user') || '{}')?.firstName || 'Użytkowniku';
  message = '';
  successMessage = '';

  constructor(private router: Router) { }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/home']);
  }

  async confirmBooking() {
    if (!this.selectedPsychologist) {
      this.message = 'Wybierz psychologa, proszę.';
      return;
    }
    const psy = this.psychologists.find(p => p.id === this.selectedPsychologist)!;
    const confirm = window.confirm(`Chcesz umówić spotkanie z ${psy.name}?`);
    if (confirm) {
      await this.sendMeetingRequest(psy);
      this.successMessage = `Wysłano prośbę do ${psy.name}. Sprawdź maila za link do Teams.`;
      this.message = '';
    }
  }

  // Przyklad stub: tutaj podłącz własne API mailowe
  private async sendMeetingRequest(psy: Psychologist) {
    // np. fetch('/api/sendMail', { method:'POST', body: JSON.stringify({ to: psy.email, from: user, ... }) })
    return new Promise<void>(resolve => setTimeout(resolve, 500));
  }
}
