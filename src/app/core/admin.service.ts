import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    onSnapshot,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Psychologist } from '../models/psychologist.model';
import { Review, ReviewStats } from '../models/review.model';
import { Contract, ContractTemplate, GeneratedContract } from '../models/contract.model';
import { Notification, NotificationTemplate, NotificationStats } from '../models/notification.model';
import { Report, ReportParameters, SystemHealth } from '../models/report.model';
import { CrmIntegration, CrmContact, CrmSyncResult } from '../models/crm.model';
import { SystemUpgrade, SystemConfiguration, BackupInfo } from '../models/system.model';

// Initialize Firebase
const app = initializeApp(environment.firebase);
const db = getFirestore(app);

export type { Review } from '../models/review.model';

export interface AdminStats {
    totalUsers: number;
    newUsersToday: number;
    activePsychologists: number;
    pendingPsychologists: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    monthlySessions: number;
    sessionsGrowth: number;
    visitorsToday: number;
    conversionRate: number;
    activeUsers: number;
    totalReviews: number;
    avgRating: number;
}

export interface SystemActivity {
    id: string;
    type: 'user-registered' | 'payment-received' | 'session-completed' | 'psychologist-approved' | 'error' | 'maintenance' | 'review-added' | 'user-blocked';
    message: string;
    timestamp: Date;
    userId?: string;
    psychologistId?: string;
    metadata?: any;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModeratorPermissions {
    canModerateReviews: boolean;
    canBlockUsers: boolean;
    canApprovePsychologists: boolean;
    canViewReports: boolean;
    canSendNotifications: boolean;
    canExportData: boolean;
    canViewAnalytics: boolean;
    canManageContracts: boolean;
}

export interface CrmStats {
    syncedContacts: number;
    newLeads: number;
    lastSync: Date;
    pendingSync: number;
    failedSync: number;
    totalRevenue: number;
}

export interface LiveAnalytics {
    currentVisitors: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: { page: string; views: number }[];
    userActions: {
        clicks: number;
        formSubmissions: number;
        buttonClicks: number;
    };
    realTimeEvents: {
        timestamp: Date;
        event: string;
        userId?: string;
        page: string;
        metadata?: any;
    }[];
}

export interface NotificationData {
    type: 'push' | 'email' | 'sms' | 'in-app';
    title: string;
    message: string;
    recipients: string[] | 'all';
    scheduled?: Date;
    metadata?: any;
}

export interface ContractField {
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    label: string;
    required: boolean;
    options?: string[];
    defaultValue?: any;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private statsSubject = new BehaviorSubject<AdminStats>({
        totalUsers: 1250,
        newUsersToday: 12,
        activePsychologists: 45,
        pendingPsychologists: 3,
        monthlyRevenue: 125000,
        revenueGrowth: 15.5,
        monthlySessions: 890,
        sessionsGrowth: 8.2,
        visitorsToday: 234,
        conversionRate: 3.6,
        activeUsers: 856,
        totalReviews: 423,
        avgRating: 4.6
    });

    constructor(private http: HttpClient) { }

    // =================
    // FIREBASE METHODS
    // =================

