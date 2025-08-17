import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { PackageService } from '../core/package.service';
import { UserService } from '../core/user.service';
import { DataSeederService } from '../core/data-seeder.service';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';
import { User, UserStats, Review, PsychologistChangeRequest } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Psychologist, PsychologistNote } from '../models/psychologist.model';
import { Package } from '../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Użytkownika</h1>
          <div class="header-actions">
            <button class="demo-btn" (click)="refreshData()" [disabled]="isLoading" title="Odśwież dane">
              🔄 Odśwież
            </button>
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
          [class.active]="activeTab === 'psychologists'"
          (click)="setActiveTab('psychologists')"
        >
          Psychologowie
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'my-psychologist'"
          (click)="setActiveTab('my-psychologist')"
        >
          Twój psycholog
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
            <h2>Witaj, {{ currentUser?.firstName }}!</h2>
            <p>Zarządzaj swoimi wizytami i korzystaj z usług psychologicznych.</p>
            
            <!-- Permission Status -->
            <div class="permission-status" *ngIf="!currentUser?.canSelectPsychologist">
              <div class="status-card warning">
                <h4>Oczekuje na aktywację konta</h4>
                <p>⏳ Twoje konto zostało utworzone, ale wymaga aktywacji przez administratora, aby móc wybierać psychologów.</p>
                <p>Skontaktuj się z nami w celu aktywacji: <strong>kontakt&#64;logos.pl</strong></p>
              </div>
            </div>
            
            <!-- Permission Status -->
            <div class="permission-status" *ngIf="!currentUser?.canSelectPsychologist">
              <div class="status-card warning">
                <h4>Oczekuje na aktywację konta</h4>
                <p>⏳ Twoje konto zostało utworzone, ale wymaga aktywacji przez administratora, aby móc wybierać psychologów.</p>
                <p>Skontaktuj się z nami w celu aktywacji: <strong>kontakt&#64;logos.pl</strong></p>
              </div>
            </div>
            
            <!-- Assignment Status - Only show if user has psychologist -->
            <div class="assignment-status" *ngIf="assignedPsychologist">
              <div class="status-card approved">
                <h4>✅ Psycholog przypisany</h4>
                <p>Możesz umówić się na wizytę z przypisanym psychologiem.</p>
              </div>
            </div>
          </div>

          <div class="stats-row">
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
              <div class="stat-icon">�</div>
              <div class="stat-content">
                <h3>{{ assignedPsychologist?.firstName || 'Brak' }}</h3>
                <p>Przypisany psycholog</p>
              </div>
            </div>
          </div>

          <!-- Assigned Psychologist Info -->
          <div class="psychologist-info-card" *ngIf="assignedPsychologist">
            <div class="card-header">
              <h3>Twój psycholog</h3>
              <span class="status-badge active">Aktywny</span>
            </div>
            
            <div class="psychologist-content">
              <div class="psychologist-details">
                <h4>{{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</h4>
                <p class="title">Psycholog kliniczny</p>
                
                <div class="specializations" *ngIf="assignedPsychologist.specializations?.length">
                  <span class="specialization-tag" *ngFor="let spec of (assignedPsychologist.specializations || []).slice(0, 3)">
                    {{ spec }}
                  </span>
                </div>
                
                <div class="rating-section" *ngIf="assignedPsychologist.rating">
                  <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-text">{{ assignedPsychologist.rating }}/5</span>
                  </div>
                  <span class="review-count">({{ assignedPsychologist.reviewCount || 0 }} opinii)</span>
                </div>
                
                <div class="contact-info">
                  <div class="contact-item" *ngIf="assignedPsychologist.email">
                    <i class="icon">✉️</i>
                    <span>{{ assignedPsychologist.email }}</span>
                  </div>
                  <div class="contact-item" *ngIf="assignedPsychologist.phone">
                    <i class="icon">📞</i>
                    <span>{{ assignedPsychologist.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="psychologist-actions">
              <button class="btn btn-primary" (click)="setActiveTab('calendar')">
                <i class="icon">📅</i>
                Umów wizytę
              </button>
              <button class="btn btn-secondary" (click)="sendMessage()">
                <i class="icon">�</i>
                Wyślij wiadomość
              </button>
            </div>
          </div>

          <!-- No Assigned Psychologist -->
          <div class="no-psychologist-card" *ngIf="!assignedPsychologist">
            <div class="empty-state">
              <div class="empty-icon">🧠</div>
              <h3>Nie masz jeszcze przypisanego psychologa</h3>
              <p>Wybierz psychologa z naszej listy specjalistów, aby rozpocząć terapię</p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                <i class="icon">👥</i>
                Wybierz psychologa
              </button>
            </div>
          </div>

          <!-- Recent Appointments -->
          <div class="recent-appointments" *ngIf="recentAppointments.length > 0">
            <h3>Ostatnie wizyty</h3>
            <div class="appointments-list">
              @for (appointment of recentAppointments; track appointment.id) {
                <div class="appointment-card"
                     [class]="appointment.status">
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
                  @if (appointment.status === 'completed') {
                    <div class="appointment-actions">
                      <button class="btn btn-sm btn-secondary" (click)="rateSession(appointment)">
                        Oceń sesję
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Szybkie akcje</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="setActiveTab('calendar')" 
                      [disabled]="!assignedPsychologist">
                <div class="action-icon">📅</div>
                <span>Umów wizytę</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('psychologists')">
                <div class="action-icon">🔍</div>
                <span>Znajdź psychologa</span>
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
            <h3>Znajdź psychologa</h3>
            <p class="section-description">Przeglądaj i wybierz odpowiedniego psychologa dla siebie</p>
          </div>

          <div class="search-filters enhanced">
            <input 
              type="text" 
              placeholder="Szukaj psychologa po imieniu, nazwisku lub specjalizacji..." 
              [(ngModel)]="searchTerm"
          
              class="search-input"
            >
            <select [(ngModel)]="selectedSpecialization" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie specjalizacje</option>
              <option value="Zaburzenia lękowe">Zaburzenia lękowe</option>
              <option value="Depresja">Depresja</option>
              <option value="Problemy w związkach">Problemy w związkach</option>
              <option value="Trauma">Trauma</option>
              <option value="Uzależnienia">Uzależnienia</option>
              <option value="Terapia rodzinna">Terapia rodzinna</option>
              <option value="Psychologia dziecięca">Psychologia dziecięca</option>
            </select>
            <select [(ngModel)]="priceFilter" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie ceny</option>
              <option value="0-100">Do 100 zł</option>
              <option value="100-150">100-150 zł</option>
              <option value="150-200">150-200 zł</option>
              <option value="200+">200+ zł</option>
            </select>
            <select [(ngModel)]="ratingFilter" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie oceny</option>
              <option value="4.5+">4.5+ ⭐</option>
              <option value="4.0+">4.0+ ⭐</option>
              <option value="3.5+">3.5+ ⭐</option>
            </select>
          </div>

          <div class="results-info" *ngIf="filteredPsychologists.length > 0">
            <p>Znaleziono {{ filteredPsychologists.length }} psychologów</p>
          </div>

          <div class="psychologists-grid" *ngIf="filteredPsychologists.length > 0; else noPsychologists">
            @for (psychologist of filteredPsychologists; track psychologist.id) {
              <div class="psychologist-card"
                   [class.premium]="psychologist.premiumListing">
                <div class="psychologist-header">
                  <div class="avatar">
                    {{ psychologist.firstName[0] }}{{ psychologist.lastName[0] }}
                  </div>
                  <div class="psychologist-info">
                    <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                    @if (psychologist.premiumListing) {
                      <span class="premium-badge">⭐ Premium</span>
                    }
                    <div class="rating-info">
                      <span class="rating">⭐ {{ psychologist.rating || 4.5 }}</span>
                      <span class="reviews">({{ psychologist.reviewCount || 0 }} opinii)</span>
                    </div>
                  </div>
                </div>
                
                <div class="psychologist-specializations">
                  @for (spec of psychologist.specializations?.slice(0, 3); track spec) {
                    <span class="specialization-tag">
                      {{ spec }}
                    </span>
                  }
                </div>
                
                <div class="psychologist-details">
                  <p class="description">{{ psychologist.description || 'Doświadczony psycholog z wieloletną praktyką.' }}</p>
                  <div class="details-row">
                    <span class="experience">{{ psychologist.experience || 5 }} lat doświadczenia</span>
                    <span class="price">{{ psychologist.hourlyRate || 120 }} zł/sesja</span>
                  </div>
                  <div class="availability" [class.available]="psychologist.isAvailable !== false">
                    {{ psychologist.isAvailable !== false ? '🟢 Dostępny' : '🔴 Niedostępny' }}
                  </div>
                </div>
                
                <div class="psychologist-actions">
                  <button 
                    class="btn btn-primary select-btn" 
                    [disabled]="true"
                    title="Już masz przypisanego psychologa. Skontaktuj się z administratorem w celu zmiany."
                  >
                    {{ currentUser?.assignedPsychologistId === psychologist.id ? '✅ Twój psycholog' : 'Nieaktywne - masz już psychologa' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <ng-template #noPsychologists>
            <div class="empty-state">
              <h4>Nie znaleziono psychologów</h4>
              <p>Spróbuj zmienić kryteria wyszukiwania</p>
            </div>
          </ng-template>
        </section>

        <!-- My Psychologist Tab -->
        <section class="my-psychologist-section" *ngIf="activeTab === 'my-psychologist'">
          <div class="section-header">
            <h3>Twój psycholog</h3>
            <p class="section-description">Informacje o przypisanym psychologu</p>
          </div>

          <!-- When has assigned psychologist -->
          <div class="psychologist-details-card" *ngIf="assignedPsychologist; else noAssignedPsychologist">
            <div class="psychologist-profile">
              <div class="profile-header">
                <div class="profile-avatar">
                  <div class="avatar-fallback" *ngIf="!assignedPsychologist.profileImage">
                    {{ assignedPsychologist.firstName[0] }}{{ assignedPsychologist.lastName[0] }}
                  </div>
                </div>
                <div class="profile-info">
                  <h2>{{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</h2>
                  <div class="credentials">
                    <span class="license">Lic. nr {{ assignedPsychologist.licenseNumber || 'PSY-' + assignedPsychologist.id.substring(0,6) }}</span>
                    <span class="experience">{{ assignedPsychologist.experience || 5 }} lat doświadczenia</span>
                  </div>
                  <div class="rating-section">
                    <span class="rating">⭐ {{ assignedPsychologist.rating || 4.8 }}</span>
                    <span class="reviews">({{ assignedPsychologist.reviewCount || 0 }} opinii)</span>
                  </div>
                </div>
              </div>

              <div class="profile-content">
                <div class="profile-row">
                  <div class="profile-column">
                    <h4>Specjalizacje</h4>
                    <div class="specializations-list">
                      @for (spec of assignedPsychologist.specializations; track spec) {
                        <span class="spec-tag">
                          {{ spec }}
                        </span>
                      }
                    </div>

                    <h4>Opis</h4>
                    <p class="description">{{ assignedPsychologist.bio || assignedPsychologist.description || 'Doświadczony psycholog z wieloletną praktyką w pomocy pacjentom.' }}</p>

                    <h4>Wykształcenie</h4>
                    <p class="education">{{ assignedPsychologist.education || 'Magister Psychologii, specjalizacja psychologia kliniczna' }}</p>
                  </div>

                  <div class="profile-column">
                    <h4>Dostępność</h4>
                    <div class="availability-status" [class.available]="assignedPsychologist.isAvailable !== false">
                      {{ assignedPsychologist.isAvailable !== false ? '🟢 Dostępny' : '🔴 Niedostępny' }}
                    </div>

                    <h4>Statystyki</h4>
                    <div class="stats-list">
                      <div class="stat-item">
                        <span class="stat-label">Ukończone sesje:</span>
                        <span class="stat-value">{{ assignedPsychologist.completedSessions || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Cena za sesję:</span>
                        <span class="stat-value">{{ assignedPsychologist.hourlyRate || 120 }} zł</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Języki:</span>
                        <span class="stat-value">{{ assignedPsychologist.languages?.join(', ') || 'Polski, Angielski' }}</span>
                      </div>
                    </div>

                    <h4>Kontakt</h4>
                    <div class="contact-actions">
                      <button class="btn btn-primary" (click)="setActiveTab('calendar')">
                        📅 Umów wizytę
                      </button>
                      <button class="btn btn-secondary" (click)="setActiveTab('notes')">
                        📝 Zobacz notatki
                      </button>
                      <button class="btn btn-secondary" (click)="openAddReviewModal()">
                        ⭐ Dodaj opinię
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Change psychologist option -->
              <div class="change-psychologist-section">
                <h4>Chcesz zmienić psychologa?</h4>
                <p>Jeśli obecny psycholog nie odpowiada Twoim potrzebom, możesz wybrać innego.</p>
                <button class="btn btn-secondary" (click)="setActiveTab('psychologists')">
                  🔄 Wybierz innego psychologa
                </button>
              </div>
            </div>
          </div>

          <ng-template #noAssignedPsychologist>
            <div class="empty-state">
              <div class="empty-icon">👨‍⚕️</div>
              <h4>Nie masz przypisanego psychologa</h4>
              <p>Wybierz psychologa z listy dostępnych specjalistów</p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                Znajdź psychologa
              </button>
            </div>
          </ng-template>
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

              <h4 class="section-subtitle">Kontakt awaryjny</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Imię i nazwisko kontaktu awaryjnego:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.emergencyContactName" 
                    name="emergencyContactName"
                    placeholder="Jan Kowalski"
                  >
                </div>
                <div class="form-group">
                  <label>Telefon kontaktu awaryjnego:</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="profileData.emergencyContactPhone" 
                    name="emergencyContactPhone"
                    placeholder="+48 123 456 789"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Relacja:</label>
                <select [(ngModel)]="profileData.emergencyContactRelation" name="emergencyContactRelation">
                  <option value="">Wybierz relację</option>
                  <option value="parent">Rodzic</option>
                  <option value="spouse">Małżonek/Partner</option>
                  <option value="sibling">Rodzeństwo</option>
                  <option value="friend">Przyjaciel</option>
                  <option value="other">Inne</option>
                </select>
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
            @for (note of userNotes; track note.id) {
              <div class="note-card">
                <div class="note-header">
                  <h4>{{ note.title }}</h4>
                  <span class="note-date">{{ note.createdAt | date:'short' }}</span>
                </div>
                <div class="note-content">
                  <p>{{ note.content }}</p>
                </div>
                @if (note.tags) {
                  <div class="note-footer">
                    <div class="note-tags">
                      @for (tag of note.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
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
            @for (review of userReviews; track review.id) {
              <div class="review-card">
                <div class="review-header">
                  <div class="rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span [class.filled]="star <= review.rating">⭐</span>
                    }
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
            }
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
          <div class="section-header">
            <h3>Kalendarz wizyt</h3>
            <p class="section-description">Przeglądaj i zarządzaj swoimi wizytami</p>
          </div>

          <div class="calendar-header" *ngIf="!assignedPsychologist">
            <div class="warning-message">
              <p>⚠️ Aby zobaczyć kalendarz, musisz mieć przypisanego psychologa.</p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                Sprawdź swoich psychologów
              </button>
            </div>
          </div>
          
          <!-- Calendar Content -->
          <div class="calendar-content" *ngIf="assignedPsychologist">
            <!-- Month Navigation -->
            <div class="calendar-navigation">
              <button class="btn btn-secondary" (click)="previousMonth()">‹ Poprzedni</button>
              <h3 class="current-month">{{ getCurrentMonthYear() }}</h3>
              <button class="btn btn-secondary" (click)="nextMonth()">Następny ›</button>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid">
              <div class="calendar-header-row">
                <div class="day-header">Pon</div>
                <div class="day-header">Wt</div>
                <div class="day-header">Śr</div>
                <div class="day-header">Czw</div>
                <div class="day-header">Pt</div>
                <div class="day-header">Sob</div>
                <div class="day-header">Nie</div>
              </div>
              
              <div class="calendar-days">
                @if (calendarData.length > 0) {
                  @for (day of calendarData; track $index) {
                    @if (day.isEmpty) {
                      <div class="calendar-day empty-day"></div>
                    } @else {
                      <div class="calendar-day" 
                           [class.today]="day.isToday"
                           [class.has-appointment]="day.hasAppointment"
                           [class.past]="day.isPast"
                           (click)="selectDate(day.date)">
                        <span class="day-number">{{ day.day }}</span>
                        @if (day.hasAppointment) {
                          <div class="appointment-indicators">
                            @for (appointment of day.appointments.slice(0, 2); track appointment.id) {
                              <div class="appointment-indicator" 
                                   [class]="appointment.status"
                                   [title]="appointment.startTime + ' - ' + appointment.endTime + ' (' + getStatusText(appointment.status) + ')'">
                                {{ appointment.startTime }}
                              </div>
                            }
                            @if (day.appointments.length > 2) {
                              <div class="more-appointments">
                                +{{ day.appointments.length - 2 }}
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  }
                } @else {
                  <!-- Fallback calendar grid -->
                  @for (day of generateFallbackCalendar(); track $index) {
                    @if (day.isEmpty) {
                      <div class="calendar-day empty-day"></div>
                    } @else {
                      <div class="calendar-day" 
                           [class.today]="day.isToday"
                           (click)="selectDate(day.date)">
                        <span class="day-number">{{ day.day }}</span>
                      </div>
                    }
                  }
                }
              </div>
            </div>

            <!-- Selected Day Details -->
            <div class="selected-day-details" *ngIf="selectedDate">
              <h4>{{ selectedDate | date:'fullDate':'pl' }}</h4>
              <div class="day-appointments" *ngIf="selectedDayAppointments.length > 0; else noDayAppointments">
                @for (appointment of selectedDayAppointments; track appointment.id) {
                  <div class="appointment-detail-card" [class]="appointment.status">
                    <div class="appointment-time">
                      {{ appointment.startTime }} - {{ appointment.endTime }}
                    </div>
                    <div class="appointment-type">
                      {{ appointment.type === 'individual' ? 'Sesja indywidualna' : 'Sesja grupowa' }}
                    </div>
                    <div class="appointment-status">
                      {{ getStatusText(appointment.status) }}
                    </div>
                    @if (appointment.notes) {
                      <div class="appointment-notes">
                        <strong>Notatki:</strong> {{ appointment.notes }}
                      </div>
                    }
                    <div class="appointment-psychologist">
                      <strong>Psycholog:</strong> {{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}
                    </div>
                  </div>
                }
              </div>
              <ng-template #noDayAppointments>
                <p class="no-appointments">Brak wizyt w tym dniu</p>
              </ng-template>
            </div>

            <!-- Upcoming Appointments -->
            <div class="upcoming-appointments" *ngIf="upcomingAppointments.length > 0">
              <h4>Nadchodzące wizyty ({{ upcomingAppointments.length }})</h4>
              <div class="appointments-list">
                @for (appointment of upcomingAppointments.slice(0, 5); track appointment.id) {
                  <div class="appointment-card" [class]="appointment.status">
                    <div class="appointment-date">
                      {{ appointment.date | date:'dd.MM.yyyy (EEEE)':'pl' }}
                    </div>
                    <div class="appointment-time">
                      {{ appointment.startTime }} - {{ appointment.endTime }}
                    </div>
                    <div class="appointment-type">
                      {{ appointment.type === 'individual' ? 'Sesja indywidualna' : 'Sesja grupowa' }}
                    </div>
                    <div class="appointment-status">
                      {{ getStatusText(appointment.status) }}
                    </div>
                    @if (appointment.notes) {
                      <div class="appointment-notes">
                        <small><strong>Notatki:</strong> {{ appointment.notes }}</small>
                      </div>
                    }
                    <div class="appointment-psychologist">
                      <small>Psycholog: {{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</small>
                    </div>
                  </div>
                }
              </div>
              @if (upcomingAppointments.length > 5) {
                <p class="more-appointments-note">
                  I {{ upcomingAppointments.length - 5 }} więcej wizyt...
                </p>
              }
            </div>

            <!-- Past Appointments -->
            <div class="past-appointments" *ngIf="recentAppointments.length > 0">
              <h4>Ostatnie wizyty</h4>
              <div class="appointments-list">
                @for (appointment of recentAppointments.slice(0, 3); track appointment.id) {
                  <div class="appointment-card past" [class]="appointment.status">
                    <div class="appointment-date">
                      {{ appointment.date | date:'dd.MM.yyyy':'pl' }}
                    </div>
                    <div class="appointment-time">
                      {{ appointment.startTime }} - {{ appointment.endTime }}
                    </div>
                    <div class="appointment-status">
                      {{ getStatusText(appointment.status) }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- No appointments message -->
          <div class="empty-state" *ngIf="assignedPsychologist && calendarData.length === 0">
            <div class="empty-icon">📅</div>
            <h4>Brak wizyt w tym miesiącu</h4>
            <p>Skontaktuj się ze swoim psychologiem aby umówić wizytę</p>
          </div>
        </section>

        <!-- Search Tab (Legacy) -->
        <section class="search-section" *ngIf="activeTab === 'search'">
          <!-- Psychologist search will be implemented later -->
          <div class="placeholder">
            <p>Wyszukiwanie psychologów będzie dostępne wkrótce</p>
          </div>
        </section>

        <!-- Packages Tab -->
        <section class="packages-section" *ngIf="activeTab === 'packages'">
          <!-- Package management will be implemented later -->
          <div class="placeholder">
            <p>Zarządzanie pakietami będzie dostępne wkrótce</p>
          </div>
        </section>
      </main>



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
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="star"
                          [class.filled]="star <= newReview.rating"
                          (click)="setRating(star)">⭐</span>
                  }
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
    sessionsThisMonth: 0
  };
  assignedPsychologist: User | null = null;
  currentPackage: Package | null = null;
  recentAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  userNotes: PsychologistNote[] = [];
  userReviews: Review[] = [];

  // Calendar
  currentMonth = 7; // August (0-based, so 7 = August)
  currentYear = 2025;
  calendarData: any[] = [];
  selectedDate: Date | null = null;
  selectedDayAppointments: Appointment[] = [];

  // Psychologists
  allPsychologists: User[] = [];
  filteredPsychologists: User[] = [];
  searchTerm = '';
  selectedSpecialization = '';
  priceFilter = '';
  ratingFilter = '';

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
    goals: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
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
    private dataSeederService: DataSeederService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user in dashboard:', this.currentUser);

    if (!this.currentUser) {
      console.log('No user logged in, redirecting to login...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('User role:', this.currentUser.role);

    // Redirect if user has specific role
    if (this.currentUser.role !== 'user') {
      console.log('User has role:', this.currentUser.role, '- checking for dashboard redirect...');

      // If user doesn't have any role, treat as regular user
      if (!this.currentUser.role) {
        console.log('User has no role, treating as regular user');
        this.currentUser.role = 'user'; // Set default role
      } else {
        console.log('Redirecting to role-specific dashboard...');
        const dashboardRoute = this.authService.redirectToDashboard(this.currentUser);
        this.router.navigate([dashboardRoute]);
        return;
      }
    }

    console.log('User is regular user, continuing with dashboard initialization...');

    // Initialize demo data (psychologists only)
    console.log('Calling initializeDemoData()...');
    await this.initializeDemoData();

    console.log('Calling loadDashboardData()...');
    this.loadDashboardData();
  }

  // Initialize demo data (psychologists only)
  async initializeDemoData() {
    try {
      console.log('=== INITIALIZING DEMO PSYCHOLOGISTS ===');
      console.log('Calling dataSeederService.seedPsychologistsOnly()...');

      // Only seed psychologists - users will be created via registration
      await this.dataSeederService.seedPsychologistsOnly();
      console.log('Demo psychologists initialized successfully');

      // Test if we can read psychologists immediately after seeding
      console.log('Testing immediate read after seeding...');
      const testPsychs = await this.userService.getAllPsychologists();
      console.log('Psychologists found after seeding:', testPsychs.length);

    } catch (error) {
      console.error('Demo psychologists initialization failed:', error);
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      console.log('=== LOADING DASHBOARD DATA ===');
      console.log('Current user:', this.currentUser);

      if (this.currentUser) {
        console.log('🔍 CURRENT USER DEBUG:');
        console.log(`   User ID: ${this.currentUser.id}`);
        console.log(`   Email: ${this.currentUser.email}`);
        console.log(`   Expected Firebase userId: WmoA9OnaVfXSnz3dP6vNEZIW1I13`);
        console.log(`   Match? ${this.currentUser.id === 'WmoA9OnaVfXSnz3dP6vNEZIW1I13'}`);

        console.log('Loading user stats...');
        // Load user stats
        this.userStats = await this.userService.getUserStats(this.currentUser.id);
        console.log('User stats loaded:', this.userStats);

        console.log('Loading user appointments...');
        // Load user's appointments
        const appointments = await this.appointmentService.getUserAppointments(this.currentUser.id);
        console.log('Appointments loaded:', appointments.length);
        console.log('Current user ID:', this.currentUser.id);
        console.log('Expected user ID from Firebase:', 'WmoA9OnaVfXSnz3dP6vNEZIW1I13');

        // Debug each appointment
        appointments.forEach((apt, index) => {
          console.log(`Appointment ${index + 1}:`, {
            id: apt.id,
            date: apt.date,
            dateString: new Date(apt.date).toDateString(),
            startTime: apt.startTime,
            endTime: apt.endTime,
            status: apt.status,
            type: apt.type
          });
        });

        this.recentAppointments = appointments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Load upcoming appointments
        this.upcomingAppointments = appointments
          .filter(apt => new Date(apt.date) > new Date() && apt.status === 'scheduled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Load calendar data for current month
        await this.loadCalendarData();

        // Load assigned psychologist if exists
        if (this.currentUser.assignedPsychologistId) {
          console.log('Loading assigned psychologist:', this.currentUser.assignedPsychologistId);
          try {
            // Try to get psychologist from users collection (where they're stored)
            const psychologist = await this.userService.getUserProfile(this.currentUser.assignedPsychologistId);
            if (psychologist) {
              this.assignedPsychologist = psychologist;
              console.log('Assigned psychologist loaded from users:', this.assignedPsychologist);
            } else {
              console.log('Psychologist not found in users collection, trying psychologists collection...');
              // Fallback to psychologists collection
              const psychFromPsychCollection = await this.psychologistService.getPsychologist(
                this.currentUser.assignedPsychologistId
              );
              if (psychFromPsychCollection) {
                this.assignedPsychologist = {
                  ...psychFromPsychCollection,
                  role: 'psychologist' as any,
                  isActive: true,
                  createdAt: new Date()
                };
                console.log('Assigned psychologist loaded from psychologists collection:', this.assignedPsychologist);
              }
            }
          } catch (error) {
            console.error('Error loading psychologist:', error);
          }
        }

        // Load current package
        if (this.currentUser.activePackageId) {
          console.log('Loading active package:', this.currentUser.activePackageId);
          try {
            this.currentPackage = await this.packageService.getPackage(
              this.currentUser.activePackageId
            );
            console.log('Package loaded:', this.currentPackage);
          } catch (error) {
            console.error('Error loading package:', error);
          }
        }

        // Load user notes from psychologist_notes collection
        console.log('Loading user notes...');
        try {
          this.userNotes = await this.userService.getUserNotes(this.currentUser.id);
          console.log('Notes loaded from psychologist_notes collection:', this.userNotes.length);

          // Log each note for debugging
          this.userNotes.forEach((note, index) => {
            console.log(`Note ${index + 1}:`, {
              title: note.title,
              content: note.content?.substring(0, 50) + '...',
              psychologistId: note.psychologistId,
              isVisibleToUser: note.isVisibleToUser,
              tags: note.tags
            });
          });
        } catch (error) {
          console.error('Error loading notes:', error);
          this.userNotes = [];
        }

        // Load user reviews
        console.log('Loading user reviews...');
        try {
          this.userReviews = await this.userService.getUserReviews(this.currentUser.id);
          console.log('Reviews loaded:', this.userReviews.length);
        } catch (error) {
          console.error('Error loading reviews:', error);
          this.userReviews = [];
        }

        // Load all psychologists for selection
        console.log('=== LOADING ALL PSYCHOLOGISTS ===');
        try {
          console.log('Calling userService.getAllPsychologists()...');
          this.allPsychologists = await this.userService.getAllPsychologists();
          console.log('getAllPsychologists() returned:', this.allPsychologists);

          this.filteredPsychologists = [...this.allPsychologists];
          console.log('ALL PSYCHOLOGISTS LOADED:', this.allPsychologists.length);

          // Print each psychologist
          this.allPsychologists.forEach((psych, index) => {
            console.log(`Psychologist ${index + 1}:`, {
              id: psych.id,
              firstName: psych.firstName,
              lastName: psych.lastName,
              role: psych.role,
              isActive: psych.isActive,
              specializations: psych.specializations
            });
          });

        } catch (error) {
          console.error('ERROR LOADING PSYCHOLOGISTS:', error);
          this.allPsychologists = [];
          this.filteredPsychologists = [];
        }

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
          goals: this.currentUser.profileData?.goals || '',
          emergencyContactName: this.currentUser.profileData?.emergencyContact?.name || '',
          emergencyContactPhone: this.currentUser.profileData?.emergencyContact?.phone || '',
          emergencyContactRelation: this.currentUser.profileData?.emergencyContact?.relationship || ''
        };
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
      console.log('=== DASHBOARD DATA LOADING COMPLETE ===');
      console.log('Final psychologists count:', this.allPsychologists.length);
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

    // Price filter
    if (this.priceFilter) {
      filtered = filtered.filter(p => {
        const price = p.pricePerSession || p.hourlyRate || 0;
        switch (this.priceFilter) {
          case '0-100':
            return price <= 100;
          case '100-150':
            return price > 100 && price <= 150;
          case '150-200':
            return price > 150 && price <= 200;
          case '200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (this.ratingFilter) {
      filtered = filtered.filter(p => {
        const rating = p.rating || 0;
        switch (this.ratingFilter) {
          case '4.5+':
            return rating >= 4.5;
          case '4.0+':
            return rating >= 4.0;
          case '3.5+':
            return rating >= 3.5;
          default:
            return true;
        }
      });
    }

    this.filteredPsychologists = filtered;
  }

  async selectPsychologist(psychologist: User): Promise<void> {
    if (!this.currentUser) {
      console.error('No current user found');
      alert('Błąd: Brak danych użytkownika');
      return;
    }

    if (!this.currentUser.canSelectPsychologist) {
      alert('Nie masz uprawnień do wyboru psychologa. Skontaktuj się z administratorem w celu aktywacji konta.');
      return;
    }

    if (!psychologist || !psychologist.id) {
      console.error('Invalid psychologist data:', psychologist);
      alert('Błąd: Nieprawidłowe dane psychologa');
      return;
    }

    try {
      this.isLoading = true;
      console.log(`Assigning psychologist ${psychologist.firstName} ${psychologist.lastName} to user ${this.currentUser.id}`);

      await this.userService.requestPsychologistAssignment(
        this.currentUser.id,
        psychologist.id,
        `Użytkownik wybrał psychologa: ${psychologist.firstName} ${psychologist.lastName}`
      );

      // Update current user data - psychologist is now immediately assigned
      this.currentUser.assignedPsychologistId = psychologist.id;
      this.currentUser.assignmentStatus = 'approved';
      this.assignedPsychologist = psychologist;

      // Show success message
      alert(`Psycholog ${psychologist.firstName} ${psychologist.lastName} został przypisany. Możesz teraz umówić się na wizytę!`);

      // Refresh data to show updated status
      await this.loadDashboardData();

      // Switch to "My Psychologist" tab to show the assigned psychologist
      this.setActiveTab('my-psychologist');

    } catch (error) {
      console.error('Error selecting psychologist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Wystąpił błąd podczas wybierania psychologa: ${errorMessage}`);
    } finally {
      this.isLoading = false;
    }
  }

  viewPsychologistProfile(psychologist: User): void {
    // TODO: Navigate to psychologist profile page or show modal
    console.log('View psychologist profile:', psychologist);
  }

  // ===== PROFILE MANAGEMENT =====

  async updateProfile(): Promise<void> {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;

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
    } finally {
      this.isLoading = false;
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
      this.isLoading = true;

      await this.userService.changePsychologist(
        this.currentUser.id,
        this.changeRequest.newPsychologistId,
        this.changeRequest.reason,
        this.changeRequest.urgency
      );

      // Update local data - change is immediate
      this.currentUser.assignedPsychologistId = this.changeRequest.newPsychologistId;
      this.currentUser.assignmentStatus = 'approved';

      // Find the new psychologist from the list
      const newPsychologist = this.allPsychologists.find(p => p.id === this.changeRequest.newPsychologistId);
      if (newPsychologist) {
        this.assignedPsychologist = newPsychologist;
      }

      this.closeChangePsychologistModal();
      alert(`Psycholog został zmieniony na ${newPsychologist?.firstName} ${newPsychologist?.lastName}!`);

      // Refresh data and switch to psychologist tab
      await this.loadDashboardData();
      this.setActiveTab('my-psychologist');

    } catch (error) {
      console.error('Error submitting psychologist change:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Wystąpił błąd podczas zmiany psychologa: ${errorMessage}`);
    } finally {
      this.isLoading = false;
    }
  }

  // ===== REVIEWS =====

  openAddReviewModal(): void {
    this.showAddReview = true;
  }

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
      this.isLoading = true;

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
    } finally {
      this.isLoading = false;
    }
  }

  rateSession(appointment: Appointment): void {
    // Set appointment context for review
    this.showAddReview = true;
    // Could add appointment-specific data to review
  }

  // ===== DEMO DATA MANAGEMENT =====

  async refreshData(): Promise<void> {
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

  // ===== TEST FUNCTIONS =====

  async switchToTestPsychologist(): Promise<void> {
    if (!confirm('FUNKCJA TESTOWA: Czy na pewno chcesz przełączyć się na rolę psychologa? To zmieni Twoje konto.')) {
      return;
    }

    if (!this.currentUser) {
      alert('Błąd: Brak danych użytkownika');
      return;
    }

    try {
      this.isLoading = true;
      console.log('Switching user to psychologist role...');

      // Update user role and psychologist data in Firebase
      const psychologistUpdate = {
        role: 'psychologist' as any,
        specializations: ['Zaburzenia lękowe', 'Depresja', 'Terapia poznawczo-behawioralna'],
        description: 'Doświadczony psycholog specjalizujący się w terapii poznawczo-behawioralnej.',
        experience: 5,
        education: 'Magister Psychologii, specjalizacja psychologia kliniczna',
        languages: ['Polski', 'Angielski'],
        hourlyRate: 150,
        isAvailable: true,
        rating: 4.8,
        reviewCount: 0,
        completedSessions: 0,
        workingHours: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '15:00' }],
          saturday: [],
          sunday: []
        }
      };

      await this.userService.updateUserBasicInfo(this.currentUser.id, psychologistUpdate);

      // Update local user data
      this.currentUser.role = 'psychologist';
      localStorage.setItem('user', JSON.stringify(this.currentUser));

      alert('Rola została zmieniona na psychologa! Za chwilę zostaniesz przekierowany.');

      // Redirect to psychologist dashboard
      setTimeout(() => {
        this.router.navigate(['/psychologist-dashboard']);
      }, 2000);

    } catch (error) {
      console.error('Error switching to psychologist role:', error);
      alert('Wystąpił błąd podczas zmiany roli');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== CALENDAR METHODS =====

  async loadCalendarData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      console.log(`🗓️ Loading calendar data for month ${this.currentMonth + 1}/${this.currentYear} for user ${this.currentUser.id}`);

      this.calendarData = await this.userService.getUserCalendarData(
        this.currentUser.id,
        this.currentMonth,
        this.currentYear
      );

      console.log(`🗓️ Calendar data loaded: ${this.calendarData.length} days`);
      console.log(`🗓️ Days with appointments: ${this.calendarData.filter(d => d.hasAppointment).length}`);

      // Log days with appointments for debugging
      this.calendarData.filter(d => d.hasAppointment).forEach(day => {
        console.log(`🗓️ Day ${day.day} has ${day.appointments.length} appointments`);
      });

    } catch (error) {
      console.error('❌ Error loading calendar data:', error);
      this.calendarData = [];
    }
  }

  getCurrentMonthYear(): string {
    const date = new Date(this.currentYear, this.currentMonth);
    return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  }

  async previousMonth(): Promise<void> {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    await this.loadCalendarData();
  }

  async nextMonth(): Promise<void> {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    await this.loadCalendarData();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    console.log('Selected date:', date);

    // Find appointments for this date
    this.selectedDayAppointments = this.recentAppointments
      .concat(this.upcomingAppointments)
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDate() === date.getDate() &&
          aptDate.getMonth() === date.getMonth() &&
          aptDate.getFullYear() === date.getFullYear();
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  generateFallbackCalendar(): any[] {
    const calendarData: any[] = [];

    // Get first day of month and its weekday
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstWeekday; i++) {
      calendarData.push({
        date: null,
        day: null,
        isEmpty: true
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, day);
      calendarData.push({
        date: currentDate,
        day: day,
        isEmpty: false,
        isToday: this.isToday(currentDate),
        hasAppointment: false,
        appointments: []
      });
    }

    return calendarData;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  requestNewAppointment(): void {
    if (!this.assignedPsychologist) {
      alert('Musisz najpierw wybrać psychologa');
      return;
    }

    // TODO: Implement appointment booking modal or navigate to booking page
    alert('Funkcjonalność umówienia wizyty będzie dostępna wkrótce. Skontaktuj się z psychologiem bezpośrednio.');
  }

  onImageError(event: any): void {
    // Set fallback image when psychologist image fails to load
    event.target.src = '/assets/specialists/default-avatar.png';
  }

  sendMessage(): void {
    // TODO: Implement messaging functionality
    alert('Funkcja wiadomości będzie dostępna wkrótce!');
  }
}
