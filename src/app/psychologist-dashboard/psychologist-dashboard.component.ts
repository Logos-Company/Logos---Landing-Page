import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { UserService } from '../core/user.service';
import { VideoCallService, OnlineStatus } from '../core/video-call.service';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { PsychologistNote, PsychologistStats } from '../models/psychologist.model';

@Component({
  selector: 'app-psychologist-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  styleUrls: ['./psychologist-dashboard.component.scss'],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel Psychologa</h1>
          <div class="header-actions">
            <button class="demo-btn" (click)="refreshData()" [disabled]="isLoading" title="Odśwież dane">
              🔄
            </button>
            <div class="online-status-toggle">
              <span class="status-text" [class.online]="isOnline">{{ isOnline ? 'Online' : 'Offline' }}</span>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  [(ngModel)]="isOnline"
                >
                <span class="slider"></span>
              </label>
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
      <app-skeleton-loader 
        *ngIf="isLoading" 
        type="dashboard">
      </app-skeleton-loader>

      <!-- Main Content -->
      <main class="dashboard-content" *ngIf="!isLoading">
        
        <!-- Overview Tab -->
        <section class="overview-section" *ngIf="activeTab === 'overview'">
          <div class="welcome-card">
            <h2>Witaj, Dr {{ currentUser?.firstName }}!</h2>
            <p>Zarządzaj swoimi wizytami i pacjentami w profesjonalnym panelu psychologa.</p>
            
            <!-- Status Overview -->
            <div class="status-card" [ngClass]="isOnline ? 'online' : 'offline'">
              <h4>Status dostępności</h4>
              <p *ngIf="isOnline">
                ✅ Jesteś dostępny dla pacjentów
              </p>
              <p *ngIf="!isOnline">
                🔴 Jesteś niedostępny - pacjenci nie mogą umawiać wizyt
              </p>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon">�</div>
              <div class="stat-content">
                <h3>{{ todayAppointments.length }}</h3>
                <p>Dzisiejsze wizyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">�</div>
              <div class="stat-content">
                <h3>{{ stats.activeClients }}</h3>
                <p>Aktywni pacjenci</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ stats.totalSessions }}</h3>
                <p>Łącznie sesji</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">�</div>
              <div class="stat-content">
                <h3>{{ stats.totalRevenue }} zł</h3>
                <p>Łączny przychód</p>
              </div>
            </div>
          </div>

          <!-- Today's Appointments -->
          <div class="recent-appointments" *ngIf="todayAppointments.length > 0; else noAppointments">
            <h3>Dzisiejsze wizyty</h3>
            <div class="appointments-list">
              @for (appointment of todayAppointments; track appointment.id) {
                <div class="appointment-card"
                     [class]="appointment.status">
                  <div class="appointment-time">
                    {{ appointment.startTime }} - {{ appointment.endTime }}
                  </div>
                  <div class="appointment-patient">
                    {{ getPatientName(appointment.userId) }}
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
                    <button 
                      class="btn btn-sm btn-success" 
                      (click)="completeSession(appointment)"
                      *ngIf="appointment.status === 'scheduled'"
                    >
                      Zakończ sesję
                    </button>
                    <button 
                      class="btn btn-sm btn-secondary" 
                      (click)="openAddNoteModal(appointment)"
                    >
                      Dodaj notatkę
                    </button>
                    <button 
                      class="btn btn-sm btn-danger" 
                      (click)="cancelAppointment(appointment)"
                      *ngIf="appointment.status === 'scheduled'"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <ng-template #noAppointments>
            <div class="empty-state">
              <div class="empty-icon">📅</div>
              <h4>Brak wizyt na dziś</h4>
              <p>Możesz umówić nowe wizyty z pacjentami</p>
              <button class="btn btn-primary" (click)="setActiveTab('appointments')">
                Zarządzaj wizytami
              </button>
            </div>
          </ng-template>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Szybkie akcje</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="setActiveTab('appointments')">
                <div class="action-icon">📅</div>
                <span>Wizyty</span>
              </button>
              <button class="action-btn" (click)="openAddNoteModal()">
                <div class="action-icon">📝</div>
                <span>Dodaj notatkę</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('patients')">
                <div class="action-icon">👥</div>
                <span>Pacjenci</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('calendar')">
                <div class="action-icon">📊</div>
                <span>Kalendarz</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Appointments Tab -->
        <section class="appointments-section" *ngIf="activeTab === 'appointments'">
          <div class="section-header">
            <h3>Zarządzanie wizytami</h3>
            <button class="btn btn-primary" (click)="showAppointmentModal = true">
              Umów nową wizytę
            </button>
          </div>

          <div class="appointments-list" *ngIf="appointments.length > 0; else noAppointmentsData">
            @for (appointment of appointments; track appointment.id) {
              <div class="appointment-card" [class]="appointment.status">
                <div class="appointment-date">
                  {{ appointment.date | date:'dd.MM.yyyy' }}
                </div>
                <div class="appointment-time">
                  {{ appointment.startTime }} - {{ appointment.endTime }}
                </div>
                <div class="appointment-patient">
                  {{ getPatientName(appointment.userId) }}
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
                    Rozpocznij
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary" 
                    (click)="openAddNoteModal(appointment)"
                  >
                    Notatka
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    (click)="cancelAppointment(appointment)"
                    *ngIf="appointment.status === 'scheduled'"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            }
          </div>

          <ng-template #noAppointmentsData>
            <div class="empty-state">
              <div class="empty-icon">📅</div>
              <h4>Brak wizyt</h4>
              <p>Nie masz jeszcze żadnych umówionych wizyt</p>
            </div>
          </ng-template>
        </section>

        <!-- Patients Tab -->
        <section class="patients-section" *ngIf="activeTab === 'patients'">
          <div class="section-header">
            <h3>Moi pacjenci</h3>
            <p class="section-description">Lista pacjentów przypisanych do Ciebie</p>
          </div>

          <div class="patients-grid" *ngIf="clients.length > 0; else noPatientsData">
            @for (patient of clients; track patient.id) {
              <div class="patient-card">
                <div class="patient-header">
                  <div class="patient-avatar">
                    {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                  </div>
                  <div class="patient-info">
                    <h4>{{ patient.firstName }} {{ patient.lastName }}</h4>
                    <p class="patient-email">{{ patient.email }}</p>
                  </div>
                </div>
                
                <div class="patient-stats">
                  <div class="stat-item">
                    <span class="stat-label">Sesje:</span>
                    <span class="stat-value">{{ getPatientSessionCount(patient.id) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Ostatnia wizyta:</span>
                    <span class="stat-value">{{ getLastAppointmentDate(patient.id) }}</span>
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
                  <button 
                    class="btn btn-danger" 
                    (click)="removeClient(patient)"
                  >
                    Usuń klienta
                  </button>
                </div>
              </div>
            }
          </div>

          <ng-template #noPatientsData>
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h4>Brak przypisanych pacjentów</h4>
              <p>Gdy admin zatwierdzi przypisanie pacjentów, pojawią się tutaj</p>
            </div>
          </ng-template>
        </section>

        <!-- Notes Tab -->
        <section class="notes-section" *ngIf="activeTab === 'notes'">
          <div class="section-header">
            <h3>Notatki z sesji</h3>
            <button class="btn btn-primary" (click)="openAddNoteModal()">
              Dodaj nową notatkę
            </button>
          </div>

          <div class="notes-list" *ngIf="notes.length > 0; else noNotesData">
            @for (note of notes; track note.id) {
              <div class="note-card">
                <div class="note-header">
                  <h4>{{ note.title }}</h4>
                  <span class="note-date">{{ note.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
                </div>
                <div class="note-content">
                  <p>{{ note.content }}</p>
                  <div class="note-patient">
                    Pacjent: {{ getPatientName(note.userId) }}
                  </div>
                </div>
                @if (note.tags && note.tags.length > 0) {
                  <div class="note-footer">
                    <div class="note-tags">
                      @for (tag of note.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                }
                <div class="note-actions">
                  <button class="btn btn-secondary" (click)="openEditNoteModal(note)">
                    Edytuj
                  </button>
                  <button class="btn btn-danger" (click)="deleteNote(note.id)">
                    Usuń
                  </button>
                </div>
              </div>
            }
          </div>
          
          <ng-template #noNotesData>
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h4>Brak notatek</h4>
              <p>Nie masz jeszcze żadnych notatek z sesji</p>
              <button class="btn btn-primary" (click)="openAddNoteModal()">
                Dodaj pierwszą notatkę
              </button>
            </div>
          </ng-template>
        </section>

        <!-- Calendar Tab -->
        <section class="calendar-section" *ngIf="activeTab === 'calendar'">
          <div class="section-header">
            <h3>Kalendarz wizyt</h3>
            <div class="calendar-controls">
              <button class="btn btn-secondary" (click)="previousMonth()">‹ Poprzedni</button>
              <span class="current-month">{{ getCurrentMonthYear() }}</span>
              <button class="btn btn-secondary" (click)="nextMonth()">Następny ›</button>
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
                @for (day of calendarDays; track day.date) {
                  <div class="calendar-day"
                       [class.today]="day.isToday"
                       [class.other-month]="!day.isCurrentMonth"
                       [class.has-appointments]="day.appointments && day.appointments.length > 0">
                    <div class="day-number">{{ day.day }}</div>
                    <div class="day-appointments" *ngIf="day.appointments && day.appointments.length > 0">
                      @for (appointment of day.appointments.slice(0, 2); track appointment.id) {
                        <div class="appointment-mini" [class]="appointment.status">
                          {{ appointment.startTime }}
                        </div>
                      }
                      @if (day.appointments.length > 2) {
                        <div class="more-appointments">
                          +{{ day.appointments.length - 2 }} więcej
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Statistics Tab -->
        <section class="statistics-section" *ngIf="activeTab === 'statistics'">
          <div class="section-header">
            <h3>Statystyki</h3>
            <p class="section-description">Twoje statystyki i wyniki</p>
          </div>

          <div class="stats-overview">
            <div class="overview-card">
              <div class="card-icon">📊</div>
              <div class="card-value">{{ stats.totalSessions }}</div>
              <div class="card-label">Łącznie sesji</div>
            </div>

            <div class="overview-card">
              <div class="card-icon">💰</div>
              <div class="card-value">{{ stats.totalRevenue }} zł</div>
              <div class="card-label">Łączny przychód</div>
            </div>

            <div class="overview-card">
              <div class="card-icon">⭐</div>
              <div class="card-value">{{ stats.averageRating }}/5</div>
              <div class="card-label">Średnia ocena</div>
            </div>

            <div class="overview-card">
              <div class="card-icon">📅</div>
              <div class="card-value">{{ stats.thisMonthSessions }}</div>
              <div class="card-label">Sesje w tym miesiącu</div>
            </div>
          </div>

          <div class="charts-placeholder">
            <div class="chart-card">
              <h4>Sesje w czasie</h4>
              <div class="chart-content">
                Wykres będzie dostępny wkrótce
              </div>
            </div>
            
            <div class="chart-card">
              <h4>Przychody miesięczne</h4>
              <div class="chart-content">
                Wykres będzie dostępny wkrótce
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Add/Edit Note Modal -->
      <div class="modal" *ngIf="showAddNoteModal || showEditNoteModal" (click)="closeNoteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingNote ? 'Edytuj notatkę' : 'Dodaj notatkę' }}</h3>
            <button class="close-btn" (click)="closeNoteModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveNote()" #noteForm="ngForm">
              <div class="form-group">
                <label>Pacjent:</label>
                <select [(ngModel)]="currentNote.userId" name="userId" required>
                  <option value="">Wybierz pacjenta</option>
                  <option *ngFor="let client of clients" [value]="client.id">
                    {{ client.firstName }} {{ client.lastName }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Tytuł notatki:</label>
                <input 
                  type="text" 
                  [(ngModel)]="currentNote.title" 
                  name="title" 
                  required
                  placeholder="Np. Sesja diagnostyczna, Postępy w terapii..."
                >
              </div>
              
              <div class="form-group">
                <label>Treść notatki:</label>
                <textarea 
                  [(ngModel)]="currentNote.content" 
                  name="content" 
                  required
                  rows="8"
                  placeholder="Opisz przebieg sesji, obserwacje, zalecenia..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Tagi (oddzielone przecinkami):</label>
                <input 
                  type="text" 
                  [(ngModel)]="tagsInput" 
                  name="tags"
                  placeholder="lęk, terapia poznawczo-behawioralna, postęp"
                >
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="currentNote.isVisibleToUser" 
                    name="isVisibleToUser"
                  >
                  Udostępnij notatkę pacjentowi
                </label>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeNoteModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!noteForm.valid">
                  {{ editingNote ? 'Zaktualizuj' : 'Zapisz' }} notatkę
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Schedule Appointment Modal -->
      <div class="modal" *ngIf="showAppointmentModal" (click)="closeAppointmentModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Umów wizytę</h3>
            <button class="close-btn" (click)="closeAppointmentModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="createAppointment()" #appointmentForm="ngForm">
              <div class="form-group">
                <label>Pacjent:</label>
                <select [(ngModel)]="newAppointment.userId" name="userId" required>
                  <option value="">Wybierz pacjenta</option>
                  <option *ngFor="let client of clients" [value]="client.id">
                    {{ client.firstName }} {{ client.lastName }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Data wizyty:</label>
                <input 
                  type="date" 
                  [(ngModel)]="newAppointment.date" 
                  name="date" 
                  required
                  [min]="getCurrentDate()"
                >
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Godzina rozpoczęcia:</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newAppointment.startTime" 
                    name="startTime" 
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label>Godzina zakończenia:</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newAppointment.endTime" 
                    name="endTime" 
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Typ sesji:</label>
                <select [(ngModel)]="newAppointment.type" name="type" required>
                  <option value="individual">Sesja indywidualna</option>
                  <option value="consultation">Konsultacja</option>
                  <option value="follow-up">Wizyta kontrolna</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Notatki (opcjonalne):</label>
                <textarea 
                  [(ngModel)]="newAppointment.notes" 
                  name="notes"
                  rows="3"
                  placeholder="Dodatkowe informacje o wizycie..."
                ></textarea>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAppointmentModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!appointmentForm.valid">
                  Utwórz wizytę
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `
})
export class PsychologistDashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;
  isOnline = true;

  // Data
  stats: PsychologistStats = {
    totalSessions: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeClients: 0,
    upcomingAppointments: 0,
    thisMonthSessions: 0,
    thisMonthRevenue: 0
  };

  clients: User[] = [];
  appointments: Appointment[] = [];
  notes: PsychologistNote[] = [];
  todayAppointments: Appointment[] = [];

  // Calendar
  currentDate = new Date();
  calendarDays: any[] = [];

  // Modals
  showAddNoteModal = false;
  showEditNoteModal = false;
  showAppointmentModal = false;

  // Forms
  currentNote: any = {
    title: '',
    content: '',
    userId: '',
    tags: [],
    isVisibleToUser: false
  };

  newAppointment = {
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'individual',
    notes: ''
  };

  tagsInput = '';
  editingNote = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private userService: UserService,
    private videoCallService: VideoCallService
  ) { }

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user in psychologist dashboard:', this.currentUser);

    if (!this.currentUser) {
      console.log('No user logged in, redirecting to login...');
      this.router.navigate(['/login']);
      return;
    }

    if (this.currentUser.role !== 'psychologist') {
      console.log('User is not a psychologist, redirecting...');
      const dashboardRoute = this.authService.redirectToDashboard(this.currentUser);
      this.router.navigate([dashboardRoute]);
      return;
    }

    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;

    try {
      if (this.currentUser) {
        console.log('Loading psychologist dashboard data...');

        // Load psychologist stats
        this.stats = await this.psychologistService.getPsychologistStats(this.currentUser.id);
        console.log('Stats loaded:', this.stats);

        // Load assigned clients
        this.clients = await this.psychologistService.getAssignedClients(this.currentUser.id);
        console.log('Clients loaded:', this.clients.length);

        // Load appointments
        this.appointments = await this.appointmentService.getPsychologistAppointments(this.currentUser.id);
        console.log('Appointments loaded:', this.appointments.length);

        // Load today's appointments
        this.loadTodayAppointments();

        // Load notes
        this.notes = await this.psychologistService.getPsychologistNotes(this.currentUser.id);
        console.log('Notes loaded:', this.notes.length);

        // Generate calendar
        this.generateCalendar();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  loadTodayAppointments() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.todayAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toISOString().split('T')[0] === todayStr;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
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
    return this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toISOString().split('T')[0] === dateStr;
    });
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
      'cancelled': 'Anulowana',
      'no-show': 'Niestawiennictwo'
    };
    return statusMap[status] || status;
  }

  getPatientName(userId: string): string {
    const patient = this.clients.find(p => p.id === userId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Nieznany pacjent';
  }

  getPatientSessionCount(userId: string): number {
    return this.appointments.filter(apt => apt.userId === userId && apt.status === 'completed').length;
  }

  getLastAppointmentDate(userId: string): string {
    const userAppointments = this.appointments
      .filter(apt => apt.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return userAppointments.length > 0 ?
      new Date(userAppointments[0].date).toLocaleDateString('pl-PL') : 'Brak wizyt';
  }

  async startSession(appointment: Appointment) {
    try {
      console.log('Starting session for appointment:', appointment.id);

      await this.appointmentService.updateAppointment(appointment.id, { status: 'completed' });
      appointment.status = 'completed';

      // Here you could integrate with video call service
      // this.videoCallService.startCall(appointment);

    } catch (error) {
      console.error('Error starting session:', error);
      alert('Wystąpił błąd podczas rozpoczynania sesji');
    }
  }

  async completeSession(appointment: Appointment) {
    try {
      console.log('Completing session for appointment:', appointment.id);

      await this.appointmentService.updateAppointment(appointment.id, { status: 'completed' });
      appointment.status = 'completed';

      // Refresh stats
      this.stats = await this.psychologistService.getPsychologistStats(this.currentUser!.id);

    } catch (error) {
      console.error('Error completing session:', error);
      alert('Wystąpił błąd podczas kończenia sesji');
    }
  }

  viewPatientNotes(userId: string) {
    this.setActiveTab('notes');
    // Filter notes for this patient
    // Could add filtering logic here
  }

  scheduleAppointment(patientId: string) {
    this.newAppointment.userId = patientId;
    this.showAppointmentModal = true;
  }

  // ===== NOTES MANAGEMENT =====

  openAddNoteModal(appointment?: Appointment) {
    this.currentNote = {
      title: '',
      content: '',
      userId: appointment?.userId || '',
      appointmentId: appointment?.id || '',
      tags: [],
      isVisibleToUser: false
    };
    this.tagsInput = '';
    this.editingNote = false;
    this.showAddNoteModal = true;
  }

  openEditNoteModal(note: PsychologistNote) {
    this.currentNote = { ...note };
    this.tagsInput = note.tags ? note.tags.join(', ') : '';
    this.editingNote = true;
    this.showEditNoteModal = true;
  }

  closeNoteModal() {
    this.showAddNoteModal = false;
    this.showEditNoteModal = false;
    this.currentNote = {
      title: '',
      content: '',
      userId: '',
      tags: [],
      isVisibleToUser: false
    };
    this.tagsInput = '';
    this.editingNote = false;
  }

  async saveNote() {
    if (!this.currentUser || !this.currentNote.title || !this.currentNote.content) {
      alert('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      this.isLoading = true;

      // Parse tags
      const tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const noteData = {
        ...this.currentNote,
        psychologistId: this.currentUser.id,
        tags: tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.editingNote && this.currentNote.id) {
        await this.psychologistService.updateNote(this.currentNote.id, noteData);
      } else {
        await this.psychologistService.addNote(noteData);
      }

      // Refresh notes
      this.notes = await this.psychologistService.getPsychologistNotes(this.currentUser.id);

      this.closeNoteModal();
      alert('Notatka została zapisana');

    } catch (error) {
      console.error('Error saving note:', error);
      alert('Wystąpił błąd podczas zapisywania notatki');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteNote(noteId: string) {
    if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      return;
    }

    try {
      this.isLoading = true;

      await this.psychologistService.deleteNote(noteId);
      this.notes = this.notes.filter(note => note.id !== noteId);

      alert('Notatka została usunięta');

    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Wystąpił błąd podczas usuwania notatki');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== APPOINTMENT MANAGEMENT =====

  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.newAppointment = {
      userId: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'individual',
      notes: ''
    };
  }

  async createAppointment() {
    if (!this.currentUser || !this.newAppointment.userId || !this.newAppointment.date ||
      !this.newAppointment.startTime || !this.newAppointment.endTime) {
      alert('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      this.isLoading = true;

      const appointmentData = {
        userId: this.newAppointment.userId,
        psychologistId: this.currentUser.id,
        date: new Date(this.newAppointment.date),
        startTime: this.newAppointment.startTime,
        endTime: this.newAppointment.endTime,
        status: 'scheduled' as any,
        type: this.newAppointment.type as 'individual' | 'group' | 'consultation',
        notes: this.newAppointment.notes,
        createdBy: 'psychologist',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.appointmentService.createAppointment(appointmentData);

      // Refresh appointments
      this.appointments = await this.appointmentService.getPsychologistAppointments(this.currentUser.id);
      this.loadTodayAppointments();
      this.generateCalendar();

      this.closeAppointmentModal();
      alert('Wizyta została utworzona');

    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Wystąpił błąd podczas tworzenia wizyty');
    } finally {
      this.isLoading = false;
    }
  }

  async cancelAppointment(appointment: Appointment) {
    const reason = prompt('Podaj powód anulowania wizyty:');
    if (!reason) return;

    try {
      this.isLoading = true;

      await this.psychologistService.cancelAppointment(appointment.id, reason, true);

      // Update local data
      const index = this.appointments.findIndex(apt => apt.id === appointment.id);
      if (index !== -1) {
        this.appointments[index].status = 'cancelled';
      }

      this.loadTodayAppointments();
      alert('Wizyta została anulowana');

    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Wystąpił błąd podczas anulowania wizyty');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== CLIENT MANAGEMENT =====

  async removeClient(client: User) {
    const reason = prompt('Podaj powód usunięcia klienta:');
    if (!reason) return;

    try {
      this.isLoading = true;

      await this.psychologistService.removeClient(this.currentUser!.id, client.id, reason);

      // Remove from local data
      this.clients = this.clients.filter(c => c.id !== client.id);

      // Refresh appointments
      this.appointments = await this.appointmentService.getPsychologistAppointments(this.currentUser!.id);
      this.loadTodayAppointments();

      alert('Klient został usunięty');

    } catch (error) {
      console.error('Error removing client:', error);
      alert('Wystąpił błąd podczas usuwania klienta');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== UTILITY METHODS =====

  toggleOnlineStatus(checked: boolean) {
    this.isOnline = checked;
    console.log('Online status changed to:', this.isOnline);
    // Here you could update the status in Firebase
  }

  async refreshData() {
    try {
      this.isLoading = true;
      await this.loadDashboardData();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Wystąpił błąd podczas odświeżania danych');
    } finally {
      this.isLoading = false;
    }
  }

  addNote() {
    this.openAddNoteModal();
  }

  editNote(note: PsychologistNote) {
    this.openEditNoteModal(note);
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
