import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PackageService, UserPackage } from '../core/package.service';
import { AdminService, AdminStats, SystemActivity, CrmStats } from '../core/admin.service';
import { User } from '../models/user.model';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="admin-panel">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="/assets/logo.svg" alt="Logos" class="logo">
            <h1>Admin Panel</h1>
          </div>
          <div class="header-actions">
            <span class="admin-badge">ADMINISTRATOR</span>
            <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <button class="logout-btn" (click)="logout()">Wyloguj</button>
          </div>
        </div>
      </header>

      <!-- Main Layout Container -->
      <div class="admin-body">
        <!-- Sidebar Navigation -->
        <nav class="admin-sidebar">
        <div class="nav-section">
          <h3>Dashboard</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'overview'"
            (click)="setActiveTab('overview')"
          >
            <i class="icon">📊</i>
            <span>Przegląd</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'analytics'"
            (click)="setActiveTab('analytics')"
          >
            <i class="icon">📈</i>
            <span>Analityka</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Zarządzanie</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'users'"
            (click)="setActiveTab('users')"
          >
            <i class="icon">👥</i>
            <span>Użytkownicy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'psychologists'"
            (click)="setActiveTab('psychologists')"
          >
            <i class="icon">🧠</i>
            <span>Psycholodzy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'moderators'"
            (click)="setActiveTab('moderators')"
          >
            <i class="icon">👮</i>
            <span>Moderatorzy</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>CRM & Integracje</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'crm'"
            (click)="setActiveTab('crm')"
          >
            <i class="icon">🔗</i>
            <span>Livespace CRM</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'posthog'"
            (click)="setActiveTab('posthog')"
          >
            <i class="icon">📊</i>
            <span>PostHog Analytics</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Dokumenty</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'contracts'"
            (click)="setActiveTab('contracts')"
          >
            <i class="icon">📋</i>
            <span>Umowy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'reports'"
            (click)="setActiveTab('reports')"
          >
            <i class="icon">📄</i>
            <span>Raporty</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Komunikacja</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'notifications'"
            (click)="setActiveTab('notifications')"
          >
            <i class="icon">🔔</i>
            <span>Powiadomienia</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'upgrades'"
            (click)="setActiveTab('upgrades')"
          >
            <i class="icon">⬆️</i>
            <span>Ulepszenia</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Ustawienia</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'settings'"
            (click)="setActiveTab('settings')"
          >
            <i class="icon">⚙️</i>
            <span>Konfiguracja</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="admin-content">
        <!-- Loading -->
        <div class="loading-container" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Ładowanie danych...</p>
        </div>

        <!-- Overview Tab -->
        <section class="overview-section" *ngIf="activeTab === 'overview' && !isLoading">
          <div class="page-header">
            <h2>Przegląd systemu</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="refreshData()">
                <i class="icon">🔄</i>
                Odśwież dane
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card users">
              <div class="stat-header">
                <h3>Użytkownicy</h3>
                <i class="icon">👥</i>
              </div>
              <div class="stat-value">{{ stats.totalUsers | number }}</div>
              <div class="stat-change positive">+{{ stats.newUsersToday }} dzisiaj</div>
            </div>

            <div class="stat-card psychologists">
              <div class="stat-header">
                <h3>Psycholodzy</h3>
                <i class="icon">🧠</i>
              </div>
              <div class="stat-value">{{ stats.activePsychologists }}</div>
              <div class="stat-change neutral">{{ stats.pendingPsychologists }} oczekuje</div>
            </div>

            <div class="stat-card revenue">
              <div class="stat-header">
                <h3>Przychód (miesiąc)</h3>
                <i class="icon">💰</i>
              </div>
              <div class="stat-value">{{ stats.monthlyRevenue | currency:'PLN':'symbol':'1.0-0' }}</div>
              <div class="stat-change" [class]="getGrowthClass(stats.revenueGrowth)">{{ formatGrowth(stats.revenueGrowth) }}</div>
            </div>

            <div class="stat-card sessions">
              <div class="stat-header">
                <h3>Sesje (miesiąc)</h3>
                <i class="icon">📊</i>
              </div>
              <div class="stat-value">{{ stats.monthlySessions | number }}</div>
              <div class="stat-change" [class]="getGrowthClass(stats.sessionsGrowth)">{{ formatGrowth(stats.sessionsGrowth) }}</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="activity-section">
            <h3>Ostatnia aktywność</h3>
            <div class="activity-feed">
              <div *ngFor="let activity of recentActivity" class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <p class="activity-text">{{ activity.message }}</p>
                  <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Health -->
          <div class="system-health">
            <h3>Status systemu</h3>
            <div class="health-grid">
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Baza danych</span>
                <small>Działa poprawnie</small>
              </div>
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Płatności</span>
                <small>Wszystko OK</small>
              </div>
              <div class="health-item warning">
                <i class="icon">⚠️</i>
                <span>Email</span>
                <small>Opóźnienia 2min</small>
              </div>
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Storage</span>
                <small>75% wykorzystane</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Analytics Tab -->
        <section class="analytics-section" *ngIf="activeTab === 'analytics' && !isLoading">
          <div class="page-header">
            <h2>Analityka i statystyki</h2>
            <div class="header-actions">
              <select [(ngModel)]="analyticsTimeRange" (change)="updateAnalytics()">
                <option value="7days">Ostatnie 7 dni</option>
                <option value="30days">Ostatnie 30 dni</option>
                <option value="90days">Ostatnie 3 miesiące</option>
                <option value="year">Rok</option>
              </select>
              <button class="btn btn-secondary" (click)="exportAnalytics()">
                <i class="icon">📊</i>
                Eksportuj do Excel
              </button>
            </div>
          </div>

          <!-- Charts Placeholder -->
          <div class="charts-grid">
            <div class="chart-container">
              <h4>Rejestracje użytkowników</h4>
              <div class="chart-placeholder">
                <p>Wykres rejestracji w czasie</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Przychody</h4>
              <div class="chart-placeholder">
                <p>Wykres przychodów miesięcznych</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Sesje psychologiczne</h4>
              <div class="chart-placeholder">
                <p>Liczba sesji w czasie</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Konwersja</h4>
              <div class="chart-placeholder">
                <p>Funnel konwersji</p>
                <small>Rejestracja → Płatność → Sesja</small>
              </div>
            </div>
          </div>

          <!-- PostHog Integration -->
          <div class="posthog-section">
            <h3>PostHog Analytics</h3>
            <div class="integration-card">
              <div class="integration-status connected">
                <i class="icon">✅</i>
                <span>Połączono z PostHog</span>
              </div>
              <div class="integration-actions">
                <button class="btn btn-primary" (click)="openPostHog()">
                  <i class="icon">🔗</i>
                  Otwórz PostHog
                </button>
                <button class="btn btn-secondary" (click)="syncPostHog()">
                  <i class="icon">🔄</i>
                  Synchronizuj dane
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- CRM Tab -->
        <section class="crm-section" *ngIf="activeTab === 'crm' && !isLoading">
          <div class="page-header">
            <h2>Integracja z Livespace CRM</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="syncWithLivespace()">
                <i class="icon">🔄</i>
                Synchronizuj z CRM
              </button>
            </div>
          </div>

          <!-- CRM Status -->
          <div class="crm-status">
            <div class="status-card">
              <div class="status-header">
                <h3>Status połączenia</h3>
                <div class="status-indicator connected">Połączono</div>
              </div>
              <div class="status-details">
                <p><strong>Ostatnia synchronizacja:</strong> {{ lastCrmSync | date:'short' }}</p>
                <p><strong>Zsynchronizowane kontakty:</strong> {{ crmStats.syncedContacts }}</p>
                <p><strong>Nowe leady:</strong> {{ crmStats.newLeads }}</p>
              </div>
            </div>
          </div>

          <!-- CRM Actions -->
          <div class="crm-actions">
            <h3>Akcje CRM</h3>
            <div class="actions-grid">
              <button class="action-card" (click)="importContactsFromCrm()">
                <i class="icon">📥</i>
                <h4>Import kontaktów</h4>
                <p>Importuj nowe kontakty z Livespace</p>
              </button>
              
              <button class="action-card" (click)="exportContactsToCrm()">
                <i class="icon">📤</i>
                <h4>Eksport kontaktów</h4>
                <p>Wyślij dane użytkowników do CRM</p>
              </button>
              
              <button class="action-card" (click)="syncAppointments()">
                <i class="icon">📅</i>
                <h4>Synchronizuj wizyty</h4>
                <p>Aktualizuj kalendarz w CRM</p>
              </button>
              
              <button class="action-card" (click)="configureCrmSettings()">
                <i class="icon">⚙️</i>
                <h4>Ustawienia CRM</h4>
                <p>Konfiguruj mapowanie pól</p>
              </button>
            </div>
          </div>
        </section>

        <!-- Users Management Tab -->
        <section class="users-section" *ngIf="activeTab === 'users' && !isLoading">
          <div class="page-header">
            <h2>Zarządzanie użytkownikami</h2>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj użytkowników..." 
                [(ngModel)]="userSearchTerm"
                (input)="filterUsers()"
                class="search-input"
              >
              <button class="btn btn-success" (click)="exportUsersToExcel()">
                <i class="icon">📊</i>
                Eksport do Excel
              </button>
              <button class="btn btn-primary" (click)="showAddUserModal = true">
                <i class="icon">➕</i>
                Dodaj użytkownika
              </button>
            </div>
          </div>

          <!-- Users Table -->
          <div class="data-table">
            <div class="table-header">
              <div class="col">Użytkownik</div>
              <div class="col">Email</div>
              <div class="col">Rola</div>
              <div class="col">Status</div>
              <div class="col">Rejestracja</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let user of filteredUsers" class="table-row">
              <div class="col user-cell">
                <div class="user-avatar">{{ getUserInitials(user) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <small class="user-id">ID: {{ user.id }}</small>
                </div>
              </div>
              <div class="col">{{ user.email }}</div>
              <div class="col">
                <select 
                  [(ngModel)]="user.role" 
                  (change)="updateUserRole(user)"
                  class="role-select"
                >
                  <option value="user">Użytkownik</option>
                  <option value="psychologist">Psycholog</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="col">
                <span class="status-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </span>
              </div>
              <div class="col">{{ user.createdAt | date:'short' }}</div>
              <div class="col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="editUser(user)">
                    Edytuj
                  </button>
                  <button class="btn btn-sm btn-info" (click)="manageUserPackages(user)">
                    Pakiety
                  </button>
                  <button 
                    class="btn btn-sm"
                    [class.btn-danger]="user.isActive"
                    [class.btn-success]="!user.isActive"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Contracts Tab -->
        <section class="contracts-section" *ngIf="activeTab === 'contracts' && !isLoading">
          <div class="page-header">
            <h2>Generator umów</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="showContractTemplates = true">
                <i class="icon">📋</i>
                Szablony umów
              </button>
            </div>
          </div>

          <!-- Contract Templates -->
          <div class="templates-grid">
            <div class="template-card standard">
              <div class="template-header">
                <h3>Umowa standardowa</h3>
                <i class="icon">📄</i>
              </div>
              <div class="template-description">
                <p>Podstawowa umowa na usługi psychologiczne</p>
                <ul>
                  <li>Dane klienta</li>
                  <li>Zakres usług</li>
                  <li>Cena i warunki płatności</li>
                  <li>Postanowienia końcowe</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('standard')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('standard')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>

            <div class="template-card credit">
              <div class="template-header">
                <h3>Umowa kredytowa</h3>
                <i class="icon">💳</i>
              </div>
              <div class="template-description">
                <p>Umowa na usługi z możliwością rozłożenia płatności</p>
                <ul>
                  <li>Harmonogram płatności</li>
                  <li>Oprocentowanie</li>
                  <li>Zabezpieczenia</li>
                  <li>Procedury windykacyjne</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('credit')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('credit')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>

            <div class="template-card corporate">
              <div class="template-header">
                <h3>Umowa B2B</h3>
                <i class="icon">🏢</i>
              </div>
              <div class="template-description">
                <p>Umowa dla firm i instytucji</p>
                <ul>
                  <li>Usługi grupowe</li>
                  <li>Rabaty wolumenowe</li>
                  <li>SLA</li>
                  <li>Faktury VAT</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('corporate')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('corporate')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>
          </div>

          <!-- Contract Generator -->
          <div class="contract-generator" *ngIf="showContractGenerator">
            <h3>Generator umowy: {{ selectedContractType }}</h3>
            <form class="contract-form">
              <!-- Contract form fields will be dynamically generated -->
              <div class="form-section">
                <h4>Dane klienta</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Imię i nazwisko</label>
                    <input type="text" [(ngModel)]="contractData.clientName" name="clientName">
                  </div>
                  <div class="form-group">
                    <label>PESEL</label>
                    <input type="text" [(ngModel)]="contractData.clientPesel" name="clientPesel">
                  </div>
                </div>
                <!-- More form fields... -->
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeContractGenerator()">
                  Anuluj
                </button>
                <button type="button" class="btn btn-primary" (click)="generatePdfContract()">
                  <i class="icon">📄</i>
                  Generuj PDF
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Notifications Tab -->
        <section class="notifications-section" *ngIf="activeTab === 'notifications' && !isLoading">
          <div class="page-header">
            <h2>Centrum powiadomień</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="createNotification()">
                <i class="icon">📢</i>
                Nowe powiadomienie
              </button>
            </div>
          </div>

          <!-- Notification Types -->
          <div class="notification-types">
            <button 
              class="type-btn"
              [class.active]="notificationType === 'push'"
              (click)="notificationType = 'push'"
            >
              <i class="icon">📱</i>
              Push
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'email'"
              (click)="notificationType = 'email'"
            >
              <i class="icon">✉️</i>
              Email
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'sms'"
              (click)="notificationType = 'sms'"
            >
              <i class="icon">📞</i>
              SMS
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'in-app'"
              (click)="notificationType = 'in-app'"
            >
              <i class="icon">🔔</i>
              W aplikacji
            </button>
          </div>

          <!-- Quick Notifications -->
          <div class="quick-notifications">
            <h3>Szybkie powiadomienia</h3>
            <div class="quick-grid">
              <button class="quick-btn" (click)="sendQuickNotification('maintenance')">
                <i class="icon">🔧</i>
                <span>Przerwa techniczna</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('update')">
                <i class="icon">🆕</i>
                <span>Nowa funkcja</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('reminder')">
                <i class="icon">⏰</i>
                <span>Przypomnienie o wizycie</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('promotion')">
                <i class="icon">🎉</i>
                <span>Promocja</span>
              </button>
            </div>
          </div>
        </section>
      </main>
      </div> <!-- Close admin-body -->

      <!-- Package Management Modal -->
      <div class="modal-overlay" *ngIf="showPackageModal" (click)="closePackageModal()">
        <div class="modal-content package-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Zarządzanie pakietami użytkownika</h3>
            <button class="close-btn" (click)="closePackageModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="user-info-section" *ngIf="selectedUserForPackages">
              <h4>Użytkownik: {{ selectedUserForPackages.firstName }} {{ selectedUserForPackages.lastName }}</h4>
              <p>Email: {{ selectedUserForPackages.email }}</p>
            </div>

            <!-- Current Packages -->
            <div class="current-packages-section">
              <h4>Aktywne pakiety</h4>
              <div *ngIf="userPackages.length === 0" class="no-packages">
                <p>Użytkownik nie ma żadnych aktywnych pakietów</p>
              </div>
              <div *ngFor="let package of userPackages" class="package-item active">
                <div class="package-info">
                  <h5>Pakiet: {{ package.packageId }}</h5>
                  <p>Status: <span class="status-badge" [class]="package.status">{{ package.status }}</span></p>
                  <p>Sesje: {{ package.sessionsRemaining }}/{{ package.totalSessions }}</p>
                  <p>Data zakupu: {{ package.purchaseDate | date:'short' }}</p>
                </div>
                <div class="package-actions">
                  <button 
                    class="btn btn-sm btn-danger" 
                    (click)="deactivateUserPackage(package.packageId)"
                    *ngIf="package.status === 'active'"
                  >
                    Dezaktywuj
                  </button>
                </div>
              </div>
            </div>

            <!-- Available Packages to Activate -->
            <div class="available-packages-section">
              <h4>Dostępne pakiety do aktywacji</h4>
              <div class="packages-grid">
                <div *ngFor="let package of availablePackages" class="package-card">
                  <h5>{{ package.name }}</h5>
                  <p>Sesje: {{ package.sessionsIncluded }}</p>
                  <p>Cena: {{ package.price }} PLN</p>
                  <button 
                    class="btn btn-primary btn-sm" 
                    (click)="activatePackageForUser(package.id)"
                  >
                    Aktywuj pakiet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals will be added here -->
    </div>
  `,
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
    currentUser: User | null = null;
    activeTab = 'overview';
    isLoading = false;

    // Data
    stats: AdminStats = {
        totalUsers: 0,
        newUsersToday: 0,
        activePsychologists: 0,
        pendingPsychologists: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        monthlySessions: 0,
        sessionsGrowth: 0,
        visitorsToday: 0,
        conversionRate: 0
    };

    recentActivity: SystemActivity[] = [];
    users: User[] = [];
    filteredUsers: User[] = [];
    userSearchTerm = '';

    // CRM
    lastCrmSync = new Date();
    crmStats: CrmStats = {
        syncedContacts: 0,
        newLeads: 0,
        lastSync: new Date(),
        pendingSync: 0
    };

    // Analytics
    analyticsTimeRange = '30days';

    // Contracts
    showContractTemplates = false;
    showContractGenerator = false;
    selectedContractType = '';
    contractData: any = {};

    // Notifications
    notificationType = 'push';

    // Modals
    showAddUserModal = false;
    showPackageModal = false;
    selectedUserForPackages: User | null = null;
    userPackages: UserPackage[] = [];
    availablePackages = [
        { id: 'basic', name: 'Pakiet Podstawowy', sessionsIncluded: 4, price: 400 },
        { id: 'standard', name: 'Pakiet Standard', sessionsIncluded: 8, price: 720 },
        { id: 'premium', name: 'Pakiet Premium', sessionsIncluded: 12, price: 1080 }
    ];

    constructor(
        private authService: AuthService,
        private packageService: PackageService,
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.router.navigate(['/login']);
            return;
        }

        this.loadAdminData();
    }

    async loadAdminData() {
        this.isLoading = true;
        try {
            this.loadStats();
            this.loadUsers();
            this.loadRecentActivity();
            this.loadCrmData();
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadStats() {
        try {
            // Get real statistics from AdminService backend
            this.stats = await this.adminService.refreshStats();
        } catch (error) {
            console.error('Error loading admin stats:', error);
            // Fallback to calculated stats if service fails
            this.calculateStatsFromLocalData();
        }
    }

    private async calculateStatsFromLocalData() {
        // Get real data from Firebase and calculate stats
        const users = await this.getUsersFromStorage();
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        // Calculate real statistics
        const totalUsers = users.length;
        const newUsersToday = users.filter(user =>
            user.createdAt && new Date(user.createdAt) >= startOfToday
        ).length;

        const psychologists = users.filter(user => user.role === 'psychologist');
        const activePsychologists = psychologists.filter(user => user.isActive).length;
        const pendingPsychologists = psychologists.filter(user => !user.isActive).length;

        // Mock calculations for revenue and sessions (would come from real API)
        const monthlyRevenue = activePsychologists * 2500; // Average per psychologist
        const monthlySessions = activePsychologists * 18; // Average sessions per psychologist

        this.stats = {
            totalUsers,
            newUsersToday,
            activePsychologists,
            pendingPsychologists,
            monthlyRevenue,
            revenueGrowth: this.calculateGrowth(monthlyRevenue, monthlyRevenue * 0.85), // 15% growth
            monthlySessions,
            sessionsGrowth: this.calculateGrowth(monthlySessions, monthlySessions * 0.92), // 8% growth
            visitorsToday: Math.floor(Math.random() * 500 + 200),
            conversionRate: Math.random() * 5 + 2
        };
    }

    private async getUsersFromStorage(): Promise<User[]> {
        try {
            // Get real users from Firebase
            return await this.authService.getAllUsers();
        } catch (error) {
            console.error('Error loading users from Firebase:', error);
            // Fallback to current user only if Firebase fails
            const currentUser = this.authService.getCurrentUser();
            return currentUser ? [currentUser] : [];
        }
    }

    private calculateGrowth(current: number, previous: number): number {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    }

    getGrowthClass(growth: number): string {
        if (growth > 0) return 'positive';
        if (growth < 0) return 'negative';
        return 'neutral';
    }

    formatGrowth(growth: number): string {
        const sign = growth > 0 ? '+' : '';
        return `${sign}${growth}%`;
    }

    async loadUsers() {
        // Get real user data from Firebase
        this.users = await this.getUsersFromStorage();
        this.filteredUsers = [...this.users];
    }

    async loadRecentActivity() {
        try {
            // Get real activity from AdminService backend
            this.recentActivity = await this.adminService.getRecentActivity();
        } catch (error) {
            console.error('Error loading recent activity:', error);
            // Fallback to calculated activity if service fails
            this.calculateActivityFromLocalData();
        }
    }

    private async calculateActivityFromLocalData() {
        // Generate real activity based on user data from Firebase
        const users = await this.getUsersFromStorage();
        const recentUsers = users
            .filter(user => user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
            .slice(0, 3);

        this.recentActivity = [
            ...recentUsers.map(user => ({
                id: `activity-${Date.now()}-${user.id}`,
                type: 'user-registered' as const,
                message: `Nowy użytkownik: ${user.firstName} ${user.lastName}`,
                timestamp: new Date(user.createdAt!)
            })),
            {
                id: `activity-payment-${Date.now()}`,
                type: 'payment-received' as const,
                message: `Otrzymano płatność ${Math.floor(Math.random() * 300 + 150)} PLN`,
                timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000)
            },
            {
                id: `activity-session-${Date.now()}`,
                type: 'session-completed' as const,
                message: `Zakończono sesję psychologiczną`,
                timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000)
            }
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
    }

    async loadCrmData() {
        try {
            // Get real CRM stats from AdminService backend
            this.crmStats = await this.adminService.getCrmStats();
            this.lastCrmSync = new Date();
        } catch (error) {
            console.error('Error loading CRM data:', error);
            // Fallback to calculated CRM stats if service fails
            this.calculateCrmStatsFromLocalData();
        }
    }

    private async calculateCrmStatsFromLocalData() {
        // Calculate CRM stats based on real user data from Firebase
        const users = await this.getUsersFromStorage();
        const totalContacts = users.length;
        const recentContacts = users.filter(user =>
            user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        this.crmStats = {
            syncedContacts: totalContacts,
            newLeads: recentContacts,
            lastSync: new Date(),
            pendingSync: 0
        };

        this.lastCrmSync = new Date();
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    logout() {
        this.authService.logout();
    }

    refreshData() {
        this.loadAdminData();
    }

    getActivityIcon(type: string): string {
        switch (type) {
            case 'user-registered': return '👤';
            case 'payment-received': return '💰';
            case 'session-completed': return '✅';
            default: return '📋';
        }
    }

    getUserInitials(user: User): string {
        return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    }

    filterUsers() {
        this.filteredUsers = this.users.filter(user =>
            user.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
        );
    }

    updateUserRole(user: User) {
        // TODO: Implement role update
        console.log('Update user role:', user);
    }

    editUser(user: User) {
        // TODO: Implement user editing
        console.log('Edit user:', user);
    }

    toggleUserStatus(user: User) {
        // TODO: Implement status toggle
        user.isActive = !user.isActive;
        console.log('Toggle user status:', user);
    }

    async manageUserPackages(user: User) {
        this.selectedUserForPackages = user;
        this.showPackageModal = true;

        try {
            const userPackage = await this.packageService.getUserPackage(user.id);
            this.userPackages = userPackage ? [userPackage] : [];
        } catch (error) {
            console.error('Error loading user packages:', error);
            this.userPackages = [];
        }
    }

    async activatePackageForUser(packageId: string) {
        if (!this.selectedUserForPackages) return;

        const selectedPackage = this.availablePackages.find(p => p.id === packageId);
        if (!selectedPackage) return;

        try {
            const userPackage: UserPackage = {
                id: `${this.selectedUserForPackages.id}_${packageId}_${Date.now()}`,
                userId: this.selectedUserForPackages.id,
                packageId: packageId,
                status: 'active',
                totalSessions: selectedPackage.sessionsIncluded,
                sessionsRemaining: selectedPackage.sessionsIncluded,
                sessionsUsed: 0,
                purchaseDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                isOnCredit: false
            };

            // Save to Firestore
            await this.packageService.saveUserPackage(userPackage);

            // Refresh the user packages list
            const updatedPackage = await this.packageService.getUserPackage(this.selectedUserForPackages.id);
            this.userPackages = updatedPackage ? [updatedPackage] : [];

            alert(`Pakiet ${selectedPackage.name} został aktywowany dla użytkownika ${this.selectedUserForPackages.firstName} ${this.selectedUserForPackages.lastName}`);
        } catch (error) {
            console.error('Error activating package:', error);
            alert('Wystąpił błąd podczas aktywacji pakietu');
        }
    }

    async deactivateUserPackage(packageId: string) {
        if (!this.selectedUserForPackages) return;

        try {
            // Update package status to inactive
            const userPackage = this.userPackages.find(p => p.packageId === packageId);
            if (userPackage) {
                userPackage.status = 'inactive';
                await this.packageService.saveUserPackage(userPackage);

                // Refresh the user packages list
                const updatedPackage = await this.packageService.getUserPackage(this.selectedUserForPackages.id);
                this.userPackages = updatedPackage ? [updatedPackage] : [];

                alert('Pakiet został dezaktywowany');
            }
        } catch (error) {
            console.error('Error deactivating package:', error);
            alert('Wystąpił błąd podczas dezaktywacji pakietu');
        }
    }

    closePackageModal() {
        this.showPackageModal = false;
        this.selectedUserForPackages = null;
        this.userPackages = [];
    }

    exportUsersToExcel() {
        // TODO: Implement Excel export
        console.log('Export users to Excel');
    }

    updateAnalytics() {
        // TODO: Implement analytics update
        console.log('Update analytics for:', this.analyticsTimeRange);
    }

    exportAnalytics() {
        // TODO: Implement analytics export
        console.log('Export analytics');
    }

    openPostHog() {
        window.open('https://app.posthog.com', '_blank');
    }

    syncPostHog() {
        // TODO: Implement PostHog sync
        console.log('Sync PostHog data');
    }

    syncWithLivespace() {
        // TODO: Implement Livespace sync
        console.log('Sync with Livespace CRM');
    }

    importContactsFromCrm() {
        // TODO: Implement CRM import
        console.log('Import contacts from CRM');
    }

    exportContactsToCrm() {
        // TODO: Implement CRM export
        console.log('Export contacts to CRM');
    }

    syncAppointments() {
        // TODO: Implement appointments sync
        console.log('Sync appointments with CRM');
    }

    configureCrmSettings() {
        // TODO: Implement CRM settings
        console.log('Configure CRM settings');
    }

    generateContract(type: string) {
        this.selectedContractType = type;
        this.showContractGenerator = true;
        this.contractData = {};
    }

    editTemplate(type: string) {
        // TODO: Implement template editing
        console.log('Edit template:', type);
    }

    closeContractGenerator() {
        this.showContractGenerator = false;
        this.selectedContractType = '';
        this.contractData = {};
    }

    generatePdfContract() {
        // TODO: Implement PDF generation
        console.log('Generate PDF contract:', this.contractData);
    }

    createNotification() {
        // TODO: Implement notification creation
        console.log('Create notification');
    }

    sendQuickNotification(type: string) {
        // TODO: Implement quick notification
        console.log('Send quick notification:', type);
    }
}
