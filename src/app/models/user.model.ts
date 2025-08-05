export type UserRole = 'admin' | 'moderator' | 'psychologist' | 'user';
export type AssignmentStatus = 'pending' | 'approved' | 'rejected';

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
    assignmentStatus?: AssignmentStatus;
    assignmentRequestedAt?: Date;
    assignmentApprovedAt?: Date;
    activePackageId?: string;
    packageId?: string;
    packagePurchaseDate?: Date;
    packageStatus?: 'active' | 'inactive' | 'credit' | 'paid';
    creditBalance?: number;
    sessionsUsed?: number;
    totalSessions?: number;
    profileData?: UserProfileData;

    // Psychologist-specific fields (when role is 'psychologist')
    specializations?: string[];
    description?: string;
    bio?: string;
    experience?: number;
    education?: string;
    languages?: string[];
    rating?: number;
    reviewCount?: number;
    hourlyRate?: number;
    pricePerSession?: number;
    isAvailable?: boolean;
    workingHours?: WorkingHours;
    profileImage?: string;
    licenseNumber?: string;
    verificationStatus?: 'pending' | 'verified' | 'suspended' | 'rejected';
    sessionsThisMonth?: number;
    lastSessionDate?: Date;
    premiumListing?: boolean;
    premiumListingExpiry?: Date;
    completedSessions?: number;
    totalRevenue?: number;

    // Moderator-specific fields (when role is 'moderator')
    permissions?: string[];
    isOnline?: boolean;
    lastActivity?: Date;
    moderatedToday?: number;
    performanceScore?: number;
}

export interface UserProfileData {
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    birthDate?: Date;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    medicalHistory?: string;
    currentMedications?: string;
    previousTherapy?: boolean;
    goals?: string;
    preferences?: {
        sessionType: 'online' | 'in-person' | 'both';
        language: string;
        gender: 'male' | 'female' | 'no-preference';
        specialization?: string[];
    };
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
    status?: 'pending' | 'approved' | 'rejected';
    isVisible?: boolean;
    helpfulVotes?: number;
    wouldRecommend?: boolean;
    appointmentId?: string;
}

export interface UserStats {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    upcomingAppointments: number;
    currentPsychologist?: string;
    totalSpent: number;
    averageSessionRating?: number;
    sessionsThisMonth: number;
    nextAppointment?: Date;
}

export interface PsychologistChangeRequest {
    id: string;
    userId: string;
    currentPsychologistId?: string;
    requestedPsychologistId: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    reviewNotes?: string;
    urgency: 'low' | 'medium' | 'high';
}