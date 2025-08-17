import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PsychologistService } from '../core/psychologist.service';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';
import { User } from '../models/user.model';
import { Psychologist } from '../models/psychologist.model';

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonLoaderComponent],
  template: `
    <div class="moderator-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel Moderatora</h1>
          <div class="header-actions">
            <span class="user-role moderator">MODERATOR</span>
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
          <i class="icon">📊</i>
          Przegląd
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'reviews'"
          (click)="setActiveTab('reviews')"
        >
          <i class="icon">⭐</i>
          Moderacja opinii
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'reports'"
          (click)="setActiveTab('reports')"
        >
          <i class="icon">🚨</i>
          Zgłoszenia
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'upgrades'"
          (click)="setActiveTab('upgrades')"
        >
          <i class="icon">⬆️</i>
          Ulepszenia psychologów
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'blocks'"
          (click)="setActiveTab('blocks')"
        >
          <i class="icon">🚫</i>
          Blokady kont
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'restrictions'"
          (click)="setActiveTab('restrictions')"
        >
          <i class="icon">⏸️</i>
          Ograniczenia
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
          <div class="stats-grid">
            <div class="stat-card reviews">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <h3>{{ pendingReviews }}</h3>
                <p>Oczekujące opinie</p>
                <small>Do moderacji</small>
              </div>
            </div>
            
            <div class="stat-card reports">
              <div class="stat-icon">⚠️</div>
              <div class="stat-content">
                <h3>{{ activeReports }}</h3>
                <p>Aktywne zgłoszenia</p>
                <small>Wymagają działania</small>
              </div>
            </div>
            
            <div class="stat-card approved">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ approvedToday }}</h3>
                <p>Zatwierdzono dzisiaj</p>
                <small>Opinie i treści</small>
              </div>
            </div>
            
            <div class="stat-card rejected">
              <div class="stat-icon">❌</div>
              <div class="stat-content">
                <h3>{{ rejectedToday }}</h3>
                <p>Odrzucono dzisiaj</p>
                <small>Naruszające regulamin</small>
              </div>
            </div>
          </div>

          <!-- Urgent Actions -->
          <div class="urgent-actions">
            <h3>Wymagają natychmiastowej uwagi</h3>
            <div class="urgent-list">
              <div *ngFor="let item of urgentItems" class="urgent-item" [class]="item.type">
                <div class="urgent-icon">{{ getUrgentIcon(item.type) }}</div>
                <div class="urgent-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <small>{{ item.timestamp | date:'short' }}</small>
                </div>
                <div class="urgent-actions">
                  <button class="btn btn-sm btn-primary" (click)="handleUrgentItem(item)">
                    Działaj
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <h3>Statystyki moderacji</h3>
            <div class="stats-row">
              <div class="stat-item">
                <span class="label">Dziś sprawdzono:</span>
                <span class="value">{{ todayModerated }}</span>
              </div>
              <div class="stat-item">
                <span class="label">W tym tygodniu:</span>
                <span class="value">{{ weekModerated }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Wskaźnik zatwierdzenia:</span>
                <span class="value">{{ approvalRate }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Reviews Tab -->
        <section class="reviews-section" *ngIf="activeTab === 'reviews'">
          <div class="section-header">
            <h3>Moderacja opinii ({{ pendingReviewsList.length }})</h3>
            <div class="filters">
              <select [(ngModel)]="reviewFilter" (change)="filterReviews()">
                <option value="">Wszystkie</option>
                <option value="pending">Oczekujące</option>
                <option value="reported">Zgłoszone</option>
                <option value="flagged">Oznaczone</option>
              </select>
            </div>
          </div>

          <div class="reviews-list" *ngIf="filteredReviews.length > 0; else noReviews">
            <div *ngFor="let review of filteredReviews" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <h4>{{ review.userName }}</h4>
                  <div class="rating">
                    <span class="stars">{{ getStars(review.rating) }}</span>
                    <span class="rating-value">{{ review.rating }}/5</span>
                  </div>
                </div>
                <div class="review-meta">
                  <span class="review-date">{{ review.createdAt | date:'short' }}</span>
                  <span class="review-status" [class]="review.status">{{ getStatusText(review.status) }}</span>
                </div>
              </div>
              
              <div class="review-content">
                <p>{{ review.comment }}</p>
              </div>
              
              <div class="review-target">
                <strong>Psycholog:</strong> {{ review.psychologistName }}
              </div>
              
              <div class="review-actions">
                <button 
                  class="btn btn-sm btn-success" 
                  (click)="approveReview(review)"
                  *ngIf="review.status === 'pending'"
                >
                  Zatwierdź
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  (click)="rejectReview(review)"
                  *ngIf="review.status === 'pending'"
                >
                  Odrzuć
                </button>
                <button 
                  class="btn btn-sm btn-secondary" 
                  (click)="flagReview(review)"
                  *ngIf="review.status !== 'flagged'"
                >
                  Oznacz
                </button>
                <button class="btn btn-sm btn-primary" (click)="viewReviewDetails(review)">
                  Szczegóły
                </button>
              </div>
            </div>
          </div>
          
          <ng-template #noReviews>
            <div class="no-data">
              <p>Brak opinii do moderacji</p>
            </div>
          </ng-template>
        </section>

        <!-- Reports Tab -->
        <section class="reports-section" *ngIf="activeTab === 'reports'">
          <div class="section-header">
            <h3>Zgłoszenia użytkowników ({{ reportsList.length }})</h3>
            <div class="filters">
              <select [(ngModel)]="reportFilter" (change)="filterReports()">
                <option value="">Wszystkie</option>
                <option value="new">Nowe</option>
                <option value="in-progress">W trakcie</option>
                <option value="resolved">Rozwiązane</option>
              </select>
              <select [(ngModel)]="reportTypeFilter" (change)="filterReports()">
                <option value="">Wszystkie typy</option>
                <option value="inappropriate-content">Nieodpowiednia treść</option>
                <option value="spam">Spam</option>
                <option value="harassment">Nękanie</option>
                <option value="other">Inne</option>
              </select>
            </div>
          </div>

          <div class="reports-list">
            <div *ngFor="let report of filteredReports" class="report-card" [class]="report.severity">
              <div class="report-header">
                <div class="report-info">
                  <h4>{{ getReportTypeText(report.type) }}</h4>
                  <div class="report-severity">
                    <span class="severity-badge" [class]="report.severity">
                      {{ getSeverityText(report.severity) }}
                    </span>
                  </div>
                </div>
                <div class="report-meta">
                  <span class="report-date">{{ report.createdAt | date:'short' }}</span>
                  <span class="report-status" [class]="report.status">{{ getReportStatusText(report.status) }}</span>
                </div>
              </div>
              
              <div class="report-content">
                <p><strong>Zgłaszający:</strong> {{ report.reporterName }}</p>
                <p><strong>Dotyczy:</strong> {{ report.targetType }} - {{ report.targetName }}</p>
                <p><strong>Opis:</strong> {{ report.description }}</p>
              </div>
              
              <div class="report-actions">
                <button 
                  class="btn btn-sm btn-primary" 
                  (click)="investigateReport(report)"
                  *ngIf="report.status === 'new'"
                >
                  Zbadaj
                </button>
                <button 
                  class="btn btn-sm btn-success" 
                  (click)="resolveReport(report, 'valid')"
                  *ngIf="report.status === 'in-progress'"
                >
                  Potwierdź naruszenie
                </button>
                <button 
                  class="btn btn-sm btn-secondary" 
                  (click)="resolveReport(report, 'invalid')"
                  *ngIf="report.status === 'in-progress'"
                >
                  Odrzuć zgłoszenie
                </button>
                <button class="btn btn-sm btn-info" (click)="viewReportDetails(report)">
                  Szczegóły
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Content Tab -->
        <section class="content-section" *ngIf="activeTab === 'content'">
          <div class="section-header">
            <h3>Moderacja treści</h3>
          </div>

          <div class="content-categories">
            <div class="category-card" (click)="moderateCategory('psychologist-profiles')">
              <div class="category-icon">👨‍⚕️</div>
              <div class="category-info">
                <h4>Profile psychologów</h4>
                <p>{{ pendingProfiles }} oczekuje na weryfikację</p>
              </div>
            </div>
            
            <div class="category-card" (click)="moderateCategory('user-content')">
              <div class="category-icon">💬</div>
              <div class="category-info">
                <h4>Treści użytkowników</h4>
                <p>{{ pendingUserContent }} do sprawdzenia</p>
              </div>
            </div>
            
            <div class="category-card" (click)="moderateCategory('comments')">
              <div class="category-icon">📝</div>
              <div class="category-info">
                <h4>Komentarze</h4>
                <p>{{ pendingComments }} nowych komentarzy</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./moderator-dashboard.component.scss']
})
export class ModeratorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;

  // Overview stats
  pendingReviews = 0;
  activeReports = 0;
  approvedToday = 0;
  rejectedToday = 0;
  todayModerated = 0;
  weekModerated = 0;
  approvalRate = 0;

  // Content stats
  pendingProfiles = 0;
  pendingUserContent = 0;
  pendingComments = 0;

  // Data
  urgentItems: any[] = [];
  pendingReviewsList: any[] = [];
  filteredReviews: any[] = [];
  reportsList: any[] = [];
  filteredReports: any[] = [];

  // Filters
  reviewFilter = '';
  reportFilter = '';
  reportTypeFilter = '';

  constructor(
    private authService: AuthService,
    private psychologistService: PsychologistService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || this.currentUser.role !== 'moderator') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      await this.loadOverviewStats();
      await this.loadUrgentItems();
      await this.loadPendingReviews();
      await this.loadReports();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadOverviewStats() {
    // TODO: Implement real stats loading from Firebase
    this.pendingReviews = 12;
    this.activeReports = 3;
    this.approvedToday = 25;
    this.rejectedToday = 4;
    this.todayModerated = 29;
    this.weekModerated = 156;
    this.approvalRate = 86;
    this.pendingProfiles = 2;
    this.pendingUserContent = 8;
    this.pendingComments = 15;
  }

  async loadUrgentItems() {
    this.urgentItems = [
      {
        type: 'high-priority-report',
        title: 'Zgłoszenie nękania',
        description: 'Użytkownik zgłasza nieodpowiednie zachowanie psychologa',
        timestamp: new Date()
      },
      {
        type: 'spam-review',
        title: 'Podejrzana seria opinii',
        description: '5 podobnych opinii z tego samego IP',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ];
  }

  async loadPendingReviews() {
    // TODO: Implement real reviews loading from Firebase
    this.pendingReviewsList = [
      {
        id: '1',
        userName: 'Anna K.',
        rating: 5,
        comment: 'Bardzo profesjonalna pomoc, polecam!',
        psychologistName: 'Dr Jan Kowalski',
        status: 'pending',
        createdAt: new Date()
      },
      {
        id: '2',
        userName: 'Piotr N.',
        rating: 1,
        comment: 'Słaba jakość usług, nie polecam.',
        psychologistName: 'Dr Anna Nowak',
        status: 'reported',
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    ];
    this.filteredReviews = [...this.pendingReviewsList];
  }

  async loadReports() {
    this.reportsList = [
      {
        id: '1',
        type: 'inappropriate-content',
        severity: 'high',
        status: 'new',
        reporterName: 'Maria S.',
        targetType: 'review',
        targetName: 'Opinia o Dr. Kowalski',
        description: 'Opinia zawiera nieodpowiednie treści',
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'harassment',
        severity: 'critical',
        status: 'in-progress',
        reporterName: 'Jan D.',
        targetType: 'psychologist',
        targetName: 'Dr. Anna Nowak',
        description: 'Nieodpowiednie zachowanie podczas sesji',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ];
    this.filteredReports = [...this.reportsList];
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
  }

  getUrgentIcon(type: string): string {
    switch (type) {
      case 'high-priority-report': return '🚨';
      case 'spam-review': return '🔍';
      default: return '⚠️';
    }
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Oczekuje';
      case 'approved': return 'Zatwierdzona';
      case 'rejected': return 'Odrzucona';
      case 'reported': return 'Zgłoszona';
      case 'flagged': return 'Oznaczona';
      default: return status;
    }
  }

  getReportTypeText(type: string): string {
    switch (type) {
      case 'inappropriate-content': return 'Nieodpowiednia treść';
      case 'spam': return 'Spam';
      case 'harassment': return 'Nękanie';
      case 'other': return 'Inne';
      default: return type;
    }
  }

  getSeverityText(severity: string): string {
    switch (severity) {
      case 'low': return 'Niska';
      case 'medium': return 'Średnia';
      case 'high': return 'Wysoka';
      case 'critical': return 'Krytyczna';
      default: return severity;
    }
  }

  getReportStatusText(status: string): string {
    switch (status) {
      case 'new': return 'Nowe';
      case 'in-progress': return 'W trakcie';
      case 'resolved': return 'Rozwiązane';
      default: return status;
    }
  }

  filterReviews() {
    this.filteredReviews = this.pendingReviewsList.filter(review => {
      return !this.reviewFilter || review.status === this.reviewFilter;
    });
  }

  filterReports() {
    this.filteredReports = this.reportsList.filter(report => {
      const matchesStatus = !this.reportFilter || report.status === this.reportFilter;
      const matchesType = !this.reportTypeFilter || report.type === this.reportTypeFilter;
      return matchesStatus && matchesType;
    });
  }

  handleUrgentItem(item: any) {
    // TODO: Implement urgent item handling
    console.log('Handle urgent item:', item);
  }

  approveReview(review: any) {
    // TODO: Implement review approval
    review.status = 'approved';
    this.approvedToday++;
    console.log('Review approved:', review);
  }

  rejectReview(review: any) {
    // TODO: Implement review rejection
    review.status = 'rejected';
    this.rejectedToday++;
    console.log('Review rejected:', review);
  }

  flagReview(review: any) {
    // TODO: Implement review flagging
    review.status = 'flagged';
    console.log('Review flagged:', review);
  }

  viewReviewDetails(review: any) {
    // TODO: Implement review details view
    console.log('View review details:', review);
  }

  investigateReport(report: any) {
    // TODO: Implement report investigation
    report.status = 'in-progress';
    console.log('Investigating report:', report);
  }

  resolveReport(report: any, resolution: string) {
    // TODO: Implement report resolution
    report.status = 'resolved';
    report.resolution = resolution;
    console.log('Report resolved:', report, resolution);
  }

  viewReportDetails(report: any) {
    // TODO: Implement report details view
    console.log('View report details:', report);
  }

  moderateCategory(category: string) {
    // TODO: Implement category moderation
    console.log('Moderate category:', category);
  }
}
