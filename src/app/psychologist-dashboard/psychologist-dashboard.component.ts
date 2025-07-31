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
            <!-- Online Status Toggle -->
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
          [class.active]="activeTab === 'schedule'"
          (click)="setActiveTab('schedule')"
        >
          Harmonogram
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
            
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>{{ stats.upcomingAppointments }}</h3>
                <p>Nadchodzące wizyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <h3>{{ stats.thisMonthSessions }}</h3>
                <p>Sesje w tym miesiącu</p>
              </div>
            </div>
          </div>

          <!-- Recent Appointments -->
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
                  Pacjent ID: {{ appointment.userId }}
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
                    class="btn btn-sm btn-secondary" 
                    (click)="viewPatientNotes(appointment.userId)"
                  >
                    Notatki
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noAppointments>
              <p class="no-data">Brak wizyt na dzisiaj</p>
            </ng-template>
          </div>
        </section>

        <!-- Appointments Tab -->
        <section class="appointments-section" *ngIf="activeTab === 'appointments'">
          <div class="section-header">
            <h3>Wszystkie wizyty</h3>
            <div class="filters">
              <select [(ngModel)]="appointmentFilter" (change)="filterAppointments()">
                <option value="">Wszystkie</option>
                <option value="scheduled">Zaplanowane</option>
                <option value="completed">Zakończone</option>
                <option value="cancelled">Anulowane</option>
              </select>
            </div>
          </div>

          <div class="appointments-table">
            <div class="table-header">
              <div class="col">Data</div>
              <div class="col">Godzina</div>
              <div class="col">Pacjent</div>
              <div class="col">Status</div>
              <div class="col">Akcje</div>
            </div>
            
            <div 
              *ngFor="let appointment of filteredAppointments" 
              class="table-row"
            >
              <div class="col">{{ appointment.date | date:'short' }}</div>
              <div class="col">{{ appointment.startTime }} - {{ appointment.endTime }}</div>
              <div class="col">Pacjent {{ appointment.userId }}</div>
              <div class="col">
                <span class="status-badge" [class]="appointment.status">
                  {{ getStatusText(appointment.status) }}
                </span>
              </div>
              <div class="col">
                <!-- Video Call Actions -->
                <div class="appointment-actions" *ngIf="appointment.status === 'scheduled'">
                  <!-- Meeting Link Creation -->
                  <div class="video-call-section" *ngIf="!appointment.meetingUrl">
                    <div class="platform-buttons">
                      <button 
                        class="btn btn-sm btn-google" 
                        (click)="createGoogleMeetLink(appointment)"
                        title="Utwórz Google Meet"
                      >
                        <i class="icon">📹</i>
                        Google Meet
                      </button>
                      <button 
                        class="btn btn-sm btn-teams" 
                        (click)="createTeamsLink(appointment)"
                        title="Utwórz Teams"
                      >
                        <i class="icon">💼</i>
                        Teams
                      </button>
                      <button 
                        class="btn btn-sm btn-zoom" 
                        (click)="generateMeetingLink(appointment, 'zoom')"
                        title="Utwórz Zoom"
                      >
                        <i class="icon">🎥</i>
                        Zoom
                      </button>
                    </div>
                  </div>

                  <!-- Meeting Link Actions -->
                  <div class="meeting-actions" *ngIf="appointment.meetingUrl">
                    <div class="meeting-url">
                      <span class="url-label">Link do spotkania:</span>
                      <a [href]="appointment.meetingUrl" target="_blank" class="meeting-link">
                        {{ appointment.meetingPlatform | titlecase }}
                      </a>
                      <button 
                        class="btn btn-sm btn-copy" 
                        (click)="copyMeetingUrl(appointment.meetingUrl)"
                        title="Kopiuj link"
                      >
                        📋
                      </button>
                    </div>
                    
                    <div class="call-actions">
                      <button 
                        class="btn btn-sm btn-success" 
                        (click)="startVideoCall(appointment)"
                        *ngIf="!activeVideoCall || activeVideoCall.id !== appointment.id"
                      >
                        <i class="icon">🚀</i>
                        Rozpocznij sesję
                      </button>
                      
                      <button 
                        class="btn btn-sm btn-danger" 
                        (click)="endVideoCall()"
                        *ngIf="activeVideoCall && activeVideoCall.id === appointment.id"
                      >
                        <i class="icon">⏹️</i>
                        Zakończ sesję
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Standard Actions -->
                <div class="standard-actions">
                  <button 
                    class="btn btn-sm btn-primary" 
                    (click)="completeAppointment(appointment)"
                    *ngIf="appointment.status === 'scheduled'"
                  >
                    Zakończ
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary" 
                    (click)="addNote(appointment)"
                  >
                    Dodaj notatkę
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Notes Tab -->
        <section class="notes-section" *ngIf="activeTab === 'notes'">
          <div class="section-header">
            <h3>Notatki pacjentów</h3>
            <button class="btn btn-primary" (click)="showAddNoteModal = true">
              Dodaj notatkę
            </button>
          </div>

          <div class="notes-list">
            <div 
              *ngFor="let note of patientNotes" 
              class="note-card"
            >
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <span class="note-date">{{ note.createdAt | date:'short' }}</span>
              </div>
              <div class="note-content">
                <p>{{ note.content }}</p>
              </div>
              <div class="note-footer">
                <span class="note-patient">Pacjent: {{ note.userId }}</span>
                <div class="note-actions">
                  <button class="btn btn-sm btn-secondary" (click)="editNote(note)">
                    Edytuj
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteNote(note.id)">
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Add Note Modal -->
      <div class="modal" *ngIf="showAddNoteModal" (click)="closeAddNoteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditingNote ? 'Edytuj notatkę' : 'Dodaj notatkę' }}</h3>
            <button class="close-btn" (click)="closeAddNoteModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveNote()" #noteForm="ngForm">
              <div class="form-group">
                <label>Pacjent:</label>
                <select [(ngModel)]="newNote.userId" name="userId" required>
                  <option value="">Wybierz pacjenta</option>
                  <option *ngFor="let patient of patients" [value]="patient.id">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Tytuł:</label>
                <input 
                  type="text" 
                  [(ngModel)]="newNote.title" 
                  name="title" 
                  required
                  placeholder="Tytuł notatki"
                >
              </div>
              
              <div class="form-group">
                <label>Treść:</label>
                <textarea 
                  [(ngModel)]="newNote.content" 
                  name="content" 
                  required
                  placeholder="Treść notatki..."
                  rows="5"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newNote.isVisibleToUser" 
                    name="isVisibleToUser"
                  >
                  Widoczne dla pacjenta
                </label>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAddNoteModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!noteForm.valid">
                  {{ isEditingNote ? 'Zapisz zmiany' : 'Dodaj notatkę' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./psychologist-dashboard.component.scss']
})
export class PsychologistDashboardComponent implements OnInit {
    currentUser: User | null = null;
    activeTab = 'overview';
    isLoading = false;

