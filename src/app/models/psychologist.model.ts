export interface Psychologist {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specializations: string[];
    description: string;
    experience: number; // years
    education: string;
    languages: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    pricePerSession?: number;
    completedSessions?: number;
    totalRevenue?: number;
    isAvailable: boolean;
    workingHours: WorkingHours;
    profileImage?: string;
    createdAt: Date;
    updatedAt?: Date;
    totalSessions?: number;
    isActive: boolean;
    
    // Admin fields
    verificationStatus?: 'pending' | 'verified' | 'suspended';
    licenseNumber?: string;
    sessionsThisMonth?: number;
    lastSessionDate?: Date;
    certificates?: string[];
    role?: string; // For getUserInitials compatibility
}

export interface WorkingHours {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
}

export interface TimeSlot {
    start: string; // HH:MM format
    end: string;   // HH:MM format
}

export interface PsychologistNote {
    id: string;
    psychologistId: string;
    userId: string;
    appointmentId?: string;
    title: string;
    content: string;
    isVisibleToUser: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface PsychologistStats {
    totalSessions: number;
    totalRevenue: number;
    averageRating: number;
    activeClients: number;
    thisMonthSessions: number;
    thisMonthRevenue: number;
    upcomingAppointments: number;
}