    // Real-time Dashboard Stats
    async getStatsFromFirebase(): Promise<AdminStats> {
        try {
            const [users, psychologists, appointments, reviews] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'psychologists')),
                getDocs(collection(db, 'appointments')),
                getDocs(collection(db, 'reviews'))
            ]);

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const allUsers = users.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            const allPsychologists = psychologists.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            const allAppointments = appointments.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            const allReviews = reviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

            const newUsersToday = allUsers.filter((user: any) =>
                user.createdAt && user.createdAt.toDate() >= startOfDay
            ).length;

            const activeUsers = allUsers.filter((user: any) => user.isActive).length;
            const activePsychologists = allPsychologists.filter((p: any) => p.isActive).length;
            const pendingPsychologists = allPsychologists.filter((p: any) => !p.isVerified).length;

            const monthlyAppointments = allAppointments.filter((apt: any) =>
                apt.createdAt && apt.createdAt.toDate() >= startOfMonth
            );

            const monthlyRevenue = monthlyAppointments
                .filter((apt: any) => apt.status === 'completed')
                .reduce((sum: number, apt: any) => sum + (apt.price || 0), 0);

            const avgRating = allReviews.length > 0
                ? allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / allReviews.length
                : 0;

            const stats: AdminStats = {
                totalUsers: allUsers.length,
                newUsersToday,
                activePsychologists,
                pendingPsychologists,
                monthlyRevenue,
                revenueGrowth: 15.5, // Calculate based on previous month
                monthlySessions: monthlyAppointments.filter((apt: any) => apt.status === 'completed').length,
                sessionsGrowth: 8.2, // Calculate based on previous month
                visitorsToday: 234, // From PostHog
                conversionRate: 3.6, // Calculate based on registrations vs visitors
                activeUsers,
                totalReviews: allReviews.length,
                avgRating
            };

            this.statsSubject.next(stats);
            return stats;
        } catch (error) {
            console.error('Error fetching stats from Firebase:', error);
            return this.statsSubject.value;
        }
    }

    // Activity Logging
    async logActivityToFirebase(activity: Omit<SystemActivity, 'id' | 'timestamp'>): Promise<void> {
        try {
            await addDoc(collection(db, 'system_activities'), {
                ...activity,
                timestamp: Timestamp.now(),
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    async getRecentActivityFromFirebase(limitNum: number = 20): Promise<SystemActivity[]> {
        try {
            const q = query(
                collection(db, 'system_activities'),
                orderBy('timestamp', 'desc'),
                limit(limitNum)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data['timestamp']?.toDate()
                };
            }) as SystemActivity[];
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }

    // User Management
    async getAllUsersFromFirebase(filters?: any): Promise<any[]> {
        try {
            let queryRef;

            if (filters?.role) {
                queryRef = query(collection(db, 'users'), where('role', '==', filters.role));
            } else {
                queryRef = collection(db, 'users');
            }

            const querySnapshot = await getDocs(queryRef);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data['createdAt']?.toDate(),
                    updatedAt: data['updatedAt']?.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async updateUserRoleInFirebase(userId: string, newRole: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole,
                updatedAt: Timestamp.now()
            });

            await this.logActivityToFirebase({
                type: 'user-registered',
                message: `Zmieniono rolę użytkownika na ${newRole}`,
                userId,
                severity: 'medium'
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    async toggleUserStatusInFirebase(userId: string, isActive: boolean): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isActive,
                updatedAt: Timestamp.now()
            });

            await this.logActivityToFirebase({
                type: isActive ? 'user-registered' : 'user-blocked',
                message: `${isActive ? 'Aktywowano' : 'Dezaktywowano'} użytkownika`,
                userId,
                severity: isActive ? 'low' : 'medium'
            });
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    }

    async createModeratorInFirebase(userData: any, permissions: ModeratorPermissions): Promise<void> {
        try {
            const batch = writeBatch(db);

            // Create user with moderator role
            const userRef = doc(collection(db, 'users'));
            batch.set(userRef, {
                ...userData,
                role: 'moderator',
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Create moderator permissions
            const permissionsRef = doc(collection(db, 'moderator_permissions'));
            batch.set(permissionsRef, {
                userId: userRef.id,
                ...permissions,
                createdAt: Timestamp.now()
            });

            await batch.commit();

            await this.logActivityToFirebase({
                type: 'user-registered',
                message: `Utworzono konto moderatora: ${userData.firstName} ${userData.lastName}`,
                userId: userRef.id,
                severity: 'medium'
            });
        } catch (error) {
            console.error('Error creating moderator:', error);
            throw error;
        }
    }

    // Review Management
    async getAllReviewsFromFirebase(): Promise<Review[]> {
        try {
            const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const reviews = [];
            for (const docSnapshot of querySnapshot.docs) {
                const reviewData = docSnapshot.data();

                // Get user and psychologist info
                const [userDoc, psychologistDoc] = await Promise.all([
                    getDoc(doc(db, 'users', reviewData['userId'])),
                    getDoc(doc(db, 'users', reviewData['psychologistId']))
                ]);

                const review: Review = {
                    id: docSnapshot.id,
                    userId: reviewData['userId'],
                    psychologistId: reviewData['psychologistId'],
                    rating: reviewData['rating'],
                    comment: reviewData['comment'],
                    status: reviewData['status'],
                    createdAt: reviewData['createdAt']?.toDate(),
                    moderatedAt: reviewData['moderatedAt']?.toDate(),
                    moderatorId: reviewData['moderatorId'],
                    moderationNote: reviewData['moderationNote']
                };

                reviews.push(review);
            }

            return reviews;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async moderateReviewInFirebase(reviewId: string, action: 'approve' | 'reject' | 'flag', moderatorId: string, reason?: string): Promise<void> {
        try {
            const reviewRef = doc(db, 'reviews', reviewId);
            const updateData: any = {
                status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
                moderatedAt: Timestamp.now(),
                moderatorId,
                updatedAt: Timestamp.now()
            };

            if (reason) {
                updateData.flagReason = reason;
            }

            await updateDoc(reviewRef, updateData);

            await this.logActivityToFirebase({
                type: 'review-added',
                message: `${action === 'approve' ? 'Zatwierdzono' : action === 'reject' ? 'Odrzucono' : 'Oflagowano'} opinię`,
                metadata: { reviewId, action, reason },
                severity: 'low'
            });
        } catch (error) {
            console.error('Error moderating review:', error);
            throw error;
        }
    }

    // Psychologist Management from Users collection
    async getPsychologistsFromUsers(): Promise<User[]> {
        try {
            console.log('🔍 getPsychologistsFromUsers: Fetching all users...');
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);

            console.log('📊 Total users found:', querySnapshot.docs.length);

            const psychologists: User[] = [];
            querySnapshot.docs.forEach(doc => {
                const userData = doc.data();
                console.log('👤 User:', doc.id, 'Role:', userData['role']);
                
                if (userData['role'] === 'psychologist') {
                    psychologists.push({
                        id: doc.id,
                        ...userData,
                        createdAt: userData['createdAt']?.toDate() || new Date(),
                        updatedAt: userData['updatedAt']?.toDate() || new Date()
                    } as User);
                }
            });

            console.log('👨‍⚕️ Psychologists found:', psychologists.length);
            console.log('Psychologists:', psychologists);
            return psychologists;
        } catch (error) {
            console.error('Error fetching psychologists from users:', error);
            return [];
        }
    }

    // Psychologist Management from Psychologists collection
    async getAllPsychologistsWithDetails(): Promise<any[]> {
        try {
            const psychologistsRef = collection(db, 'psychologists');
            const querySnapshot = await getDocs(psychologistsRef);

            const psychologists = [];
            for (const docSnapshot of querySnapshot.docs) {
                const psychData = docSnapshot.data();

                // Get appointments and reviews for this psychologist
                const [appointmentsSnapshot, reviewsSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'appointments'), where('psychologistId', '==', docSnapshot.id))),
                    getDocs(query(collection(db, 'reviews'), where('psychologistId', '==', docSnapshot.id)))
                ]);

                const completedSessions = appointmentsSnapshot.docs.filter(
                    doc => doc.data()['status'] === 'completed'
                ).length;

                const totalRevenue = appointmentsSnapshot.docs
                    .filter(doc => doc.data()['status'] === 'completed')
                    .reduce((sum, doc) => sum + (doc.data()['price'] || 0), 0);

                const rating = reviewsSnapshot.docs.length > 0
                    ? reviewsSnapshot.docs.reduce((sum, doc) => sum + doc.data()['rating'], 0) / reviewsSnapshot.docs.length
                    : 0;

                psychologists.push({
                    id: docSnapshot.id,
                    ...psychData,
                    completedSessions,
                    totalRevenue,
                    rating,
                    reviewCount: reviewsSnapshot.docs.length,
                    createdAt: psychData['createdAt']?.toDate(),
                    updatedAt: psychData['updatedAt']?.toDate()
                });
            }

            return psychologists;
        } catch (error) {
            console.error('Error fetching psychologists:', error);
            return [];
        }
    }

    // Contract Templates
    async getContractTemplatesFromFirebase(): Promise<ContractTemplate[]> {
        try {
            const q = query(collection(db, 'contract_templates'), where('isActive', '==', true));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data['name'] || '',
                    type: data['type'] || '',
                    content: data['content'] || '',
                    fields: data['fields'] || [],
                    isActive: data['isActive'] || false
                } as ContractTemplate;
            });
        } catch (error) {
            console.error('Error fetching contract templates:', error);
            return [];
        }
    }

    // Seed sample psychologists data
    async seedSamplePsychologists(): Promise<void> {
        try {
            const samplePsychologists = [
                {
                    firstName: 'Anna',
                    lastName: 'Kowalska',
                    email: 'anna.kowalska@logos.com',
                    phone: '+48 123 456 789',
                    specializations: ['Terapia kognitywno-behawioralna', 'Terapia par', 'Leczenie depresji'],
                    description: 'Doświadczony psycholog z 8-letnim stażem w terapii kognitywno-behawioralnej.',
                    experience: 8,
                    education: 'Uniwersytet Warszawski - Psychologia',
                    languages: ['Polski', 'Angielski'],
                    hourlyRate: 180,
                    pricePerSession: 180,
                    isAvailable: true,
                    isActive: true,
                    verificationStatus: 'verified',
                    licenseNumber: 'PSY-2024-001',
                    rating: 4.8,
                    reviewCount: 45,
                    totalSessions: 120,
                    sessionsThisMonth: 18,
                    lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    profileImage: '',
                    workingHours: {
                        monday: [{ start: '09:00', end: '17:00' }],
                        tuesday: [{ start: '09:00', end: '17:00' }],
                        wednesday: [{ start: '09:00', end: '17:00' }],
                        thursday: [{ start: '09:00', end: '17:00' }],
                        friday: [{ start: '09:00', end: '15:00' }],
                        saturday: [],
                        sunday: []
                    },
                    certificates: ['CBT Certificate', 'Couples Therapy Certificate']
                },
                {
                    firstName: 'Marcin',
                    lastName: 'Nowak',
                    email: 'marcin.nowak@logos.com',
                    phone: '+48 987 654 321',
                    specializations: ['Psychoterapia psychodynamiczna', 'Terapia uzależnień', 'Konsultacje psychiatryczne'],
                    description: 'Specjalista w dziedzinie psychoterapii psychodynamicznej i leczenia uzależnień.',
                    experience: 12,
                    education: 'Uniwersytet Jagielloński - Psychologia Kliniczna',
                    languages: ['Polski', 'Niemiecki', 'Angielski'],
                    hourlyRate: 220,
                    pricePerSession: 220,
                    isAvailable: true,
                    isActive: true,
                    verificationStatus: 'verified',
                    licenseNumber: 'PSY-2024-002',
                    rating: 4.9,
                    reviewCount: 78,
                    totalSessions: 205,
                    sessionsThisMonth: 25,
                    lastSessionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    profileImage: '',
                    workingHours: {
                        monday: [{ start: '10:00', end: '18:00' }],
                        tuesday: [{ start: '10:00', end: '18:00' }],
                        wednesday: [{ start: '10:00', end: '18:00' }],
                        thursday: [{ start: '10:00', end: '18:00' }],
                        friday: [{ start: '10:00', end: '16:00' }],
                        saturday: [{ start: '09:00', end: '13:00' }],
                        sunday: []
                    },
                    certificates: ['Psychodynamic Therapy Certificate', 'Addiction Treatment Specialist']
                },
                {
                    firstName: 'Katarzyna',
                    lastName: 'Wiśniewska',
                    email: 'katarzyna.wisniewska@logos.com',
                    phone: '+48 555 777 999',
                    specializations: ['Terapia dzieci i młodzieży', 'ADHD', 'Terapia rodzinna'],
                    description: 'Psycholog dziecięcy z doświadczeniem w pracy z ADHD i problemami rozwojowymi.',
                    experience: 6,
                    education: 'SWPS Uniwersytet Humanistycznospołeczny - Psychologia Dziecięca',
                    languages: ['Polski', 'Angielski'],
                    hourlyRate: 160,
                    pricePerSession: 160,
                    isAvailable: true,
                    isActive: false,
                    verificationStatus: 'pending',
                    licenseNumber: 'PSY-2024-003',
                    rating: 4.6,
                    reviewCount: 32,
                    totalSessions: 85,
                    sessionsThisMonth: 12,
                    lastSessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    profileImage: '',
                    workingHours: {
                        monday: [{ start: '14:00', end: '20:00' }],
                        tuesday: [{ start: '14:00', end: '20:00' }],
                        wednesday: [{ start: '14:00', end: '20:00' }],
                        thursday: [{ start: '14:00', end: '20:00' }],
                        friday: [{ start: '14:00', end: '18:00' }],
                        saturday: [],
                        sunday: []
                    },
                    certificates: ['Child Psychology Certificate', 'ADHD Specialist']
                },
                {
                    firstName: 'Piotr',
                    lastName: 'Kaczmarek',
                    email: 'piotr.kaczmarek@logos.com',
                    phone: '+48 111 222 333',
                    specializations: ['Terapia lęków', 'Mindfulness', 'Stress management'],
                    description: 'Specjalista w dziedzinie terapii lęków i technik mindfulness.',
                    experience: 4,
                    education: 'Uniwersytet Gdański - Psychologia Kliniczna',
                    languages: ['Polski', 'Angielski', 'Hiszpański'],
                    hourlyRate: 140,
                    pricePerSession: 140,
                    isAvailable: true,
                    isActive: true,
                    verificationStatus: 'suspended',
                    licenseNumber: 'PSY-2024-004',
                    rating: 4.3,
                    reviewCount: 18,
                    totalSessions: 42,
                    sessionsThisMonth: 6,
                    lastSessionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    profileImage: '',
                    workingHours: {
                        monday: [{ start: '08:00', end: '16:00' }],
                        tuesday: [{ start: '08:00', end: '16:00' }],
                        wednesday: [{ start: '08:00', end: '16:00' }],
                        thursday: [{ start: '08:00', end: '16:00' }],
                        friday: [{ start: '08:00', end: '14:00' }],
                        saturday: [],
                        sunday: []
                    },
                    certificates: ['Anxiety Disorders Certificate', 'Mindfulness Instructor']
                }
            ];

            const batch = writeBatch(db);
            
            for (const psychologist of samplePsychologists) {
                const docRef = doc(collection(db, 'psychologists'));
                batch.set(docRef, {
                    ...psychologist,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    lastSessionDate: psychologist.lastSessionDate ? Timestamp.fromDate(psychologist.lastSessionDate) : null
                });
            }

            await batch.commit();
            console.log('Sample psychologists seeded successfully');
        } catch (error) {
            console.error('Error seeding psychologists:', error);
            throw error;
        }
    }

    // Seed sample psychologists as users (in users collection)
    async seedPsychologistsAsUsers(): Promise<void> {
        try {
            const sampleUsers = [
                {
                    firstName: 'Anna',
                    lastName: 'Kowalska',
                    email: 'anna.kowalska@logos.com',
                    phone: '+48 123 456 789',
                    role: 'psychologist',
                    bio: 'Doświadczony psycholog z 8-letnim stażem w terapii kognitywno-behawioralnej.',
                    isActive: true,
                    verificationStatus: 'verified',
                    licenseNumber: 'PSY-2024-001',
                    specializations: ['Terapia kognitywno-behawioralna', 'Terapia par']
                },
                {
                    firstName: 'Marcin',
                    lastName: 'Nowak',
                    email: 'marcin.nowak@logos.com',
                    phone: '+48 987 654 321',
                    role: 'psychologist',
                    bio: 'Specjalista w dziedzinie psychoterapii psychodynamicznej i leczenia uzależnień.',
                    isActive: true,
                    verificationStatus: 'verified',
                    licenseNumber: 'PSY-2024-002',
                    specializations: ['Psychoterapia psychodynamiczna', 'Terapia uzależnień']
                },
                {
                    firstName: 'Katarzyna',
                    lastName: 'Wiśniewska',
                    email: 'katarzyna.wisniewska@logos.com',
                    phone: '+48 555 777 999',
                    role: 'psychologist',
                    bio: 'Psycholog dziecięcy z doświadczeniem w pracy z ADHD i problemami rozwojowymi.',
                    isActive: false,
                    verificationStatus: 'pending',
                    licenseNumber: 'PSY-2024-003',
                    specializations: ['Terapia dzieci i młodzieży', 'ADHD']
                }
            ];

            const batch = writeBatch(db);
            
            for (const user of sampleUsers) {
                const docRef = doc(collection(db, 'users'));
                batch.set(docRef, {
                    ...user,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }

            await batch.commit();
            console.log('Sample psychologist users seeded successfully');
        } catch (error) {
            console.error('Error seeding psychologist users:', error);
            throw error;
        }
    }

    async saveContractTemplateToFirebase(template: Omit<ContractTemplate, 'id'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'contract_templates'), {
                ...template,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            await this.logActivityToFirebase({
                type: 'maintenance',
                message: `Utworzono nowy szablon umowy: ${template.name}`,
                severity: 'low'
            });

            return docRef.id;
        } catch (error) {
            console.error('Error saving contract template:', error);
            throw error;
        }
    }

    // Notifications
    async sendNotificationToFirebase(notification: NotificationData): Promise<void> {
        try {
            await addDoc(collection(db, 'notifications'), {
                ...notification,
                status: 'pending',
                createdAt: Timestamp.now(),
                sentAt: notification.scheduled ? Timestamp.fromDate(notification.scheduled) : Timestamp.now()
            });

            await this.logActivityToFirebase({
                type: 'maintenance',
                message: `Wysłano powiadomienie: ${notification.title}`,
                severity: 'low'
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    // Real-time Analytics from PostHog
    async getLiveAnalytics(): Promise<LiveAnalytics> {
        try {
            // In real implementation, this would connect to PostHog API
            return {
                currentVisitors: Math.floor(Math.random() * 50) + 10,
                pageViews: Math.floor(Math.random() * 1000) + 500,
                uniqueVisitors: Math.floor(Math.random() * 800) + 300,
                bounceRate: 35 + Math.random() * 20,
                avgSessionDuration: 180 + Math.random() * 120,
                topPages: [
                    { page: '/home', views: 245 },
                    { page: '/psychologists', views: 189 },
                    { page: '/register', views: 156 },
                    { page: '/login', views: 134 },
                    { page: '/contact', views: 98 }
                ],
                userActions: {
                    clicks: Math.floor(Math.random() * 500) + 200,
                    formSubmissions: Math.floor(Math.random() * 50) + 10,
                    buttonClicks: Math.floor(Math.random() * 300) + 100
                },
                realTimeEvents: [
                    {
                        timestamp: new Date(),
                        event: 'page_view',
                        page: '/psychologists',
                        metadata: { source: 'organic' }
                    },
                    {
                        timestamp: new Date(Date.now() - 30000),
                        event: 'button_click',
                        page: '/register',
                        metadata: { button: 'register_submit' }
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching live analytics:', error);
            throw error;
        }
    }

    // =================
    // LEGACY METHODS (Updated to use Firebase)
    // =================

    // Stats Methods
    getStats(): Observable<AdminStats> {
        return this.statsSubject.asObservable();
    }

    async refreshStats(): Promise<AdminStats> {
        return await this.getStatsFromFirebase();
    }

    // Activity Methods
    async getRecentActivity(limitNum: number = 20): Promise<SystemActivity[]> {
        return await this.getRecentActivityFromFirebase(limitNum);
    }

    async logActivity(activity: Omit<SystemActivity, 'id' | 'timestamp'>): Promise<void> {
        return await this.logActivityToFirebase(activity);
    }

    // User Management Methods
    async getAllUsers(filters?: any): Promise<any[]> {
        return await this.getAllUsersFromFirebase(filters);
    }

    async updateUserRole(userId: string, newRole: string): Promise<void> {
        return await this.updateUserRoleInFirebase(userId, newRole);
    }

    async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
        return await this.toggleUserStatusInFirebase(userId, isActive);
    }

    async createModerator(userData: any, permissions: ModeratorPermissions): Promise<void> {
        return await this.createModeratorInFirebase(userData, permissions);
    }

    // CRM Integration Methods
    async getCrmStats(): Promise<CrmStats> {
        return {
            syncedContacts: 1245,
            newLeads: 23,
            lastSync: new Date(),
            pendingSync: 5,
            failedSync: 1,
            totalRevenue: 125000
        };
    }

    async syncWithLivespace(): Promise<void> {
        console.log('Sync with Livespace CRM');
    }

    async importContactsFromCrm(): Promise<any[]> {
        return [];
    }

    async exportContactsToCrm(userIds: string[]): Promise<void> {
        console.log('Export contacts to CRM:', userIds);
    }

    // PostHog Integration Methods
    async syncWithPostHog(): Promise<void> {
        console.log('Sync with PostHog');
    }

    // Export Methods
    async exportUsersToExcel(): Promise<Blob> {
        console.log('Export users to Excel');
        return new Blob(['Mock Excel content'], { type: 'application/vnd.ms-excel' });
    }

    async exportAnalyticsData(timeRange: string): Promise<Blob> {
        console.log('Export analytics data:', timeRange);
        return new Blob(['Mock analytics data'], { type: 'application/vnd.ms-excel' });
    }

    // Financial Methods
    async getFinancialReport(startDate: Date, endDate: Date): Promise<any> {
        return {
            totalRevenue: 125000,
            paymentCount: 450,
            averagePayment: 278,
            payments: []
        };
    }

    // Moderator Management
    async getModeratorPermissions(): Promise<string[]> {
        return [
            'moderate_reviews',
            'block_users',
            'approve_psychologists',
            'manage_content',
            'view_reports',
            'send_notifications'
        ];
    }

    async updateModeratorPermissions(userId: string, permissions: string[]): Promise<void> {
        console.log('Update moderator permissions:', { userId, permissions });
    }

    // ==================
    // CRM INTEGRATION
    // ==================

    async getCrmIntegrations(): Promise<CrmIntegration[]> {
        try {
            const snapshot = await getDocs(collection(db, 'crm_integrations'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CrmIntegration[];
        } catch (error) {
            console.error('Error getting CRM integrations:', error);
            return [];
        }
    }

    async syncWithCrm(integrationId: string): Promise<CrmSyncResult> {
        try {
            // Simulate CRM sync
            await new Promise(resolve => setTimeout(resolve, 2000));

            const result: CrmSyncResult = {
                success: true,
                imported: Math.floor(Math.random() * 50 + 10),
                exported: Math.floor(Math.random() * 30 + 5),
                failed: Math.floor(Math.random() * 3),
                errors: [],
                timestamp: new Date()
            };

            // Save sync result to Firebase
            await addDoc(collection(db, 'crm_sync_results'), {
                integrationId,
                ...result,
                timestamp: Timestamp.fromDate(result.timestamp)
            });

            return result;
        } catch (error) {
            console.error('Error syncing with CRM:', error);
            return {
                success: false,
                imported: 0,
                exported: 0,
                failed: 1,
                errors: ['Sync failed'],
                timestamp: new Date()
            };
        }
    }

    async getCrmContacts(): Promise<CrmContact[]> {
        try {
            const snapshot = await getDocs(collection(db, 'crm_contacts'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastActivity: doc.data()['lastActivity']?.toDate()
            })) as CrmContact[];
        } catch (error) {
            console.error('Error getting CRM contacts:', error);
            return [];
        }
    }

    // ==================
    // CONTRACT MANAGEMENT
    // ==================

    async getContractTemplates(): Promise<ContractTemplate[]> {
        try {
            const snapshot = await getDocs(collection(db, 'contract_templates'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContractTemplate[];
        } catch (error) {
            console.error('Error getting contract templates:', error);
            return this.getDefaultContractTemplates();
        }
    }

    private getDefaultContractTemplates(): ContractTemplate[] {
        return [
            {
                id: 'standard',
                name: 'Umowa standardowa',
                type: 'standard',
                content: 'Szablon umowy standardowej...',
                fields: [
                    { id: '1', name: 'clientName', type: 'text', label: 'Imię i nazwisko klienta', required: true },
                    { id: '2', name: 'clientPesel', type: 'text', label: 'PESEL', required: true },
                    { id: '3', name: 'sessionCount', type: 'number', label: 'Liczba sesji', required: true, defaultValue: 1 },
                    { id: '4', name: 'totalPrice', type: 'number', label: 'Cena całkowita', required: true }
                ],
                isActive: true
            },
            {
                id: 'credit',
                name: 'Umowa kredytowa',
                type: 'credit',
                content: 'Szablon umowy kredytowej...',
                fields: [
                    { id: '1', name: 'clientName', type: 'text', label: 'Imię i nazwisko klienta', required: true },
                    { id: '2', name: 'clientPesel', type: 'text', label: 'PESEL', required: true },
                    { id: '3', name: 'creditAmount', type: 'number', label: 'Kwota kredytu', required: true },
                    { id: '4', name: 'installments', type: 'number', label: 'Liczba rat', required: true },
                    { id: '5', name: 'interestRate', type: 'number', label: 'Oprocentowanie (%)', required: true }
                ],
                isActive: true
            },
            {
                id: 'corporate',
                name: 'Umowa B2B',
                type: 'corporate',
                content: 'Szablon umowy B2B...',
                fields: [
                    { id: '1', name: 'companyName', type: 'text', label: 'Nazwa firmy', required: true },
                    { id: '2', name: 'nip', type: 'text', label: 'NIP', required: true },
                    { id: '3', name: 'contactPerson', type: 'text', label: 'Osoba kontaktowa', required: true },
                    { id: '4', name: 'employeeCount', type: 'number', label: 'Liczba pracowników', required: true },
                    { id: '5', name: 'discountRate', type: 'number', label: 'Rabat (%)', required: false, defaultValue: 0 }
                ],
                isActive: true
            }
        ];
    }

    async saveContractTemplate(template: ContractTemplate): Promise<void> {
        try {
            if (template.id) {
                await updateDoc(doc(db, 'contract_templates', template.id), {
                    ...template,
                    updatedAt: Timestamp.fromDate(new Date())
                });
            } else {
                await addDoc(collection(db, 'contract_templates'), {
                    ...template,
                    createdAt: Timestamp.fromDate(new Date()),
                    updatedAt: Timestamp.fromDate(new Date())
                });
            }
        } catch (error) {
            console.error('Error saving contract template:', error);
            throw error;
        }
    }

    async generateContract(templateId: string, data: any): Promise<GeneratedContract> {
        try {
            const contract: GeneratedContract = {
                id: `contract_${Date.now()}`,
                templateId,
                clientData: data,
                generatedContent: this.processContractTemplate(templateId, data),
                createdAt: new Date(),
                createdBy: 'admin', // Should come from auth
                status: 'generated'
            };

            await addDoc(collection(db, 'generated_contracts'), {
                ...contract,
                createdAt: Timestamp.fromDate(contract.createdAt)
            });

            return contract;
        } catch (error) {
            console.error('Error generating contract:', error);
            throw error;
        }
    }

    private processContractTemplate(templateId: string, data: any): string {
        // Simple template processing - in real app would use a proper template engine
        let content = `Umowa ${templateId}\n\n`;
        Object.keys(data).forEach(key => {
            content += `${key}: ${data[key]}\n`;
        });
        content += `\nData wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`;
        return content;
    }

    async generatePdfContract(templateId: string, data: any): Promise<Blob> {
        try {
            // In real implementation this would generate actual PDF
            const content = this.processContractTemplate(templateId, data);
            return new Blob([content], { type: 'application/pdf' });
        } catch (error) {
            console.error('Error generating PDF contract:', error);
            throw error;
        }
    }

    // ==================
    // NOTIFICATION MANAGEMENT
    // ==================

    async getNotifications(): Promise<Notification[]> {
        try {
            const snapshot = await getDocs(
                query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50))
            );
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()['createdAt']?.toDate(),
                scheduledAt: doc.data()['scheduledAt']?.toDate(),
                sentAt: doc.data()['sentAt']?.toDate()
            })) as Notification[];
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    }

    async sendNotification(notification: NotificationData): Promise<void> {
        try {
            const recipients = notification.recipients === 'all' ? ['all'] : notification.recipients;

            const notificationDoc: Notification = {
                id: '',
                title: notification.title,
                message: notification.message,
                type: notification.type,
                recipients: recipients,
                status: 'sent',
                createdAt: new Date(),
                sentAt: new Date(),
                createdBy: 'admin',
                scheduledAt: notification.scheduled,
                metadata: notification.metadata
            };

            await addDoc(collection(db, 'notifications'), {
                ...notificationDoc,
                createdAt: Timestamp.fromDate(notificationDoc.createdAt),
                sentAt: Timestamp.fromDate(notificationDoc.sentAt!)
            });

            // Simulate actual sending
            console.log('Notification sent:', notification);
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    async getNotificationTemplates(): Promise<NotificationTemplate[]> {
        try {
            const snapshot = await getDocs(collection(db, 'notification_templates'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NotificationTemplate[];
        } catch (error) {
            console.error('Error getting notification templates:', error);
            return this.getDefaultNotificationTemplates();
        }
    }

    private getDefaultNotificationTemplates(): NotificationTemplate[] {
        return [
            {
                id: 'maintenance',
                name: 'Przerwa techniczna',
                type: 'maintenance',
                title: 'Planowana przerwa techniczna',
                message: 'Informujemy o planowanej przerwie technicznej w dniach...',
                channels: ['push', 'email', 'in-app'],
                isActive: true
            },
            {
                id: 'update',
                name: 'Nowa funkcja',
                type: 'update',
                title: 'Nowe funkcje w aplikacji!',
                message: 'Sprawdź najnowsze możliwości naszej platformy...',
                channels: ['push', 'in-app'],
                isActive: true
            },
            {
                id: 'reminder',
                name: 'Przypomnienie o wizycie',
                type: 'reminder',
                title: 'Przypomnienie o nadchodzącej wizycie',
                message: 'Twoja wizyta jest zaplanowana na jutro o godzinie...',
                channels: ['push', 'sms', 'email'],
                isActive: true
            },
            {
                id: 'promotion',
                name: 'Promocja',
                type: 'promotion',
                title: 'Specjalna oferta!',
                message: 'Skorzystaj z promocji na pakiety sesji...',
                channels: ['push', 'email', 'in-app'],
                isActive: true
            }
        ];
    }

    // ==================
    // REPORTS MANAGEMENT
    // ==================

    async generateReport(type: string, parameters: ReportParameters): Promise<Report> {
        try {
            const report: Report = {
                id: `report_${Date.now()}`,
                name: `Raport ${type}`,
                type: type as any,
                parameters,
                data: await this.getReportData(type, parameters),
                generatedAt: new Date(),
                generatedBy: 'admin',
                format: 'excel',
                status: 'ready'
            };

            await addDoc(collection(db, 'reports'), {
                ...report,
                generatedAt: Timestamp.fromDate(report.generatedAt)
            });

            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    private async getReportData(type: string, parameters: ReportParameters): Promise<any> {
        // Simulate report data generation
        switch (type) {
            case 'user-activity':
                return {
                    totalUsers: 1250,
                    activeUsers: 856,
                    newRegistrations: 45,
                    userGrowth: 12.5
                };
            case 'revenue':
                return {
                    totalRevenue: 125000,
                    monthlyRevenue: 25000,
                    averageTransaction: 150,
                    revenueGrowth: 15.5
                };
            case 'sessions':
                return {
                    totalSessions: 890,
                    completedSessions: 834,
                    cancelledSessions: 56,
                    averageRating: 4.6
                };
            default:
                return {};
        }
    }

    async getSystemHealth(): Promise<SystemHealth> {
        try {
            // Simulate system health check
            return {
                database: {
                    status: 'healthy',
                    responseTime: Math.random() * 100 + 50,
                    lastChecked: new Date()
                },
                payments: {
                    status: 'healthy',
                    lastTransaction: new Date(Date.now() - Math.random() * 3600000),
                    failureRate: Math.random() * 2
                },
                email: {
                    status: Math.random() > 0.8 ? 'warning' : 'healthy',
                    queueLength: Math.floor(Math.random() * 10),
                    averageDelay: Math.random() * 120
                },
                storage: {
                    status: 'healthy',
                    usagePercentage: Math.random() * 30 + 60,
                    freeSpace: Math.random() * 100 + 25
                }
            };
        } catch (error) {
            console.error('Error getting system health:', error);
            throw error;
        }
    }

    // ==================
    // SYSTEM MANAGEMENT
    // ==================

    async getSystemUpgrades(): Promise<SystemUpgrade[]> {
        try {
            const snapshot = await getDocs(collection(db, 'system_upgrades'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                releaseDate: doc.data()['releaseDate']?.toDate(),
                installDate: doc.data()['installDate']?.toDate()
            })) as SystemUpgrade[];
        } catch (error) {
            console.error('Error getting system upgrades:', error);
            return this.getDefaultUpgrades();
        }
    }

    private getDefaultUpgrades(): SystemUpgrade[] {
        return [
            {
                id: 'upgrade_1',
                name: 'Integracja z PostHog Analytics',
                description: 'Dodanie zaawansowanej analityki użytkowników',
                version: '2.1.0',
                type: 'feature',
                status: 'available',
                releaseDate: new Date('2025-08-01'),
                requiredDowntime: 30,
                dependencies: [],
                rollbackAvailable: true,
                changelog: [
                    'Dodano real-time analytics',
                    'Integracja z PostHog',
                    'Nowe dashboardy analityczne'
                ]
            },
            {
                id: 'upgrade_2',
                name: 'Optymalizacja wydajności',
                description: 'Poprawa wydajności aplikacji',
                version: '2.0.5',
                type: 'performance',
                status: 'available',
                releaseDate: new Date('2025-07-25'),
                requiredDowntime: 15,
                dependencies: [],
                rollbackAvailable: true,
                changelog: [
                    'Optymalizacja bazy danych',
                    'Cache mechanizmy',
                    'Redukcja czasu ładowania'
                ]
            }
        ];
    }

    async installUpgrade(upgradeId: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'system_upgrades', upgradeId), {
                status: 'installing',
                installDate: Timestamp.fromDate(new Date())
            });

            // Simulate installation
            await new Promise(resolve => setTimeout(resolve, 5000));

            await updateDoc(doc(db, 'system_upgrades', upgradeId), {
                status: 'installed'
            });
        } catch (error) {
            console.error('Error installing upgrade:', error);
            throw error;
        }
    }

    async getSystemConfiguration(): Promise<SystemConfiguration[]> {
        try {
            const snapshot = await getDocs(collection(db, 'system_config'));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data()['updatedAt']?.toDate()
            })) as SystemConfiguration[];
        } catch (error) {
            console.error('Error getting system configuration:', error);
            return this.getDefaultConfiguration();
        }
    }

    private getDefaultConfiguration(): SystemConfiguration[] {
        return [
            {
                id: 'config_1',
                category: 'Email',
                key: 'smtp_server',
                value: 'smtp.gmail.com',
                type: 'string',
                description: 'Serwer SMTP do wysyłania emaili',
                isSecret: false,
                updatedAt: new Date(),
                updatedBy: 'admin'
            },
            {
                id: 'config_2',
                category: 'Payment',
                key: 'stripe_public_key',
                value: 'pk_test_...',
                type: 'string',
                description: 'Klucz publiczny Stripe',
                isSecret: false,
                updatedAt: new Date(),
                updatedBy: 'admin'
            },
            {
                id: 'config_3',
                category: 'Payment',
                key: 'stripe_secret_key',
                value: '***',
                type: 'string',
                description: 'Klucz prywatny Stripe',
                isSecret: true,
                updatedAt: new Date(),
                updatedBy: 'admin'
            }
        ];
    }

    async updateSystemConfiguration(config: SystemConfiguration): Promise<void> {
        try {
            await updateDoc(doc(db, 'system_config', config.id), {
                ...config,
                updatedAt: Timestamp.fromDate(new Date())
            });
        } catch (error) {
            console.error('Error updating system configuration:', error);
            throw error;
        }
    }

    async createBackup(description?: string): Promise<BackupInfo> {
        try {
            const backup: BackupInfo = {
                id: `backup_${Date.now()}`,
                type: 'manual',
                size: Math.floor(Math.random() * 1000000000 + 500000000), // Random size
                createdAt: new Date(),
                status: 'creating',
                description
            };

            await addDoc(collection(db, 'backups'), {
                ...backup,
                createdAt: Timestamp.fromDate(backup.createdAt)
            });

            // Simulate backup creation
            setTimeout(async () => {
                await updateDoc(doc(db, 'backups', backup.id), {
                    status: 'completed',
                    downloadUrl: `https://backups.example.com/${backup.id}.zip`
                });
            }, 10000);

            return backup;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    // ==================
    // POSTHOG INTEGRATION
    // ==================

    async getPostHogAnalytics(): Promise<LiveAnalytics> {
        try {
            // Simulate PostHog API call
            return {
                currentVisitors: Math.floor(Math.random() * 100 + 20),
                pageViews: Math.floor(Math.random() * 1000 + 500),
                uniqueVisitors: Math.floor(Math.random() * 300 + 150),
                bounceRate: Math.random() * 40 + 30,
                avgSessionDuration: Math.random() * 300 + 120,
                topPages: [
                    { page: '/landing', views: Math.floor(Math.random() * 200 + 100) },
                    { page: '/login', views: Math.floor(Math.random() * 150 + 50) },
                    { page: '/dashboard', views: Math.floor(Math.random() * 100 + 30) }
                ],
                userActions: {
                    clicks: Math.floor(Math.random() * 500 + 200),
                    formSubmissions: Math.floor(Math.random() * 50 + 10),
                    buttonClicks: Math.floor(Math.random() * 300 + 100)
                },
                realTimeEvents: this.generateRealtimeEvents()
            };
        } catch (error) {
            console.error('Error getting PostHog analytics:', error);
            throw error;
        }
    }

    private generateRealtimeEvents(): any[] {
        const events = [];
        for (let i = 0; i < 10; i++) {
            events.push({
                timestamp: new Date(Date.now() - Math.random() * 3600000),
                event: ['page_view', 'button_click', 'form_submit'][Math.floor(Math.random() * 3)],
                userId: `user_${Math.floor(Math.random() * 1000)}`,
                page: ['/landing', '/login', '/dashboard'][Math.floor(Math.random() * 3)],
                metadata: {}
            });
        }
        return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async syncPostHogData(): Promise<void> {
        try {
            // Simulate PostHog data sync
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('PostHog data synced successfully');
        } catch (error) {
            console.error('Error syncing PostHog data:', error);
            throw error;
        }
    }

    // ===== PSYCHOLOGIST MANAGEMENT METHODS =====

    async updatePsychologistStatus(psychologistId: string, status: 'pending' | 'verified' | 'suspended' | 'rejected'): Promise<void> {
        try {
            const psychologistRef = doc(db, 'users', psychologistId);
            await updateDoc(psychologistRef, {
                verificationStatus: status,
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity({
                type: status === 'verified' ? 'psychologist-approved' : 'error',
                message: `Psychologist status updated to ${status}`,
                psychologistId,
                severity: status === 'rejected' ? 'medium' : 'low'
            });
        } catch (error) {
            console.error('Error updating psychologist status:', error);
            throw error;
        }
    }

    async deletePsychologist(psychologistId: string): Promise<void> {
        try {
            const batch = writeBatch(db);

            // Delete psychologist user record
            const userRef = doc(db, 'users', psychologistId);
            batch.delete(userRef);

            // Delete related sessions
            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('psychologistId', '==', psychologistId)
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            sessionsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            // Log activity
            await this.logActivity({
                type: 'error',
                message: `Psychologist deleted`,
                psychologistId,
                severity: 'medium'
            });
        } catch (error) {
            console.error('Error deleting psychologist:', error);
            throw error;
        }
    }

    async requestMoreInfo(psychologistId: string): Promise<void> {
        try {
            // Send notification to psychologist requesting more information
            await this.sendNotification({
                title: 'Dodatkowe informacje wymagane',
                message: 'Prosimy o uzupełnienie profilu dodatkowymi informacjami w celu weryfikacji.',
                type: 'in-app',
                recipients: [psychologistId],
                metadata: { actionRequired: true }
            });

            // Log activity
            await this.logActivity({
                type: 'error',
                message: `More info requested from psychologist`,
                psychologistId,
                severity: 'low'
            });
        } catch (error) {
            console.error('Error requesting more info:', error);
            throw error;
        }
    }

    async getPsychologistStats(): Promise<any> {
        try {
            const psychologistsQuery = query(
                collection(db, 'users'),
                where('role', '==', 'psychologist')
            );
            const psychologistsSnapshot = await getDocs(psychologistsQuery);
            const psychologists = psychologistsSnapshot.docs.map(doc => doc.data());

            const active = psychologists.filter(p => p['verificationStatus'] === 'verified').length;
            const pending = psychologists.filter(p => p['verificationStatus'] === 'pending').length;

            // Calculate sessions for this month
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessionsThisMonth = sessionsSnapshot.docs.length;

            return {
                active,
                pending,
                newThisMonth: Math.floor(Math.random() * 5 + 1), // Simulated
                avgApprovalTime: 7,
                avgRating: 4.2,
                totalSessions: psychologists.reduce((sum, p) => sum + (p['totalSessions'] || 0), 0),
                sessionsThisMonth
            };
        } catch (error) {
            console.error('Error getting psychologist stats:', error);
            return {
                active: 0,
                pending: 0,
                newThisMonth: 0,
                avgApprovalTime: 7,
                avgRating: 4.2,
                totalSessions: 0,
                sessionsThisMonth: 0
            };
        }
    }

    // ===== MODERATOR MANAGEMENT METHODS =====

    async getModeratorStats(): Promise<any> {
        try {
            const moderatorsQuery = query(
                collection(db, 'users'),
                where('role', '==', 'moderator')
            );
            const moderatorsSnapshot = await getDocs(moderatorsQuery);
            const moderators = moderatorsSnapshot.docs.map(doc => doc.data());

            const active = moderators.filter(m => m['isActive']).length;
            const onlineNow = moderators.filter(m => m['isOnline']).length;

            return {
                active,
                onlineNow,
                moderatedToday: Math.floor(Math.random() * 50 + 10), // Simulated
                pendingReports: Math.floor(Math.random() * 20 + 5), // Simulated
                avgResponseTime: Math.floor(Math.random() * 30 + 10) // Simulated
            };
        } catch (error) {
            console.error('Error getting moderator stats:', error);
            return {
                active: 0,
                onlineNow: 0,
                moderatedToday: 0,
                pendingReports: 0,
                avgResponseTime: 15
            };
        }
    }

    // ===== REPORTS MANAGEMENT METHODS =====

    async approveReport(reportId: string): Promise<void> {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: 'approved',
                approvedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity({
                type: 'error',
                message: `Report approved`,
                metadata: { reportId },
                severity: 'low'
            });
        } catch (error) {
            console.error('Error approving report:', error);
            throw error;
        }
    }

    async escalateReport(reportId: string): Promise<void> {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                priority: 'high',
                escalatedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity({
                type: 'error',
                message: `Report escalated`,
                metadata: { reportId },
                severity: 'medium'
            });
        } catch (error) {
            console.error('Error escalating report:', error);
            throw error;
        }
    }

    async rejectReport(reportId: string): Promise<void> {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: 'rejected',
                rejectedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity({
                type: 'error',
                message: `Report rejected`,
                metadata: { reportId },
                severity: 'low'
            });
        } catch (error) {
            console.error('Error rejecting report:', error);
            throw error;
        }
    }

    // ===== USER PERMISSIONS MANAGEMENT =====

    async enablePsychologistSelection(userId: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                canSelectPsychologist: true,
                updatedAt: Timestamp.now()
            });

            // Create notification for user
            await addDoc(collection(db, 'notifications'), {
                type: 'account_activated',
                title: 'Konto aktywowane',
                message: 'Twoje konto zostało aktywowane. Możesz teraz wybierać psychologów.',
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });

            // Log activity
            await this.logActivity({
                type: 'user-registered',
                message: `Activated psychologist selection for user ${userId}`,
                metadata: { userId },
                severity: 'low'
            });

        } catch (error) {
            console.error('Error enabling psychologist selection:', error);
            throw error;
        }
    }

    async disablePsychologistSelection(userId: string, reason: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                canSelectPsychologist: false,
                updatedAt: Timestamp.now()
            });

            // Create notification for user
            await addDoc(collection(db, 'notifications'), {
                type: 'account_deactivated',
                title: 'Wybór psychologa zablokowany',
                message: `Możliwość wyboru psychologa została zablokowana. Powód: ${reason}`,
                recipientId: userId,
                createdAt: Timestamp.now(),
                isRead: false
            });

            // Log activity
            await this.logActivity({
                type: 'user-blocked',
                message: `Disabled psychologist selection for user ${userId}. Reason: ${reason}`,
                metadata: { userId, reason },
                severity: 'medium'
            });

        } catch (error) {
            console.error('Error disabling psychologist selection:', error);
            throw error;
        }
    }

    async getPendingActivations(): Promise<User[]> {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'user'),
                where('canSelectPsychologist', '==', false),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data['createdAt']?.toDate() || new Date(),
                    updatedAt: data['updatedAt']?.toDate()
                } as User;
            });
        } catch (error) {
            console.error('Error getting pending activations:', error);
            return [];
        }
    }
}
