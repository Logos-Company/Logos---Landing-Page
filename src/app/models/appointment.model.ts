export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
    id: string;
    userId: string;
    psychologistId: string;
    psychologistName?: string;
    userEmail?: string;
    date: Date;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    status: AppointmentStatus;
    notes?: string;
    psychologistNotes?: string;
    userNotes?: string;
    createdAt: Date;
    updatedAt?: Date;
    cancellationReason?: string;
    cancellationDate?: Date;
    reminderSent?: boolean;
    sessionType?: 'online' | 'in-person';
    meetingLink?: string;
    meetingUrl?: string;
    meetingPlatform?: 'google-meet' | 'teams' | 'zoom' | 'custom';
}

export interface AppointmentMessage {
    id: string;
    appointmentId: string;
    senderId: string;
    senderType: 'user' | 'psychologist';
    message: string;
    createdAt: Date;
    isRead: boolean;
}

export interface TimeSlotAvailability {
    date: string; // YYYY-MM-DD format
    time: string; // HH:MM format
    psychologistId: string;
    isAvailable: boolean;
    appointmentId?: string;
}