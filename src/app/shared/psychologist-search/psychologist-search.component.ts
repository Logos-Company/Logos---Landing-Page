import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsychologistService } from '../../core/psychologist.service';
import { AuthService } from '../../core/auth.service';
import { PackageService, UserPackage } from '../../core/package.service';
import { Psychologist } from '../../models/psychologist.model';
import { Review, User } from '../../models/user.model';

@Component({
  selector: 'app-psychologist-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h2>Znajdź swojego psychologa</h2>
        <p>Przeszukaj naszą bazę wykwalifikowanych specjalistów</p>
        
        <!-- Package Status Info -->
        <div class="package-status-info" *ngIf="currentUser">
          <div class="status-card" [class]="hasActivePackage ? 'active' : 'inactive'">
            <div class="status-icon">{{ hasActivePackage ? '✅' : '❌' }}</div>
            <div class="status-content">
              <h4 *ngIf="hasActivePackage">Pakiet aktywny</h4>
              <h4 *ngIf="!hasActivePackage">Brak aktywnego pakietu</h4>
              <p *ngIf="hasActivePackage && userPackage">
                Pozostało sesji: {{ userPackage.sessionsRemaining }}/{{ userPackage.totalSessions }}
              </p>
              <p *ngIf="!hasActivePackage">
                Skontaktuj się z administratorem, aby aktywować pakiet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="search-controls">
        <div class="search-input-container">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="onSearchInput()"
            placeholder="Wyszukaj po imieniu, nazwisku lub specjalizacji..."
            class="search-input"
          >
          <button class="search-btn" (click)="search()">
            🔍
          </button>
        </div>
        
        <button class="random-btn" (click)="loadRandomPsychologists()">
          Pokaż losowych (10)
        </button>
      </div>

      <div class="filters" *ngIf="allPsychologists.length > 0">
        <h3>Filtry</h3>
        <div class="filter-row">
          <div class="filter-group">
            <label>Specjalizacja:</label>
            <select [(ngModel)]="selectedSpecialization" (change)="applyFilters()">
              <option value="">Wszystkie</option>
              <option *ngFor="let spec of availableSpecializations" [value]="spec">
                {{ spec }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Ocena min:</label>
            <select [(ngModel)]="minRating" (change)="applyFilters()">
              <option value="">Wszystkie</option>
              <option value="4">4+ ⭐</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="5">5 ⭐</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Dostępność:</label>
            <select [(ngModel)]="availabilityFilter" (change)="applyFilters()">
              <option value="">Wszystkie</option>
              <option value="available">Dostępni</option>
            </select>
          </div>
        </div>
      </div>

      <div class="search-results">
        <div *ngIf="isLoading" class="loading">
          <p>Ładowanie...</p>
        </div>

        <div *ngIf="!isLoading && filteredPsychologists.length === 0 && searchTerm" class="no-results">
          <p>Nie znaleziono psychologów pasujących do wyszukiwania.</p>
          <button class="btn btn-primary" (click)="loadRandomPsychologists()">
            Pokaż losowych psychologów
          </button>
        </div>

        <div *ngIf="!isLoading && filteredPsychologists.length === 0 && !searchTerm" class="welcome">
          <p>Rozpocznij wyszukiwanie lub kliknij "Pokaż losowych" aby zobaczyć dostępnych psychologów.</p>
        </div>

        <div class="psychologists-grid" *ngIf="filteredPsychologists.length > 0">
          <div 
            *ngFor="let psychologist of filteredPsychologists" 
            class="psychologist-card"
            (click)="selectPsychologist(psychologist)"
          >
            <div class="psychologist-image">
              <img 
                [src]="psychologist.profileImage || '/assets/psychologist1.png'" 
                [alt]="psychologist.firstName + ' ' + psychologist.lastName"
                (error)="onImageError($event)"
              >
            </div>
            
            <div class="psychologist-info">
              <h3>{{ psychologist.firstName }} {{ psychologist.lastName }}</h3>
              
              <div class="specializations">
                <span *ngFor="let spec of psychologist.specializations" class="spec-tag">
                  {{ spec }}
                </span>
              </div>
              
              <div class="rating-container">
                <div class="rating">
                  <span class="stars">
                    <span *ngFor="let star of getStars(psychologist.rating)" [class]="star.class">
                      ⭐
                    </span>
                  </span>
                  <span class="rating-text">
                    {{ psychologist.rating }}/5 ({{ psychologist.reviewCount }} opinii)
                  </span>
                </div>
              </div>
              
              <div class="experience">
                <strong>Doświadczenie:</strong> {{ psychologist.experience }} lat
              </div>
              
              <div class="languages" *ngIf="psychologist.languages.length > 0">
                <strong>Języki:</strong> {{ psychologist.languages.join(', ') }}
              </div>
              
              <div class="price">
                <strong>{{ psychologist.hourlyRate }} zł/sesja</strong>
              </div>
              
              <div class="availability" [class.available]="psychologist.isAvailable">
                {{ psychologist.isAvailable ? 'Dostępny' : 'Niedostępny' }}
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-primary" (click)="viewProfile(psychologist, $event)">
                Zobacz profil
              </button>
              <button 
                class="btn btn-secondary" 
                (click)="bookAppointment(psychologist, $event)"
                [disabled]="!psychologist.isAvailable || !hasActivePackage"
                [title]="getBookingButtonTitle(psychologist)"
              >
                {{ getBookingButtonText() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Psychologist Profile Modal -->
      <div class="modal" *ngIf="selectedPsychologist" (click)="closeProfile()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedPsychologist.firstName }} {{ selectedPsychologist.lastName }}</h3>
            <button class="close-btn" (click)="closeProfile()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="profile-content">
              <div class="profile-image">
                <img 
                  [src]="selectedPsychologist.profileImage || '/assets/psychologist1.png'" 
                  [alt]="selectedPsychologist.firstName + ' ' + selectedPsychologist.lastName"
                  (error)="onImageError($event)"
                >
              </div>
              
              <div class="profile-details">
                <div class="detail-section">
                  <h4>Specjalizacje</h4>
                  <div class="specializations">
                    <span *ngFor="let spec of selectedPsychologist.specializations" class="spec-tag">
                      {{ spec }}
                    </span>
                  </div>
                </div>
                
                <div class="detail-section">
                  <h4>Opis</h4>
                  <p>{{ selectedPsychologist.description || 'Brak opisu' }}</p>
                </div>
                
                <div class="detail-section">
                  <h4>Wykształcenie</h4>
                  <p>{{ selectedPsychologist.education || 'Brak informacji' }}</p>
                </div>
                
                <div class="detail-section">
                  <h4>Doświadczenie</h4>
                  <p>{{ selectedPsychologist.experience }} lat praktyki</p>
                </div>
                
                <div class="detail-section" *ngIf="selectedPsychologist.languages.length > 0">
                  <h4>Języki</h4>
                  <p>{{ selectedPsychologist.languages.join(', ') }}</p>
                </div>
                
                <div class="detail-section">
                  <h4>Ocena</h4>
                  <div class="rating">
                    <span class="stars">
                      <span *ngFor="let star of getStars(selectedPsychologist.rating)" [class]="star.class">
                        ⭐
                      </span>
                    </span>
                    <span class="rating-text">
                      {{ selectedPsychologist.rating }}/5 ({{ selectedPsychologist.reviewCount }} opinii)
                    </span>
                  </div>
                </div>
                
                <div class="detail-section">
                  <h4>Cena</h4>
                  <p class="price-large">{{ selectedPsychologist.hourlyRate }} zł za sesję</p>
                </div>
              </div>
              
              <!-- Reviews Section -->
              <div class="reviews-section" *ngIf="selectedPsychologistReviews.length > 0">
                <h4>Ostatnie opinie</h4>
                <div class="reviews-list">
                  <div *ngFor="let review of selectedPsychologistReviews.slice(0, 3)" class="review-item">
                    <div class="review-header">
                      <span class="review-rating">
                        <span *ngFor="let star of getStars(review.rating)" [class]="star.class">⭐</span>
                      </span>
                      <span class="review-date">{{ review.createdAt | date:'short' }}</span>
                    </div>
                    <p class="review-comment" *ngIf="review.comment">{{ review.comment }}</p>
                    <small class="review-sessions">Po {{ review.sessionCount }} sesjach</small>
                  </div>
                </div>
              </div>
              
              <!-- Add Review Section (if user can review) -->
              <div class="add-review-section" *ngIf="canLeaveReview(selectedPsychologist)">
                <h4>Zostaw opinię</h4>
                <div class="review-form">
                  <div class="rating-input">
                    <label>Ocena:</label>
                    <select [(ngModel)]="newReview.rating">
                      <option value="1">1 ⭐</option>
                      <option value="2">2 ⭐</option>
                      <option value="3">3 ⭐</option>
                      <option value="4">4 ⭐</option>
                      <option value="5">5 ⭐</option>
                    </select>
                  </div>
                  <div class="comment-input">
                    <label>Komentarz (opcjonalnie):</label>
                    <textarea [(ngModel)]="newReview.comment" placeholder="Podziel się swoją opinią..."></textarea>
                  </div>
                  <div class="anonymous-option">
                    <label>
                      <input type="checkbox" [(ngModel)]="newReview.isAnonymous">
                      Opinia anonimowa
                    </label>
                  </div>
                  <button class="btn btn-primary" (click)="submitReview()">
                    Dodaj opinię
                  </button>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button 
                class="btn btn-primary btn-large" 
                (click)="bookAppointment(selectedPsychologist, $event)"
                [disabled]="!selectedPsychologist.isAvailable || !hasActivePackage"
                [title]="getBookingButtonTitle(selectedPsychologist)"
              >
                {{ getBookingButtonText() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./psychologist-search.component.scss']
})
export class PsychologistSearchComponent implements OnInit {
  searchTerm = '';
  allPsychologists: Psychologist[] = [];
  filteredPsychologists: Psychologist[] = [];
  isLoading = false;

  // Filters
  selectedSpecialization = '';
  minRating = '';
  availabilityFilter = '';
  availableSpecializations: string[] = [];

  // Selected psychologist for profile view
  selectedPsychologist: Psychologist | null = null;
  selectedPsychologistReviews: Review[] = [];

  // User package info
  currentUser: User | null = null;
  userPackage: UserPackage | null = null;
  hasActivePackage = false;

  // Review form
  newReview = {
    rating: 5,
    comment: '',
    isAnonymous: false
  };

  private searchTimeout: any;

  constructor(
    private psychologistService: PsychologistService,
    private authService: AuthService,
    private packageService: PackageService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllPsychologists();
    this.checkUserPackage();
  }

  async checkUserPackage() {
    if (!this.currentUser) return;

    try {
      this.userPackage = await this.packageService.getUserPackage(this.currentUser.id);
      this.hasActivePackage = this.userPackage?.status === 'active' &&
        this.userPackage?.sessionsRemaining > 0;
    } catch (error) {
      console.error('Error checking user package:', error);
      this.hasActivePackage = false;
    }
  }

  async loadAllPsychologists() {
    this.isLoading = true;
    try {
      this.allPsychologists = await this.psychologistService.getAllPsychologists();
      this.extractSpecializations();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading psychologists:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadRandomPsychologists() {
    this.isLoading = true;
    try {
      this.filteredPsychologists = await this.psychologistService.getRandomPsychologists(10);
    } catch (error) {
      console.error('Error loading random psychologists:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearchInput() {
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search();
    }, 300);
  }

  async search() {
    if (!this.searchTerm.trim()) {
      this.applyFilters();
      return;
    }

    this.isLoading = true;
    try {
      const results = await this.psychologistService.searchPsychologists(this.searchTerm);
      this.filteredPsychologists = this.applyCurrentFilters(results);
    } catch (error) {
      console.error('Error searching psychologists:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    this.filteredPsychologists = this.applyCurrentFilters(this.allPsychologists);
  }

  private applyCurrentFilters(psychologists: Psychologist[]): Psychologist[] {
    let filtered = [...psychologists];

    // Specialization filter
    if (this.selectedSpecialization) {
      filtered = filtered.filter(p =>
        p.specializations.includes(this.selectedSpecialization)
      );
    }

    // Rating filter
    if (this.minRating) {
      const minRatingNum = parseFloat(this.minRating);
      filtered = filtered.filter(p => p.rating >= minRatingNum);
    }

    // Availability filter
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(p => p.isAvailable);
    }

    return filtered;
  }

  private extractSpecializations() {
    const specializations = new Set<string>();
    this.allPsychologists.forEach(p => {
      p.specializations.forEach(spec => specializations.add(spec));
    });
    this.availableSpecializations = Array.from(specializations).sort();
  }

  selectPsychologist(psychologist: Psychologist) {
    // This is handled by card click for basic selection
    // Profile viewing is handled by viewProfile method
  }

  async viewProfile(psychologist: Psychologist, event: Event) {
    event.stopPropagation();
    this.selectedPsychologist = psychologist;

    // Load reviews for this psychologist
    try {
      this.selectedPsychologistReviews = await this.psychologistService.getPsychologistReviews(psychologist.id);
    } catch (error) {
      console.error('Error loading reviews:', error);
      this.selectedPsychologistReviews = [];
    }
  }

  closeProfile() {
    this.selectedPsychologist = null;
    this.selectedPsychologistReviews = [];
    this.resetReviewForm();
  }

  bookAppointment(psychologist: Psychologist, event: Event) {
    event.stopPropagation();

    if (!this.currentUser) {
      alert('Musisz być zalogowany, aby umówić wizytę.');
      return;
    }

    if (!this.hasActivePackage) {
      const message = this.userPackage
        ? 'Twój pakiet jest nieaktywny lub wykorzystałeś wszystkie sesje. Skontaktuj się z administratorem, aby aktywować nowy pakiet.'
        : 'Nie masz aktywnego pakietu. Skontaktuj się z administratorem, aby aktywować pakiet sesji.';

      alert(message);
      return;
    }

    // TODO: Implement appointment booking for users with active packages
    console.log('Book appointment with:', psychologist.firstName, psychologist.lastName);
    alert(`Umawianie wizyty z ${psychologist.firstName} ${psychologist.lastName} - funkcja w rozwoju. Masz dostępne ${this.userPackage?.sessionsRemaining} sesji.`);
  }

  getStars(rating: number): { class: string }[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push({ class: 'full' });
    }

    if (hasHalfStar) {
      stars.push({ class: 'half' });
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push({ class: 'empty' });
    }

    return stars;
  }

  onImageError(event: any) {
    event.target.src = '/assets/psychologist1.png';
  }

  canLeaveReview(psychologist: Psychologist): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // TODO: Check if user has had at least 3 sessions with this psychologist
    // This would require querying appointments
    return true; // For now, allow all logged-in users to review
  }

  async submitReview() {
    if (!this.selectedPsychologist) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Musisz być zalogowany, aby dodać opinię.');
      return;
    }

    try {
      await this.psychologistService.addReview({
        userId: currentUser.id,
        psychologistId: this.selectedPsychologist.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment || undefined,
        isAnonymous: this.newReview.isAnonymous,
        sessionCount: 3, // TODO: Get actual session count
        createdAt: new Date()
      });

      // Reload reviews
      this.selectedPsychologistReviews = await this.psychologistService.getPsychologistReviews(this.selectedPsychologist.id);

      // Update psychologist rating in the list
      const updatedPsychologist = await this.psychologistService.getPsychologistById(this.selectedPsychologist.id);
      if (updatedPsychologist) {
        this.selectedPsychologist = updatedPsychologist;
        // Update in the lists
        const index = this.allPsychologists.findIndex(p => p.id === updatedPsychologist.id);
        if (index !== -1) {
          this.allPsychologists[index] = updatedPsychologist;
        }
        const filteredIndex = this.filteredPsychologists.findIndex(p => p.id === updatedPsychologist.id);
        if (filteredIndex !== -1) {
          this.filteredPsychologists[filteredIndex] = updatedPsychologist;
        }
      }

      this.resetReviewForm();
      alert('Opinia została dodana pomyślnie!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Wystąpił błąd podczas dodawania opinii.');
    }
  }

  private resetReviewForm() {
    this.newReview = {
      rating: 5,
      comment: '',
      isAnonymous: false
    };
  }

  getBookingButtonText(): string {
    if (!this.currentUser) {
      return 'Zaloguj się';
    }
    if (!this.hasActivePackage) {
      return 'Brak pakietu';
    }
    return 'Umów wizytę';
  }

  getBookingButtonTitle(psychologist: Psychologist): string {
    if (!this.currentUser) {
      return 'Musisz być zalogowany, aby umówić wizytę';
    }
    if (!this.hasActivePackage) {
      const message = this.userPackage
        ? 'Twój pakiet jest nieaktywny lub wykorzystałeś wszystkie sesje. Skontaktuj się z administratorem.'
        : 'Nie masz aktywnego pakietu. Skontaktuj się z administratorem.';
      return message;
    }
    if (!psychologist.isAvailable) {
      return 'Psycholog jest obecnie niedostępny';
    }
    return `Umów wizytę z ${psychologist.firstName} ${psychologist.lastName}. Pozostało sesji: ${this.userPackage?.sessionsRemaining || 0}`;
  }
}
