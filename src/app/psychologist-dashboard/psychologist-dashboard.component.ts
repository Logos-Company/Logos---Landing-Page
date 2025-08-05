import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { VideoCallService, OnlineStatus } from '../core/video-call.service';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { PsychologistNote, PsychologistStats } from '../models/psychologist.model';

@Component({
  selector: 'app-psychologist-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="psychologist-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel Psychologa</h1>
          <div class="header-actions">
            <div class="online-status-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  [checked]="isOnline" 
                  (change)="toggleOnlineStatus($event)"
                >
                <span class="slider">
                  <span class="toggle-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
                </span>
              </label>
              <span class="status-indicator" [class.online]="isOnline" [class.offline]="!isOnline">
                {{ isOnline ? '🟢' : '🔴' }}
              </span>
            </div>
            
            <span class="user-role psychologist">PSYCHOLOG</span>
            <button class="logout-btn" (click)="logout()">Wyloguj</button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="dashboard-nav">
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'overview'"
          (click)="setActiveTab('overview')"
        >
          Przegląd
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'appointments'"
          (click)="setActiveTab('appointments')"
        >
          Wizyty
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'patients'"
          (click)="setActiveTab('patients')"
        >
          Pacjenci
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'notes'"
          (click)="setActiveTab('notes')"
        >
          Notatki
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'calendar'"
          (click)="setActiveTab('calendar')"
        >
          Kalendarz
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'statistics'"
          (click)="setActiveTab('statistics')"
        >
          Statystyki
        </button>
      </nav>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Ładowanie danych...</p>
      </div>

      <!-- Main Content -->
      <main class="dashboard-content" *ngIf="!isLoading">
        
        <!-- Overview Tab -->
        <section class="overview-section" *ngIf="activeTab === 'overview'">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <h3>{{ stats.totalSessions }}</h3>
                <p>Wszystkie sesje</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ stats.totalRevenue }} zł</h3>
                <p>Łączny przychód</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <h3>{{ stats.averageRating }}/5</h3>
                <p>Średnia ocena</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ stats.activeClients }}</h3>
                <p>Aktywni klienci</p>
              </div>
            </div>
          </div>

          <div class="recent-appointments">
            <h3>Dzisiejsze wizyty</h3>
            <div class="appointments-list" *ngIf="todayAppointments.length > 0; else noAppointments">
              <div 
                *ngFor="let appointment of todayAppointments" 
                class="appointment-card"
                [class]="appointment.status"
              >
                <div class="appointment-time">
                  {{ appointment.startTime }} - {{ appointment.endTime }}
                </div>
                <div class="appointment-patient">
                  Pacjent: {{ getPatientName(appointment.userId) }}
                </div>
                <div class="appointment-status">
                  {{ getStatusText(appointment.status) }}
                </div>
                <div class="appointment-actions">
                  <button 
                    class="btn btn-sm btn-primary" 
                    (click)="startSession(appointment)"
                    *ngIf="appointment.status === 'scheduled'"
                  >
                    Rozpocznij sesję
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noAppointments>
              <p class="no-data">Brak wizyt na dziś</p>
            </ng-template>
          </div>
        </section>

        <!-- Calendar Tab -->
        <section class="calendar-section" *ngIf="activeTab === 'calendar'">
          <div class="section-header">
            <h2>Kalendarz</h2>
            <div class="calendar-controls">
              <button class="btn btn-secondary" (click)="previousMonth()">‹</button>
              <span class="current-month">{{ getCurrentMonthYear() }}</span>
              <button class="btn btn-secondary" (click)="nextMonth()">›</button>
            </div>
          </div>

          <div class="calendar-container">
            <div class="calendar-grid">
              <div class="calendar-header">
                <div class="day-header">Pon</div>
                <div class="day-header">Wt</div>
                <div class="day-header">Śr</div>
                <div class="day-header">Czw</div>
                <div class="day-header">Pt</div>
                <div class="day-header">Sob</div>
                <div class="day-header">Nie</div>
              </div>
              
              <div class="calendar-body">
                <div 
                  *ngFor="let day of calendarDays" 
                  class="calendar-day"
                  [class.today]="day.isToday"
                  [class.other-month]="!day.isCurrentMonth"
                  [class.has-appointments]="day.appointments && day.appointments.length > 0"
                >
                  <div class="day-number">{{ day.day }}</div>
                  <div class="day-appointments" *ngIf="day.appointments && day.appointments.length > 0">
                    <div 
                      *ngFor="let appointment of day.appointments.slice(0, 2)" 
                      class="appointment-mini"
                      [class]="appointment.status"
                    >
                      {{ appointment.startTime }}
                    </div>
                    <div *ngIf="day.appointments.length > 2" class="more-appointments">
                      +{{ day.appointments.length - 2 }} więcej
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Patients Tab -->
        <section class="patients-section" *ngIf="activeTab === 'patients'">
          <div class="section-header">
            <h2>Lista pacjentów</h2>
          </div>

          <div class="patients-grid">
            <div *ngFor="let patient of patients" class="patient-card">
              <div class="patient-header">
                <div class="patient-avatar">
                  {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                </div>
                <div class="patient-info">
                  <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
                  <p class="patient-email">{{ patient.email }}</p>
                </div>
              </div>
              
              <div class="patient-stats">
                <div class="stat">
                  <span class="label">Sesje:</span>
                  <span class="value">{{ getPatientSessionCount(patient.id) }}</span>
                </div>
                <div class="stat">
                  <span class="label">Ostatnia wizyta:</span>
                  <span class="value">{{ getLastAppointmentDate(patient.id) }}</span>
                </div>
              </div>

              <div class="patient-actions">
                <button 
                  class="btn btn-secondary" 
                  (click)="viewPatientNotes(patient.id)"
                >
                  Notatki
                </button>
                <button 
                  class="btn btn-primary" 
                  (click)="scheduleAppointment(patient.id)"
                >
                  Umów wizytę
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Notes Tab -->
        <section class="notes-section" *ngIf="activeTab === 'notes'">
          <div class="section-header">
            <h2>Notatki z sesji</h2>
            <button class="btn btn-primary" (click)="addNote()">
              Dodaj nową notatkę
            </button>
          </div>

          <div class="notes-grid">
            <div *ngFor="let note of notes" class="note-card">
              <div class="note-header">
                <div class="note-date">{{ note.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
                <div class="note-patient">
                  Pacjent: {{ getPatientName(note.userId) }}
                </div>
              </div>
              
              <div class="note-title">
                <h4>{{ note.title }}</h4>
              </div>
              
              <div class="note-content">
                <p>{{ note.content }}</p>
              </div>

              <div class="note-tags" *ngIf="note.tags && note.tags.length > 0">
                <span *ngFor="let tag of note.tags" class="tag">{{ tag }}</span>
              </div>

              <div class="note-actions">
                <button class="btn btn-secondary" (click)="editNote(note)">
                  Edytuj
                </button>
                <button class="btn btn-danger" (click)="deleteNote(note.id)">
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    `,
  styleUrls: ['./psychologist-dashboard.component.scss']
})
export class PsychologistDashboardComponent implements OnInit {
  activeTab = 'overview';
  isLoading = false;
  isOnline = true;
  selectedStatus = '';
  showAddNoteModal = false;
  editingNote = false;
  currentNote: any = {};
  tagsInput = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private videoCallService: VideoCallService
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  stats: PsychologistStats = {
    totalSessions: 156,
    totalRevenue: 12450,
    averageRating: 4.7,
    activeClients: 23,
    upcomingAppointments: 8,
    thisMonthSessions: 32,
    thisMonthRevenue: 8500
  };

  patients: User[] = [
    {
      id: 'user1',
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'anna.kowalska@email.com',
      role: 'user' as any,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'user2',
      firstName: 'Piotr',
      lastName: 'Nowak',
      email: 'piotr.nowak@email.com',
      role: 'user' as any,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'user3',
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'maria.wisniewska@email.com',
      role: 'user' as any,
      isActive: true,
      createdAt: new Date()
    }
  ];

  appointments: Appointment[] = [
    {
      id: 'apt1',
      userId: 'user1',
      psychologistId: 'psych1',
      date: new Date('2024-01-15'),
      startTime: '09:00',
      endTime: '10:00',
      status: 'scheduled',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'apt2',
      userId: 'user2',
      psychologistId: 'psych1',
      date: new Date('2024-01-15'),
      startTime: '10:30',
      endTime: '11:30',
      status: 'completed',
      notes: 'Sesja przebiegła pomyślnie',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  notes: PsychologistNote[] = [
    {
      id: 'note1',
      userId: 'user1',
      psychologistId: 'psych1',
      title: 'Pierwsza sesja - diagnostyka',
      content: 'Pacjentka zgłosiła się z problemami lękowymi. Obserwuje się objawy lęku uogólnionego.',
      tags: ['diagnostyka', 'lęk', 'CBT'],
      appointmentId: 'apt1',
      isVisibleToUser: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'note2',
      userId: 'user2',
      psychologistId: 'psych1',
      title: 'Sesja kontrolna - postępy',
      content: 'Pacjent wykazuje znaczną poprawę w radzeniu sobie ze stresem.',
      tags: ['postęp', 'stres', 'relaksacja'],
      appointmentId: 'apt2',
      isVisibleToUser: false,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    }
  ];

  currentDate = new Date();
  calendarDays: any[] = [];
  filteredAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];

  loadInitialData() {
    this.isLoading = true;

    setTimeout(() => {
      this.generateCalendar();
      this.loadTodayAppointments();
      this.isLoading = false;
    }, 1000);
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

    this.calendarDays = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);

      const dayAppointments = this.getAppointmentsForDate(currentDay);

      this.calendarDays.push({
        day: currentDay.getDate(),
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        appointments: dayAppointments
      });
    }
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.appointments.filter(apt => apt.date.toISOString().split('T')[0] === dateStr);
  }

  getCurrentMonthYear(): string {
    const months = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments = this.appointments.filter(apt => apt.date.toISOString().split('T')[0] === today);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Zaplanowana',
      'in-progress': 'W trakcie',
      'completed': 'Zakończona',
      'cancelled': 'Anulowana'
    };
    return statusMap[status] || status;
  }

  getPatientName(userId: string): string {
    const patient = this.patients.find(p => p.id === userId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Nieznany pacjent';
  }

  getPatientSessionCount(userId: string): number {
    return this.appointments.filter(apt => apt.userId === userId && apt.status === 'completed').length;
  }

  getLastAppointmentDate(userId: string): string {
    const userAppointments = this.appointments
      .filter(apt => apt.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return userAppointments.length > 0 ? userAppointments[0].date.toISOString().split('T')[0] : 'Brak wizyt';
  }

  async startSession(appointment: Appointment) {
    try {
      appointment.status = 'completed'; // Używamy dozwolonego statusu
      console.log('Starting session for appointment:', appointment.id);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  viewPatientNotes(userId: string) {
    this.setActiveTab('notes');
  }

  scheduleAppointment(patientId: string) {
    console.log('Scheduling appointment for patient:', patientId);
  }

  addNote(appointment?: Appointment) {
    this.currentNote = {
      title: '',
      content: '',
      userId: appointment?.userId || '',
      appointmentId: appointment?.id || ''
    };
    this.tagsInput = '';
    this.editingNote = false;
    this.showAddNoteModal = true;
  }

  editNote(note: PsychologistNote) {
    this.currentNote = { ...note };
    this.tagsInput = note.tags ? note.tags.join(', ') : '';
    this.editingNote = true;
    this.showAddNoteModal = true;
  }

  async deleteNote(noteId: string) {
    try {
      if (confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
        this.notes = this.notes.filter(note => note.id !== noteId);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  toggleOnlineStatus(event: any) {
    this.isOnline = event.target.checked;
    console.log('Online status changed to:', this.isOnline);
  }
}
