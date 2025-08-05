import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { PackageService } from '../core/package.service';
import { UserService } from '../core/user.service';
import { User, UserStats, Review, PsychologistChangeRequest } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Psychologist, PsychologistNote } from '../models/psychologist.model';
import { Package } from '../models/user.model';
import { CalendarComponent } from '../shared/calendar/calendar.component';
import { PsychologistSearchComponent } from '../shared/psychologist-search/psychologist-search.component';
import { PackageManagementComponent } from '../shared/package-management/package-management.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarComponent,
    PsychologistSearchComponent,
    PackageManagementComponent
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Użytkownika</h1>
          <div class="header-actions">
            <span class="user-role user">UŻYTKOWNIK</span>
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
          [class.active]="activeTab === 'calendar'"
          (click)="setActiveTab('calendar')"
        >
          Kalendarz
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'search'"
          (click)="setActiveTab('search')"
        >
          Znajdź psychologa
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'psychologists'"
          (click)="setActiveTab('psychologists')"
        >
          Psychologowie
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'profile'"
          (click)="setActiveTab('profile')"
        >
          Profil
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
          [class.active]="activeTab === 'reviews'"
          (click)="setActiveTab('reviews')"
        >
          Opinie
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'packages'"
          (click)="setActiveTab('packages')"
        >
          Pakiety
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
          <div class="welcome-card">
            <h2>Witaj, {{ currentUser?.firstName }}!</h2>
            <p>Zarządzaj swoimi wizytami i korzystaj z usług psychologicznych.</p>
            
            <!-- Assignment Status -->
            <div class="assignment-status" *ngIf="currentUser?.assignedPsychologistId">
              <div class="status-card" [ngClass]="currentUser?.assignmentStatus">
                <h4>Status przypisania do psychologa</h4>
                <p *ngIf="currentUser?.assignmentStatus === 'pending'">
                  🟡 Oczekuje na zatwierdzenie przez administratora
                </p>
                <p *ngIf="currentUser?.assignmentStatus === 'approved'">
                  ✅ Przypisanie zatwierdzone - możesz umówić się na wizytę
                </p>
                <p *ngIf="currentUser?.assignmentStatus === 'rejected'">
                  ❌ Przypisanie odrzucone - wybierz innego psychologa
                </p>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>{{ userStats.upcomingAppointments }}</h3>
                <p>Nadchodzące wizyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ userStats.completedSessions }}</h3>
                <p>Zakończone sesje</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ remainingCredits }}</h3>
                <p>Pozostałe kredyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🧠</div>
              <div class="stat-content">
                <h3>{{ assignedPsychologist?.firstName || 'Brak' }}</h3>
                <p>Przypisany psycholog</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💵</div>
              <div class="stat-content">
                <h3>{{ userStats.totalSpent }} zł</h3>
                <p>Łączne wydatki</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <h3>{{ userStats.sessionsThisMonth }}</h3>
                <p>Sesje w tym miesiącu</p>
              </div>
            </div>
          </div>

          <!-- Assigned Psychologist Info -->
          <div class="psychologist-card" *ngIf="assignedPsychologist && currentUser?.assignmentStatus === 'approved'">
            <h3>Twój psycholog</h3>
            <div class="psychologist-info">
              <div class="psychologist-avatar">
                <img [src]="assignedPsychologist.profileImage || '/assets/default-avatar.png'" 
                     [alt]="assignedPsychologist.firstName">
              </div>
              <div class="psychologist-details">
                <h4>{{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</h4>
                <p class="specializations">{{ assignedPsychologist.specializations?.join(', ') }}</p>
                <p class="rating">⭐ {{ assignedPsychologist.rating }}/5 ({{ assignedPsychologist.reviewCount }} opinii)</p>
                <div class="psychologist-actions">
                  <button class="btn btn-primary" (click)="setActiveTab('calendar')">
                    Umów wizytę
                  </button>
                  <button class="btn btn-secondary" (click)="showChangePsychologist = true">
                    Zmień psychologa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Appointments -->
          <div class="recent-appointments" *ngIf="recentAppointments.length > 0">
            <h3>Ostatnie wizyty</h3>
            <div class="appointments-list">
              <div 
                *ngFor="let appointment of recentAppointments" 
                class="appointment-card"
                [class]="appointment.status"
              >
                <div class="appointment-date">
                  {{ appointment.date | date:'short' }}
                </div>
                <div class="appointment-time">
                  {{ appointment.startTime }} - {{ appointment.endTime }}
                </div>
                <div class="appointment-psychologist">
                  {{ appointment.psychologistName }}
                </div>
                <div class="appointment-status">
                  {{ getStatusText(appointment.status) }}
                </div>
                <div class="appointment-actions" *ngIf="appointment.status === 'completed'">
                  <button class="btn btn-sm btn-secondary" (click)="rateSession(appointment)">
                    Oceń sesję
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Szybkie akcje</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="setActiveTab('calendar')" 
                      [disabled]="currentUser?.assignmentStatus !== 'approved'">
                <div class="action-icon">📅</div>
                <span>Umów wizytę</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('psychologists')">
                <div class="action-icon">🔍</div>
                <span>Znajdź psychologa</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('packages')">
                <div class="action-icon">💎</div>
                <span>Kup pakiet</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('notes')">
                <div class="action-icon">📝</div>
                <span>Moje notatki</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Psychologists Tab -->
        <section class="psychologists-section" *ngIf="activeTab === 'psychologists'">
          <div class="section-header">
            <h3>Lista psychologów</h3>
            <div class="search-filters">
              <input 
                type="text" 
                placeholder="Szukaj psychologa..." 
                [(ngModel)]="searchTerm"
                (input)="searchPsychologists()"
                class="search-input"
              >
              <select [(ngModel)]="selectedSpecialization" (change)="filterPsychologists()">
                <option value="">Wszystkie specjalizacje</option>
                <option value="anxiety">Zaburzenia lękowe</option>
                <option value="depression">Depresja</option>
                <option value="relationships">Problemy w związkach</option>
                <option value="trauma">Trauma</option>
                <option value="addiction">Uzależnienia</option>
              </select>
            </div>
          </div>

          <div class="psychologists-grid">
            <div 
              *ngFor="let psychologist of filteredPsychologists" 
              class="psychologist-card"
              [class.premium]="psychologist.premiumListing"
            >
              <div class="psychologist-header">
                <img [src]="psychologist.profileImage || '/assets/default-avatar.png'" 
                     [alt]="psychologist.firstName" class="avatar">
                <div class="psychologist-info">
                  <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                  <span class="premium-badge" *ngIf="psychologist.premiumListing">⭐ Premium</span>
                  <p class="rating">⭐ {{ psychologist.rating || 0 }}/5 ({{ psychologist.reviewCount || 0 }} opinii)</p>
                </div>
              </div>
              
              <div class="psychologist-details">
                <p class="specializations">{{ psychologist.specializations?.join(', ') }}</p>
                <p class="description">{{ psychologist.description }}</p>
                <p class="experience">Doświadczenie: {{ psychologist.experience }} lat</p>
                <p class="price">{{ psychologist.hourlyRate || 100 }} zł/sesja</p>
              </div>
              
              <div class="psychologist-actions">
                <button 
                  class="btn btn-primary" 
                  (click)="selectPsychologist(psychologist)"
                  [disabled]="currentUser?.assignedPsychologistId === psychologist.id"
                >
                  {{ currentUser?.assignedPsychologistId === psychologist.id ? 'Aktualny psycholog' : 'Wybierz' }}
                </button>
                <button class="btn btn-secondary" (click)="viewPsychologistProfile(psychologist)">
                  Zobacz profil
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Profile Tab -->
        <section class="profile-section" *ngIf="activeTab === 'profile'">
          <div class="profile-form">
            <h3>Edytuj profil</h3>
            
            <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Imię:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.firstName" 
                    name="firstName" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Nazwisko:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.lastName" 
                    name="lastName" 
                    required
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    [(ngModel)]="profileData.email" 
                    name="email" 
                    required
                    readonly
                  >
                </div>
                <div class="form-group">
                  <label>Telefon:</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="profileData.phone" 
                    name="phone"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Adres:</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileData.address" 
                  name="address"
                  placeholder="Ulica i numer"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Miasto:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.city" 
                    name="city"
                  >
                </div>
                <div class="form-group">
                  <label>Kod pocztowy:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.postalCode" 
                    name="postalCode"
                    pattern="[0-9]{2}-[0-9]{3}"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Preferencje sesji:</label>
                <select [(ngModel)]="profileData.sessionType" name="sessionType">
                  <option value="online">Online</option>
                  <option value="in-person">Stacjonarnie</option>
                  <option value="both">Bez preferencji</option>
                </select>
              </div>

              <div class="form-group">
                <label>Cele terapii:</label>
                <textarea 
                  [(ngModel)]="profileData.goals" 
                  name="goals"
                  rows="4"
                  placeholder="Opisz swoje cele terapeutyczne..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid">
                Zapisz zmiany
              </button>
            </form>
          </div>
        </section>

        <!-- Notes Tab -->
        <section class="notes-section" *ngIf="activeTab === 'notes'">
          <div class="section-header">
            <h3>Notatki z sesji</h3>
            <p class="section-description">Notatki pozostawione przez Twojego psychologa</p>
          </div>

          <div class="notes-list" *ngIf="userNotes.length > 0; else noNotes">
            <div *ngFor="let note of userNotes" class="note-card">
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <span class="note-date">{{ note.createdAt | date:'short' }}</span>
              </div>
              <div class="note-content">
                <p>{{ note.content }}</p>
              </div>
              <div class="note-footer" *ngIf="note.tags">
                <div class="note-tags">
                  <span *ngFor="let tag of note.tags" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <ng-template #noNotes>
            <div class="empty-state">
              <p>Nie masz jeszcze żadnych notatek z sesji.</p>
              <p>Notatki będą widoczne po odbyciu sesji z psychologiem.</p>
            </div>
          </ng-template>
        </section>

        <!-- Reviews Tab -->
        <section class="reviews-section" *ngIf="activeTab === 'reviews'">
          <div class="section-header">
            <h3>Moje opinie</h3>
            <button class="btn btn-primary" (click)="showAddReview = true" 
                    *ngIf="assignedPsychologist && userStats.completedSessions > 0">
              Dodaj opinię
            </button>
          </div>

          <div class="reviews-list" *ngIf="userReviews.length > 0; else noReviews">
            <div *ngFor="let review of userReviews" class="review-card">
              <div class="review-header">
                <div class="rating">
                  <span *ngFor="let star of [1,2,3,4,5]" 
                        [class.filled]="star <= review.rating">⭐</span>
                  <span class="rating-value">{{ review.rating }}/5</span>
                </div>
                <span class="review-date">{{ review.createdAt | date:'short' }}</span>
              </div>
              <div class="review-content">
                <p>{{ review.comment }}</p>
              </div>
              <div class="review-footer">
                <span class="review-status" [class]="review.status">
                  {{ getReviewStatusText(review.status) }}
                </span>
              </div>
            </div>
          </div>
          
          <ng-template #noReviews>
            <div class="empty-state">
              <p>Nie wystawiłeś jeszcze żadnych opinii.</p>
              <p *ngIf="userStats.completedSessions === 0">Odbędź pierwszą sesję, aby móc wystawić opinię.</p>
            </div>
          </ng-template>
        </section>

        <!-- Calendar Tab -->
        <section class="calendar-section" *ngIf="activeTab === 'calendar'">
          <div class="calendar-header" *ngIf="currentUser?.assignmentStatus !== 'approved'">
            <div class="warning-message">
              <p>⚠️ Aby umówić wizytę, musisz najpierw wybrać psychologa i otrzymać zatwierdzenie od administratora.</p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                Wybierz psychologa
              </button>
            </div>
          </div>
          
          <app-calendar *ngIf="currentUser?.assignmentStatus === 'approved'"></app-calendar>
        </section>

        <!-- Search Tab (Legacy) -->
        <section class="search-section" *ngIf="activeTab === 'search'">
          <app-psychologist-search></app-psychologist-search>
        </section>

        <!-- Packages Tab -->
        <section class="packages-section" *ngIf="activeTab === 'packages'">
          <app-package-management></app-package-management>
        </section>
      </main>

      <!-- Change Psychologist Modal -->
      <div class="modal" *ngIf="showChangePsychologist" (click)="closeChangePsychologistModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Zmiana psychologa</h3>
            <button class="close-btn" (click)="closeChangePsychologistModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="submitPsychologistChange()" #changeForm="ngForm">
              <div class="form-group">
                <label>Wybierz nowego psychologa:</label>
                <select [(ngModel)]="changeRequest.newPsychologistId" name="newPsychologistId" required>
                  <option value="">Wybierz psychologa</option>
                  <option *ngFor="let psychologist of allPsychologists" 
                          [value]="psychologist.id"
                          [disabled]="psychologist.id === currentUser?.assignedPsychologistId">
                    {{ psychologist.firstName }} {{ psychologist.lastName }} - {{ psychologist.specializations?.join(', ') }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Powód zmiany:</label>
                <textarea 
                  [(ngModel)]="changeRequest.reason" 
                  name="reason" 
                  required
                  rows="4"
                  placeholder="Opisz powód, dla którego chcesz zmienić psychologa..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Priorytet:</label>
                <select [(ngModel)]="changeRequest.urgency" name="urgency" required>
                  <option value="low">Niski</option>
                  <option value="medium">Średni</option>
                  <option value="high">Wysoki</option>
                </select>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeChangePsychologistModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!changeForm.valid">
                  Wyślij prośbę
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Review Modal -->
      <div class="modal" *ngIf="showAddReview" (click)="closeAddReviewModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Oceń sesję</h3>
            <button class="close-btn" (click)="closeAddReviewModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
              <div class="form-group">
                <label>Ocena:</label>
                <div class="star-rating">
                  <span *ngFor="let star of [1,2,3,4,5]" 
                        class="star"
                        [class.filled]="star <= newReview.rating"
                        (click)="setRating(star)">⭐</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Komentarz:</label>
                <textarea 
                  [(ngModel)]="newReview.comment" 
                  name="comment" 
                  rows="4"
                  placeholder="Opisz swoją opinię o sesji..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newReview.wouldRecommend" 
                    name="wouldRecommend"
                  >
                  Polecałbyś tego psychologa?
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newReview.isAnonymous" 
                    name="isAnonymous"
                  >
                  Publikuj anonimowo
                </label>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAddReviewModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="newReview.rating === 0">
                  Wyślij opinię
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Change Psychologist Modal -->
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;

  // Data
  userStats: UserStats = {
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    upcomingAppointments: 0,
    totalSpent: 0,
    sessionsThisMonth: 0
  };
  remainingCredits = 0;
  assignedPsychologist: User | null = null;
  currentPackage: Package | null = null;
  recentAppointments: Appointment[] = [];
  userNotes: PsychologistNote[] = [];
  userReviews: Review[] = [];

  // Psychologists
  allPsychologists: User[] = [];
  filteredPsychologists: User[] = [];
  searchTerm = '';
  selectedSpecialization = '';

  // Profile
  profileData: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    sessionType: 'both',
    goals: ''
  };

  // Modals
  showChangePsychologist = false;
  showAddReview = false;

  // Forms
  changeRequest = {
    newPsychologistId: '',
    reason: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  };

  newReview = {
    rating: 0,
    comment: '',
    wouldRecommend: false,
    isAnonymous: false
  };

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private packageService: PackageService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect if user has specific role
    if (this.currentUser.role !== 'user') {
      const dashboardRoute = this.authService.redirectToDashboard(this.currentUser);
      this.router.navigate([dashboardRoute]);
      return;
    }

    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      if (this.currentUser) {
        // Load user stats
        this.userStats = await this.userService.getUserStats(this.currentUser.id);

        // Load user's appointments
        const appointments = await this.appointmentService.getUserAppointments(this.currentUser.id);

        this.recentAppointments = appointments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Load assigned psychologist if exists
        if (this.currentUser.assignedPsychologistId) {
          const psychologist = await this.psychologistService.getPsychologist(
            this.currentUser.assignedPsychologistId
          );
          if (psychologist) {
            this.assignedPsychologist = {
              ...psychologist,
              role: 'psychologist' as any,
              isActive: true,
              createdAt: new Date()
            };
          }
        }

        // Load current package
        if (this.currentUser.activePackageId) {
          this.currentPackage = await this.packageService.getPackage(
            this.currentUser.activePackageId
          );
          this.remainingCredits = this.currentPackage?.remainingCredits || 0;
        }

        // Load user notes
        this.userNotes = await this.userService.getUserNotes(this.currentUser.id);

        // Load user reviews
        this.userReviews = await this.userService.getUserReviews(this.currentUser.id);

        // Load all psychologists for selection
        this.allPsychologists = await this.userService.getAllPsychologists();
        this.filteredPsychologists = [...this.allPsychologists];

        // Load profile data
        this.profileData = {
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          email: this.currentUser.email,
          phone: this.currentUser.phone || '',
          address: this.currentUser.profileData?.address || '',
          city: this.currentUser.profileData?.city || '',
          postalCode: this.currentUser.profileData?.postalCode || '',
          sessionType: this.currentUser.profileData?.preferences?.sessionType || 'both',
          goals: this.currentUser.profileData?.goals || ''
        };
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

  getReviewStatusText(status?: string): string {
    switch (status) {
      case 'pending': return 'Oczekuje na moderację';
      case 'approved': return 'Zatwierdzona';
      case 'rejected': return 'Odrzucona';
      default: return 'Nieznany';
    }
  }

  // ===== PSYCHOLOGIST SEARCH & SELECTION =====

  searchPsychologists(): void {
    this.filterPsychologists();
  }

  filterPsychologists(): void {
    let filtered = [...this.allPsychologists];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.specializations?.some(spec =>
          spec.toLowerCase().includes(this.searchTerm.toLowerCase())
        ) ||
        p.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedSpecialization) {
      filtered = filtered.filter(p =>
        p.specializations?.includes(this.selectedSpecialization)
      );
    }

    this.filteredPsychologists = filtered;
  }

  async selectPsychologist(psychologist: User): Promise<void> {
    if (!this.currentUser) return;

    try {
      await this.userService.requestPsychologistAssignment(
        this.currentUser.id,
        psychologist.id,
        `Użytkownik wybrał psychologa: ${psychologist.firstName} ${psychologist.lastName}`
      );

      // Update current user data
      this.currentUser.assignedPsychologistId = psychologist.id;
      this.currentUser.assignmentStatus = 'pending';
      this.assignedPsychologist = psychologist;

      alert('Prośba o przypisanie do psychologa została wysłana. Oczekuj na zatwierdzenie przez administratora.');
    } catch (error) {
      console.error('Error selecting psychologist:', error);
      alert('Wystąpił błąd podczas wybierania psychologa');
    }
  }

  viewPsychologistProfile(psychologist: User): void {
    // TODO: Navigate to psychologist profile page
    console.log('View psychologist profile:', psychologist);
  }

  // ===== PROFILE MANAGEMENT =====

  async updateProfile(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Update basic info
      await this.userService.updateUserBasicInfo(this.currentUser.id, {
        firstName: this.profileData.firstName,
        lastName: this.profileData.lastName,
        phone: this.profileData.phone
      });

      // Update profile data
      await this.userService.updateUserProfile(this.currentUser.id, {
        address: this.profileData.address,
        city: this.profileData.city,
        postalCode: this.profileData.postalCode,
        goals: this.profileData.goals,
        preferences: {
          sessionType: this.profileData.sessionType,
          language: 'pl',
          gender: 'no-preference',
          specialization: []
        }
      });

      // Update local user data
      this.currentUser.firstName = this.profileData.firstName;
      this.currentUser.lastName = this.profileData.lastName;
      this.currentUser.phone = this.profileData.phone;

      alert('Profil został zaktualizowany pomyślnie');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Wystąpił błąd podczas aktualizacji profilu');
    }
  }

  // ===== PSYCHOLOGIST CHANGE =====

  closeChangePsychologistModal(): void {
    this.showChangePsychologist = false;
    this.changeRequest = {
      newPsychologistId: '',
      reason: '',
      urgency: 'medium'
    };
  }

  async submitPsychologistChange(): Promise<void> {
    if (!this.currentUser) return;

    try {
      await this.userService.changePsychologist(
        this.currentUser.id,
        this.changeRequest.newPsychologistId,
        this.changeRequest.reason,
        this.changeRequest.urgency
      );

      this.closeChangePsychologistModal();
      alert('Prośba o zmianę psychologa została wysłana. Otrzymasz powiadomienie o decyzji administratora.');
    } catch (error) {
      console.error('Error submitting psychologist change:', error);
      alert('Wystąpił błąd podczas wysyłania prośby o zmianę psychologa');
    }
  }

  // ===== REVIEWS =====

  closeAddReviewModal(): void {
    this.showAddReview = false;
    this.newReview = {
      rating: 0,
      comment: '',
      wouldRecommend: false,
      isAnonymous: false
    };
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  async submitReview(): Promise<void> {
    if (!this.currentUser || !this.assignedPsychologist) return;

    try {
      await this.userService.addReview({
        userId: this.currentUser.id,
        psychologistId: this.assignedPsychologist.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        isAnonymous: this.newReview.isAnonymous,
        createdAt: new Date(),
        sessionCount: this.userStats.completedSessions,
        wouldRecommend: this.newReview.wouldRecommend
      });

      this.closeAddReviewModal();
      alert('Opinia została wysłana i oczekuje na moderację');

      // Refresh reviews
      this.userReviews = await this.userService.getUserReviews(this.currentUser.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Wystąpił błąd podczas wysyłania opinii');
    }
  }

  rateSession(appointment: Appointment): void {
    // Set appointment context for review
    this.showAddReview = true;
    // Could add appointment-specific data to review
  }
}
