import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/appointment.service';
import { PsychologistService } from '../../core/psychologist.service';
import { AuthService } from '../../core/auth.service';
import { Appointment } from '../../models/appointment.model';
import { Psychologist } from '../../models/psychologist.model';
import { User } from '../../models/user.model';

interface CalendarDay {
  date: Date;
  day: number;
  appointments: Appointment[];
  hasAppointment: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button class="nav-btn" (click)="previousMonth()">‹</button>
        <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
        <button class="nav-btn" (click)="nextMonth()">›</button>
      </div>

      <div class="calendar-grid">
        <div class="day-header" *ngFor="let day of dayNames">{{ day }}</div>
        
        <div 
          *ngFor="let day of calendarDays" 
          class="calendar-day"
          [class.today]="day.isToday"
          [class.has-appointment]="day.hasAppointment"
          [class.other-month]="!day.isCurrentMonth"
          (click)="onDayClick(day)"
        >
          <span class="day-number">{{ day.day }}</span>
          <div class="appointments" *ngIf="day.hasAppointment">
            <div 
              *ngFor="let appointment of day.appointments" 
              class="appointment-dot"
              [class.scheduled]="appointment.status === 'scheduled'"
              [class.completed]="appointment.status === 'completed'"
              [class.cancelled]="appointment.status === 'cancelled'"
              [title]="getAppointmentTitle(appointment)"
            >
              {{ appointment.startTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Day Detail Modal -->
      <div class="modal" *ngIf="selectedDay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ formatDate(selectedDay.date) }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div *ngIf="selectedDay.appointments.length === 0" class="no-appointments">
              <p>Brak wizyt w tym dniu</p>
              <button class="btn btn-primary" (click)="scheduleAppointment(selectedDay.date)">
                Umów wizytę
              </button>
            </div>
            
            <div *ngIf="selectedDay.appointments.length > 0" class="appointments-list">
              <div 
                *ngFor="let appointment of selectedDay.appointments" 
                class="appointment-item"
                [class.scheduled]="appointment.status === 'scheduled'"
                [class.completed]="appointment.status === 'completed'"
                [class.cancelled]="appointment.status === 'cancelled'"
              >
                <div class="appointment-time">
                  {{ appointment.startTime }} - {{ appointment.endTime }}
                </div>
                <div class="appointment-psychologist" *ngIf="getPsychologistName(appointment.psychologistId) | async as psychologistName">
                  {{ psychologistName }}
                </div>
                <div class="appointment-status">
                  <span class="status-badge" [class]="appointment.status">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </div>
                <div class="appointment-actions" *ngIf="appointment.status === 'scheduled'">
                  <button class="btn btn-sm btn-secondary" (click)="sendMessage(appointment)">
                    Wiadomość
                  </button>
                  <button class="btn btn-sm btn-warning" (click)="rescheduleAppointment(appointment)">
                    Przełóż
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="cancelAppointment(appointment)">
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Time Slots Modal -->
      <div class="modal" *ngIf="showTimeSlots" (click)="closeTimeSlots()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Dostępne godziny - {{ formatDate(selectedDate!) }}</h3>
            <button class="close-btn" (click)="closeTimeSlots()">×</button>
          </div>
          
          <div class="modal-body">
            <div *ngIf="availableTimeSlots.length === 0" class="no-slots">
              <p>Brak dostępnych terminów w tym dniu</p>
            </div>
            
            <div *ngIf="availableTimeSlots.length > 0" class="time-slots">
              <h4>Wybierz godzinę:</h4>
              <div class="time-grid">
                <button 
                  *ngFor="let time of availableTimeSlots"
                  class="time-slot"
                  (click)="selectTimeSlot(time)"
                >
                  {{ time }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Psychologist Selection Modal -->
      <div class="modal" *ngIf="showPsychologistSelection" (click)="closePsychologistSelection()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Wybierz psychologa</h3>
            <button class="close-btn" (click)="closePsychologistSelection()">×</button>
          </div>
          
          <div class="modal-body">
            <div *ngIf="availablePsychologists.length === 0" class="no-psychologists">
              <p>Brak dostępnych psychologów w wybranym terminie</p>
            </div>
            
            <div *ngIf="availablePsychologists.length > 0" class="psychologists-list">
              <div 
                *ngFor="let psychologist of availablePsychologists"
                class="psychologist-item"
                (click)="selectPsychologist(psychologist)"
              >
                <div class="psychologist-info">
                  <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                  <p>{{ psychologist.specializations.join(', ') }}</p>
                  <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-text">{{ psychologist.rating }}/5 ({{ psychologist.reviewCount }} opinii)</span>
                  </div>
                  <p class="price">{{ psychologist.hourlyRate }} zł/sesja</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  @Input() userId!: string;
  @Input() assignedPsychologist?: Psychologist | null;
  @Output() appointmentCreated = new EventEmitter<void>();

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  showTimeSlots = false;
  showPsychologistSelection = false;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  availableTimeSlots: string[] = [];
  availablePsychologists: Psychologist[] = [];

  monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  dayNames = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];

  currentUser: User | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.generateCalendar();
  }

  async generateCalendar() {
    try {
      const calendarData = await this.appointmentService.getCalendarData(
        this.userId,
        this.currentMonth,
        this.currentYear
      );

      // Generate complete calendar grid including days from previous/next month
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      this.calendarDays = [];

      for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const existingDay = calendarData.find(day =>
          day.date.getDate() === currentDate.getDate() &&
          day.date.getMonth() === currentDate.getMonth()
        );

        this.calendarDays.push({
          date: currentDate,
          day: currentDate.getDate(),
          appointments: existingDay?.appointments || [],
          hasAppointment: existingDay?.hasAppointment || false,
          isToday: existingDay?.isToday || false,
          isCurrentMonth: currentDate.getMonth() === this.currentMonth
        });
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
    }
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  onDayClick(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    this.selectedDay = day;
  }

  closeModal() {
    this.selectedDay = null;
  }

  async scheduleAppointment(date: Date) {
    this.selectedDate = date;
    this.closeModal();

    // For now, show time slots for any psychologist
    // In a real implementation, you might want to show a psychologist selection first
    const randomPsychologists = await this.psychologistService.getRandomPsychologists(1);
    if (randomPsychologists.length > 0) {
      const timeSlots = await this.appointmentService.getAvailableTimeSlots(
        randomPsychologists[0].id,
        this.formatDateForAPI(date)
      );
      this.availableTimeSlots = timeSlots;
      this.showTimeSlots = true;
    }
  }

  closeTimeSlots() {
    this.showTimeSlots = false;
    this.selectedDate = null;
    this.availableTimeSlots = [];
  }

  async selectTimeSlot(time: string) {
    this.selectedTime = time;
    this.closeTimeSlots();

    // Jeśli użytkownik ma przypisanego psychologa, od razu utwórz wizytę
    if (this.assignedPsychologist && this.selectedDate) {
      // Sprawdź czy przypisany psycholog jest dostępny w tym terminie
      const isAvailable = await this.psychologistService.isPsychologistAvailable(
        this.assignedPsychologist.id,
        this.formatDateForAPI(this.selectedDate),
        time
      );

      if (isAvailable) {
        // Automatycznie utwórz wizytę z przypisanym psychologiem
        await this.createAppointmentWithPsychologist(this.assignedPsychologist);
      } else {
        // Psycholog nie jest dostępny, pokaż komunikat
        alert('Twój psycholog nie jest dostępny w tym terminie. Wybierz inny termin lub innego psychologa.');
        // Pokaż innych dostępnych psychologów
        await this.showAvailablePsychologists(time);
      }
    } else {
      // Brak przypisanego psychologa, pokaż listę dostępnych
      await this.showAvailablePsychologists(time);
    }
  }

  private async showAvailablePsychologists(time: string) {
    // Get available psychologists for this time slot
    if (this.selectedDate) {
      const psychologists = await this.psychologistService.getAvailablePsychologists(
        this.formatDateForAPI(this.selectedDate),
        time
      );
      this.availablePsychologists = psychologists;
      this.showPsychologistSelection = true;
    }
  }

  closePsychologistSelection() {
    this.showPsychologistSelection = false;
    this.availablePsychologists = [];
    this.selectedTime = null;
  }

  async selectPsychologist(psychologist: Psychologist) {
    if (!this.selectedDate || !this.selectedTime) return;

    try {
      const endTime = this.calculateEndTime(this.selectedTime, 60); // 60-minute session

      const appointmentId = await this.appointmentService.createAppointment({
        userId: this.userId,
        psychologistId: psychologist.id,
        date: this.selectedDate,
        startTime: this.selectedTime,
        endTime: endTime,
        status: 'scheduled',
        sessionType: 'online',
        createdAt: new Date()
      });

      this.closePsychologistSelection();
      this.generateCalendar(); // Refresh calendar
      this.appointmentCreated.emit();

      alert('Wizyta została umówiona pomyślnie!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Wystąpił błąd podczas umawiania wizyty.');
    }
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  getAppointmentTitle(appointment: Appointment): string {
    return `${appointment.startTime} - ${appointment.endTime} (${this.getStatusText(appointment.status)})`;
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

  formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async getPsychologistName(psychologistId: string): Promise<string> {
    try {
      const psychologist = await this.psychologistService.getPsychologistById(psychologistId);
      return psychologist ? `${psychologist.firstName} ${psychologist.lastName}` : 'Nieznany psycholog';
    } catch (error) {
      return 'Nieznany psycholog';
    }
  }

  sendMessage(appointment: Appointment) {
    // Implement message functionality
    console.log('Send message for appointment:', appointment.id);
  }

  rescheduleAppointment(appointment: Appointment) {
    // Implement reschedule functionality
    console.log('Reschedule appointment:', appointment.id);
  }

  async cancelAppointment(appointment: Appointment) {
    const reason = prompt('Podaj powód anulowania wizyty:');
    if (reason) {
      try {
        await this.appointmentService.cancelAppointment(appointment.id, reason, this.userId);
        this.generateCalendar(); // Refresh calendar
        this.closeModal();
        alert('Wizyta została anulowana.');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Wystąpił błąd podczas anulowania wizyty.');
      }
    }
  }
}
