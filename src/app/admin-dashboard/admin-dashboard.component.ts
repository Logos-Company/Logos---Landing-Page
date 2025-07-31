import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PsychologistService } from '../core/psychologist.service';
import { User } from '../models/user.model';
import { Psychologist } from '../models/psychologist.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel Administratora</h1>
          <div class="header-actions">
            <span class="user-role admin">ADMINISTRATOR</span>
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
          [class.active]="activeTab === 'users'"
          (click)="setActiveTab('users')"
        >
          Użytkownicy
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'psychologists'"
          (click)="setActiveTab('psychologists')"
        >
          Psycholodzy
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'analytics'"
          (click)="setActiveTab('analytics')"
        >
          Analityka
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'settings'"
          (click)="setActiveTab('settings')"
        >
          Ustawienia
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
            <div class="stat-card users">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ totalUsers }}</h3>
                <p>Łączna liczba użytkowników</p>
                <small>+{{ newUsersThisMonth }} w tym miesiącu</small>
              </div>
            </div>
            
            <div class="stat-card psychologists">
              <div class="stat-icon">🧠</div>
              <div class="stat-content">
                <h3>{{ totalPsychologists }}</h3>
                <p>Aktywni psycholodzy</p>
                <small>{{ pendingPsychologists }} oczekuje na weryfikację</small>
              </div>
            </div>
            
            <div class="stat-card revenue">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ totalRevenue | currency:'PLN':'symbol':'1.0-0' }}</h3>
                <p>Łączny przychód</p>
                <small>{{ monthlyRevenue | currency:'PLN':'symbol':'1.0-0' }} w tym miesiącu</small>
              </div>
            </div>
            
            <div class="stat-card sessions">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <h3>{{ totalSessions }}</h3>
                <p>Przeprowadzone sesje</p>
                <small>{{ sessionsThisMonth }} w tym miesiącu</small>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity">
            <h3>Ostatnia aktywność</h3>
            <div class="activity-list">
              <div *ngFor="let activity of recentActivities" class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <small class="activity-time">{{ activity.timestamp | date:'short' }}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Users Tab -->
        <section class="users-section" *ngIf="activeTab === 'users'">
          <div class="section-header">
            <h3>Zarządzanie użytkownikami</h3>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj użytkowników..." 
                [(ngModel)]="userSearchTerm"
                (input)="filterUsers()"
                class="search-input"
              >
              <select [(ngModel)]="userRoleFilter" (change)="filterUsers()">
                <option value="">Wszystkie role</option>
                <option value="user">Użytkownik</option>
                <option value="psychologist">Psycholog</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div class="users-table">
            <div class="table-header">
              <div class="col">Użytkownik</div>
              <div class="col">Email</div>
              <div class="col">Rola</div>
              <div class="col">Status</div>
              <div class="col">Data rejestracji</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let user of filteredUsers" class="table-row">
              <div class="col">
                <div class="user-info">
                  <div class="user-avatar">{{ getUserInitials(user) }}</div>
                  <div class="user-details">
                    <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
                  </div>
                </div>
              </div>
              <div class="col">{{ user.email }}</div>
              <div class="col">
                <span class="role-badge" [class]="user.role">{{ getRoleText(user.role) }}</span>
              </div>
              <div class="col">
                <span class="status-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </span>
              </div>
              <div class="col">{{ user.createdAt | date:'short' }}</div>
              <div class="col">
                <div class="user-actions">
                  <button class="btn btn-sm btn-primary" (click)="editUser(user)">
                    Edytuj
                  </button>
                  <button 
                    class="btn btn-sm" 
                    [class.btn-danger]="user.isActive"
                    [class.btn-secondary]="!user.isActive"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Psychologists Tab -->
        <section class="psychologists-section" *ngIf="activeTab === 'psychologists'">
          <div class="section-header">
            <h3>Zarządzanie psychologami</h3>
            <button class="btn btn-primary" (click)="showAddPsychologistModal = true">
              Dodaj psychologa
            </button>
          </div>

          <div class="psychologists-grid">
            <div *ngFor="let psychologist of psychologists" class="psychologist-card">
              <div class="psychologist-header">
                <div class="psychologist-avatar">
                  <img [src]="psychologist.profileImage || '/assets/default-psychologist.png'" 
                       [alt]="psychologist.firstName + ' ' + psychologist.lastName">
                </div>
                <div class="psychologist-info">
                  <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                  <p class="specializations">{{ psychologist.specializations.join(', ') }}</p>
                  <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-value">{{ psychologist.rating }}/5</span>
                    <span class="reviews-count">({{ psychologist.reviewCount }} opinii)</span>
                  </div>
                </div>
              </div>
              
              <div class="psychologist-stats">
                <div class="stat">
                  <span class="label">Sesje:</span>
                  <span class="value">{{ psychologist.completedSessions || psychologist.totalSessions || 0 }}</span>
                </div>
                <div class="stat">
                  <span class="label">Przychód:</span>
                  <span class="value">{{ (psychologist.totalRevenue || 0) | currency:'PLN':'symbol':'1.0-0' }}</span>
                </div>
                <div class="stat">
                  <span class="label">Status:</span>
                  <span class="value" [class.active]="psychologist.isActive">
                    {{ psychologist.isActive ? 'Aktywny' : 'Nieaktywny' }}
                  </span>
                </div>
              </div>
              
              <div class="psychologist-actions">
                <button class="btn btn-sm btn-secondary" (click)="viewPsychologistDetails(psychologist)">
                  Szczegóły
                </button>
                <button class="btn btn-sm btn-primary" (click)="editPsychologist(psychologist)">
                  Edytuj
                </button>
                <button 
                  class="btn btn-sm"
                  [class.btn-danger]="psychologist.isActive"
                  [class.btn-success]="!psychologist.isActive"
                  (click)="togglePsychologistStatus(psychologist)"
                >
                  {{ psychologist.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Analytics Tab -->
        <section class="analytics-section" *ngIf="activeTab === 'analytics'">
          <div class="analytics-grid">
            <div class="chart-container">
              <h4>Rejestracje użytkowników</h4>
              <div class="chart-placeholder">
                <p>Wykres rejestracji w czasie</p>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Przychody</h4>
              <div class="chart-placeholder">
                <p>Wykres przychodów miesięcznych</p>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Aktywność sesji</h4>
              <div class="chart-placeholder">
                <p>Wykres liczby sesji</p>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Najpopularniejsi psycholodzy</h4>
              <div class="chart-placeholder">
                <p>Ranking psychologów</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Add Psychologist Modal -->
      <div class="modal" *ngIf="showAddPsychologistModal" (click)="closeAddPsychologistModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Dodaj nowego psychologa</h3>
            <button class="close-btn" (click)="closeAddPsychologistModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="addPsychologist()" #psychologistForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Imię:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newPsychologist.firstName" 
                    name="firstName" 
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label>Nazwisko:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newPsychologist.lastName" 
                    name="lastName" 
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  [(ngModel)]="newPsychologist.email" 
                  name="email" 
                  required
                >
              </div>
              
              <div class="form-group">
                <label>Specjalizacje (oddziel przecinkami):</label>
                <input 
                  type="text" 
                  [(ngModel)]="specializationsText" 
                  name="specializations" 
                  placeholder="Terapia kognitywno-behawioralna, Psychoterapia, Terapia par"
                >
              </div>
              
              <div class="form-group">
                <label>Opis:</label>
                <textarea 
                  [(ngModel)]="newPsychologist.description" 
                  name="description" 
                  rows="4"
                  placeholder="Krótki opis psychologa..."
                ></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Cena za sesję (PLN):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newPsychologist.pricePerSession" 
                    name="pricePerSession" 
                    min="0"
                    step="10"
                  >
                </div>
                
                <div class="form-group">
                  <label>Doświadczenie (lata):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newPsychologist.experience" 
                    name="experience" 
                    min="0"
                  >
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAddPsychologistModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!psychologistForm.valid">
                  Dodaj psychologa
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    currentUser: User | null = null;
    activeTab = 'overview';
    isLoading = false;

    // Overview stats
    totalUsers = 0;
    newUsersThisMonth = 0;
    totalPsychologists = 0;
    pendingPsychologists = 0;
    totalRevenue = 0;
    monthlyRevenue = 0;
    totalSessions = 0;
    sessionsThisMonth = 0;

    // Data
    users: User[] = [];
    filteredUsers: User[] = [];
    psychologists: Psychologist[] = [];
    recentActivities: any[] = [];

    // Filters
    userSearchTerm = '';
    userRoleFilter = '';

    // Modal
    showAddPsychologistModal = false;
    newPsychologist = {
        firstName: '',
        lastName: '',
        email: '',
        description: '',
        pricePerSession: 150,
        experience: 1
    };
    specializationsText = '';

    constructor(
        private authService: AuthService,
        private psychologistService: PsychologistService,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loadDashboardData();
    }

    async loadDashboardData() {
        this.isLoading = true;
        try {
            // Load all data
            await this.loadOverviewStats();
            await this.loadUsers();
            await this.loadPsychologists();
            await this.loadRecentActivities();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadOverviewStats() {
        // TODO: Implement real stats loading from Firebase
        this.totalUsers = 1250;
        this.newUsersThisMonth = 89;
        this.totalPsychologists = 45;
        this.pendingPsychologists = 3;
        this.totalRevenue = 125000;
        this.monthlyRevenue = 15000;
        this.totalSessions = 890;
        this.sessionsThisMonth = 145;
    }

    async loadUsers() {
        // TODO: Implement real user loading from Firebase
        this.users = [
            {
                id: '1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan.kowalski@example.com',
                role: 'user',
                isActive: true,
                createdAt: new Date('2024-01-15')
            },
            {
                id: '2',
                firstName: 'Anna',
                lastName: 'Nowak',
                email: 'anna.nowak@example.com',
                role: 'psychologist',
                isActive: true,
                createdAt: new Date('2024-02-20')
            }
        ];
        this.filteredUsers = [...this.users];
    }

    async loadPsychologists() {
        try {
            this.psychologists = await this.psychologistService.getAllPsychologists();
        } catch (error) {
            console.error('Error loading psychologists:', error);
        }
    }

    async loadRecentActivities() {
        this.recentActivities = [
            {
                type: 'user-registered',
                description: 'Nowy użytkownik: Maria Kowalska',
                timestamp: new Date()
            },
            {
                type: 'session-completed',
                description: 'Zakończono sesję z dr. Janem Nowakiem',
                timestamp: new Date(Date.now() - 1000 * 60 * 30)
            },
            {
                type: 'payment-received',
                description: 'Otrzymano płatność 200 PLN',
                timestamp: new Date(Date.now() - 1000 * 60 * 60)
            }
        ];
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    logout() {
        this.authService.logout();
    }

    getActivityIcon(type: string): string {
        switch (type) {
            case 'user-registered': return '👤';
            case 'session-completed': return '✅';
            case 'payment-received': return '💰';
            case 'psychologist-verified': return '🧠';
            default: return '📋';
        }
    }

    getUserInitials(user: User): string {
        return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    }

    getRoleText(role: string): string {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'moderator': return 'Moderator';
            case 'psychologist': return 'Psycholog';
            case 'user': return 'Użytkownik';
            default: return role;
        }
    }

    filterUsers() {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !this.userSearchTerm ||
                user.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase());

            const matchesRole = !this.userRoleFilter || user.role === this.userRoleFilter;

            return matchesSearch && matchesRole;
        });
    }

    editUser(user: User) {
        // TODO: Implement user editing
        console.log('Edit user:', user);
    }

    async toggleUserStatus(user: User) {
        try {
            // TODO: Implement user status toggle in Firebase
            user.isActive = !user.isActive;
            console.log('User status toggled:', user);
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    }

    viewPsychologistDetails(psychologist: Psychologist) {
        // TODO: Implement psychologist details view
        console.log('View psychologist details:', psychologist);
    }

    editPsychologist(psychologist: Psychologist) {
        // TODO: Implement psychologist editing
        console.log('Edit psychologist:', psychologist);
    }

    async togglePsychologistStatus(psychologist: Psychologist) {
        try {
            await this.psychologistService.updatePsychologist(psychologist.id, {
                isActive: !psychologist.isActive
            });
            psychologist.isActive = !psychologist.isActive;
        } catch (error) {
            console.error('Error toggling psychologist status:', error);
        }
    }

    closeAddPsychologistModal() {
        this.showAddPsychologistModal = false;
        this.newPsychologist = {
            firstName: '',
            lastName: '',
            email: '',
            description: '',
            pricePerSession: 150,
            experience: 1
        };
        this.specializationsText = '';
    }

    async addPsychologist() {
        try {
            const specializations = this.specializationsText
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const psychologistData = {
                ...this.newPsychologist,
                specializations,
                isActive: true,
                rating: 5.0,
                reviewsCount: 0,
                completedSessions: 0,
                totalRevenue: 0,
                profileImage: '',
                workingHours: {
                    monday: { start: '09:00', end: '17:00', isAvailable: true },
                    tuesday: { start: '09:00', end: '17:00', isAvailable: true },
                    wednesday: { start: '09:00', end: '17:00', isAvailable: true },
                    thursday: { start: '09:00', end: '17:00', isAvailable: true },
                    friday: { start: '09:00', end: '17:00', isAvailable: true },
                    saturday: { start: '10:00', end: '14:00', isAvailable: false },
                    sunday: { start: '10:00', end: '14:00', isAvailable: false }
                },
                languages: ['Polski'],
                education: [],
                certificates: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.psychologistService.addPsychologist(psychologistData);
            this.closeAddPsychologistModal();
            this.loadPsychologists();
            alert('Psycholog został dodany pomyślnie');
        } catch (error) {
            console.error('Error adding psychologist:', error);
            alert('Wystąpił błąd podczas dodawania psychologa');
        }
    }
}