    // Online Status
    isOnline = false;
    onlineStatus: OnlineStatus | null = null;

    // Data
    stats: PsychologistStats = {
        totalSessions: 0,
        totalRevenue: 0,
        averageRating: 0,
        activeClients: 0,
        thisMonthSessions: 0,
        thisMonthRevenue: 0,
        upcomingAppointments: 0
    };

    appointments: Appointment[] = [];
    filteredAppointments: Appointment[] = [];
    todayAppointments: Appointment[] = [];
    patientNotes: PsychologistNote[] = [];
    patients: User[] = [];
    appointmentFilter = '';

    // Video Call
    activeVideoCall: any = null;

    // Note modal
    showAddNoteModal = false;
    isEditingNote = false;
    editingNoteId = '';
    newNote = {
        userId: '',
        title: '',
        content: '',
        isVisibleToUser: false
    };

    constructor(
        private authService: AuthService,
        private appointmentService: AppointmentService,
        private psychologistService: PsychologistService,
        private videoCallService: VideoCallService,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        if (!this.currentUser || this.currentUser.role !== 'psychologist') {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loadDashboardData();
    }

    async loadDashboardData() {
        this.isLoading = true;
        try {
            if (this.currentUser) {
                // Load stats
                this.stats = await this.psychologistService.getPsychologistStats(this.currentUser.id);

                // Load appointments
                this.appointments = await this.appointmentService.getPsychologistAppointments(this.currentUser.id);
                this.filteredAppointments = [...this.appointments];

                // Filter today's appointments
                const today = new Date();
                this.todayAppointments = this.appointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.toDateString() === today.toDateString();
                });

                // Load notes
                this.patientNotes = await this.psychologistService.getPsychologistNotes(this.currentUser.id);

                // Load patients (unique users from appointments)
                const patientIds = [...new Set(this.appointments.map(apt => apt.userId))];
                // TODO: Load actual patient data
                this.patients = patientIds.map(id => ({
                    id,
                    firstName: 'Pacjent',
                    lastName: id.substring(0, 8),
                    email: '',
                    role: 'user' as any,
                    isActive: true,
                    createdAt: new Date()
                }));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    logout() {
        this.authService.logout();
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'scheduled': return 'Zaplanowana';
            case 'completed': return 'Zakończona';
            case 'cancelled': return 'Anulowana';
            case 'no-show': return 'Niestawiennictwo';
            default: return status;
        }
    }

    filterAppointments() {
        if (!this.appointmentFilter) {
            this.filteredAppointments = [...this.appointments];
        } else {
            this.filteredAppointments = this.appointments.filter(apt =>
                apt.status === this.appointmentFilter
            );
        }
    }

    async startSession(appointment: Appointment) {
        try {
            await this.appointmentService.updateAppointment(appointment.id, {
                status: 'completed',
                psychologistNotes: 'Sesja rozpoczęta',
                updatedAt: new Date()
            });

            this.loadDashboardData(); // Refresh data
            alert('Sesja została rozpoczęta');
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Wystąpił błąd podczas rozpoczynania sesji');
        }
    }

    async completeAppointment(appointment: Appointment) {
        const notes = prompt('Dodaj notatki z sesji:');
        if (notes !== null) {
            try {
                await this.appointmentService.completeAppointment(appointment.id, notes);
                this.loadDashboardData(); // Refresh data
                alert('Wizyta została zakończona');
            } catch (error) {
                console.error('Error completing appointment:', error);
                alert('Wystąpił błąd podczas kończenia wizyty');
            }
        }
    }

    viewPatientNotes(userId: string) {
        this.setActiveTab('notes');
        // Filter notes for specific patient
        // TODO: Implement patient-specific notes filtering
    }

    addNote(appointment?: Appointment) {
        this.isEditingNote = false;
        this.newNote = {
            userId: appointment?.userId || '',
            title: '',
            content: '',
            isVisibleToUser: false
        };
        this.showAddNoteModal = true;
    }

    editNote(note: PsychologistNote) {
        this.isEditingNote = true;
        this.editingNoteId = note.id;
        this.newNote = {
            userId: note.userId,
            title: note.title,
            content: note.content,
            isVisibleToUser: note.isVisibleToUser
        };
        this.showAddNoteModal = true;
    }

    closeAddNoteModal() {
        this.showAddNoteModal = false;
        this.isEditingNote = false;
        this.editingNoteId = '';
        this.newNote = {
            userId: '',
            title: '',
            content: '',
            isVisibleToUser: false
        };
    }

    async saveNote() {
        if (!this.currentUser) return;

        try {
            if (this.isEditingNote) {
                await this.psychologistService.updateNote(this.editingNoteId, {
                    title: this.newNote.title,
                    content: this.newNote.content,
                    isVisibleToUser: this.newNote.isVisibleToUser,
                    updatedAt: new Date()
                });
            } else {
                await this.psychologistService.addNote({
                    psychologistId: this.currentUser.id,
                    userId: this.newNote.userId,
                    title: this.newNote.title,
                    content: this.newNote.content,
                    isVisibleToUser: this.newNote.isVisibleToUser,
                    createdAt: new Date()
                });
            }

            this.closeAddNoteModal();
            this.loadDashboardData(); // Refresh data
            alert('Notatka została zapisana');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Wystąpił błąd podczas zapisywania notatki');
        }
    }

    async deleteNote(noteId: string) {
        if (confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
            try {
                await this.psychologistService.deleteNote(noteId);
                this.loadDashboardData(); // Refresh data
                alert('Notatka została usunięta');
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Wystąpił błąd podczas usuwania notatki');
            }
        }
    }

    // Online Status Management
    toggleOnlineStatus(event: any) {
        this.isOnline = event.target.checked;
        this.videoCallService.setOnlineStatus(this.isOnline);
    }

    // Video Call Methods
    async createGoogleMeetLink(appointment: Appointment): Promise<void> {
        try {
            const meetingUrl = await this.videoCallService.createGoogleMeetLink(appointment.id);

            // Update appointment with meeting URL
            await this.appointmentService.updateAppointment(appointment.id, {
                meetingUrl,
                meetingPlatform: 'google-meet'
            });

            // Add to calendar
            await this.videoCallService.addToGoogleCalendar(
                appointment.id,
                meetingUrl,
                appointment.date,
                60
            );

            // Send invitation to client
            await this.videoCallService.sendMeetingInvitation(
                appointment.id,
                meetingUrl,
                appointment.userEmail || ''
            );

            alert(`Link do Google Meet został utworzony: ${meetingUrl}`);
            await this.loadDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error creating Google Meet link:', error);
            alert('Wystąpił błąd podczas tworzenia linku Google Meet');
        }
    }

    async createTeamsLink(appointment: Appointment): Promise<void> {
        try {
            const meetingUrl = await this.videoCallService.createTeamsLink(appointment.id);

            // Update appointment with meeting URL
            await this.appointmentService.updateAppointment(appointment.id, {
                meetingUrl,
                meetingPlatform: 'teams'
            });

            // Add to calendar
            await this.videoCallService.addToOutlookCalendar(
                appointment.id,
                meetingUrl,
                appointment.date,
                60
            );

            // Send invitation to client
            await this.videoCallService.sendMeetingInvitation(
                appointment.id,
                meetingUrl,
                appointment.userEmail || ''
            );

            alert(`Link do Microsoft Teams został utworzony: ${meetingUrl}`);
            await this.loadDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error creating Teams link:', error);
            alert('Wystąpił błąd podczas tworzenia linku Teams');
        }
    }

    async startVideoCall(appointment: Appointment): Promise<void> {
        if (!appointment.meetingUrl) {
            alert('Najpierw utwórz link do spotkania');
            return;
        }

        try {
            // Mark as active session
            this.activeVideoCall = appointment;

            // Update online status
            this.isOnline = true;
            this.videoCallService.setOnlineStatus(true);

            // Open meeting in new tab
            window.open(appointment.meetingUrl, '_blank');

            // Send reminder to client
            await this.videoCallService.sendMeetingReminder(
                appointment.id,
                appointment.meetingUrl,
                appointment.userEmail || '',
                5 // 5 minutes before
            );

            alert('Sesja została rozpoczęta. Klient otrzyma powiadomienie.');
        } catch (error) {
            console.error('Error starting video call:', error);
            alert('Wystąpił błąd podczas rozpoczynania sesji');
        }
    }

    async endVideoCall(): Promise<void> {
        if (!this.activeVideoCall) return;

        try {
            // Update appointment status
            await this.appointmentService.updateAppointment(this.activeVideoCall.id, {
                status: 'completed'
            });

            // Clear active session
            this.activeVideoCall = null;

            // Update online status
            this.isOnline = false;
            this.videoCallService.setOnlineStatus(false);

            await this.loadDashboardData(); // Refresh data
            alert('Sesja została zakończona');
        } catch (error) {
            console.error('Error ending video call:', error);
            alert('Wystąpił błąd podczas kończenia sesji');
        }
    }

    async generateMeetingLink(appointment: Appointment, platform: 'google-meet' | 'teams' | 'zoom'): Promise<void> {
        switch (platform) {
            case 'google-meet':
                await this.createGoogleMeetLink(appointment);
                break;
            case 'teams':
                await this.createTeamsLink(appointment);
                break;
            case 'zoom':
                try {
                    const meetingUrl = await this.videoCallService.createZoomMeeting(appointment.id, appointment.date);
                    await this.appointmentService.updateAppointment(appointment.id, {
                        meetingUrl,
                        meetingPlatform: 'zoom'
                    });
                    alert(`Link do Zoom został utworzony: ${meetingUrl}`);
                    await this.loadDashboardData();
                } catch (error) {
                    console.error('Error creating Zoom meeting:', error);
                    alert('Wystąpił błąd podczas tworzenia spotkania Zoom');
                }
                break;
        }
    }

    copyMeetingUrl(url: string): void {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link został skopiowany do schowka');
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
            alert('Nie udało się skopiować linku');
        });
    }
}
