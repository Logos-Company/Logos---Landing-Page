export type UserRole = 'admin' | 'moderator' | 'psychologist' | 'user';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
    loginMethod?: 'email' | 'google';

    // User-specific fields
    assignedPsychologistId?: string;
    activePackageId?: string;
    packageId?: string;
    packagePurchaseDate?: Date;
    packageStatus?: 'active' | 'inactive' | 'credit' | 'paid';
    creditBalance?: number;
    sessionsUsed?: number;
    totalSessions?: number;

    // Psychologist-specific fields (when role is 'psychologist')
    specializations?: string[];
    description?: string;
    experience?: number;
    education?: string;
    languages?: string[];
    rating?: number;
    reviewCount?: number;
    hourlyRate?: number;
    isAvailable?: boolean;
    workingHours?: WorkingHours;
    profileImage?: string;
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

export interface Package {
    id: string;
    name: string;
    description: string;
    sessionsCount: number;
    remainingCredits?: number;
    price: number;
    duration: number; // days
    features: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface Review {
    id: string;
    userId: string;
    psychologistId: string;
    rating: number;
    comment?: string;
    isAnonymous: boolean;
    createdAt: Date;
    sessionCount: number; // How many sessions user had before leaving this review
}